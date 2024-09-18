import json
import pytz
from datetime import timedelta, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.models import (
    OrderQueue,
    OrderQueueStatusEnum,
    Order,
    OrderItem,
    Item,
    Courier,
    CourierStatus,
    VehicleType,
    OrderAssignment,
    OrderAssignmentStatus,
    PaymentMethod,
    ItemCategory,
    Chat,
    Conversation,
    Notification,
)
from utils.distance_utils import calculate_route_distance, calculate_travel_time
from utils.change_utils import get_optimal_change, calculate_required_change

# Assigns pending orders to available couriers
async def assign_orders_to_couriers(db: Session):
    orders = (
        db.query(OrderQueue)
        .filter(OrderQueue.status == OrderQueueStatusEnum.pending)
        .all()
    )

    if not orders:
        print("No pending orders found.")
        return

    print(f"Found {len(orders)} pending orders in the queue.")

    # Loop through each order in the queue
    for order_queue in orders:
        order = db.query(Order).filter(Order.id == order_queue.order_id).first()
        if not order:
            print(f"Order with ID {order_queue.order_id} not found.")
            continue

        # Check if the order contains alcohol
        contains_alcohol = (
            db.query(Item.category)
            .join(OrderItem, Item.id == OrderItem.item_id)
            .filter(
                OrderItem.order_id == order.id, Item.category == ItemCategory.alcohol
            )
            .count()
            > 0
        )

        print(f"Order ID {order.id} contains alcohol: {contains_alcohol}")

        # Find couriers who are available and meet the halal/alcohol criteria
        if contains_alcohol:
            couriers = (
                db.query(Courier)
                .filter(
                    Courier.status == CourierStatus.online,
                    Courier.halal_mode == False,
                    Courier.restaurant_id == order.restaurant_id,
                )
                .all()
            )
            print(
                f"Found {len(couriers)} online couriers not in halal mode for restaurant ID {order.restaurant_id}."
            )
        else:
            couriers = (
                db.query(Courier)
                .filter(
                    Courier.status == CourierStatus.online,
                    Courier.restaurant_id == order.restaurant_id,
                )
                .all()
            )
            print(
                f"Found {len(couriers)} online couriers for restaurant ID {order.restaurant_id}."
            )

        # Prepare lists for couriers meeting various levels of criteria
        couriers_five_criteria = []
        couriers_four_criteria = []
        couriers_three_criteria = []
        couriers_two_criteria = []

        # Evaluate each courier based on weight, distance, and change criteria
        for courier in couriers:
            # Calculate the delivery distance based on the courier's vehicle type
            distance = calculate_route_distance(
                (order.restaurant.latitude, order.restaurant.longitude),
                (order.delivery_latitude, order.delivery_longitude),
                courier.vehicle_type.value,
            )

            # Check if the courier meets weight and distance criteria
            meets_weight = (
                courier.vehicle_type == VehicleType.car or order_queue.weight <= 6000
            )


            meets_distance = (
                courier.vehicle_type == VehicleType.bike and distance <= 5000
            ) or (courier.vehicle_type == VehicleType.car and distance > 5000)

            # If the payment method is cash, check if the courier can return the correct change
            meets_change = True
            optimal_change = None

            if order.payment_method == PaymentMethod.cash:
                print(
                    f"Order {order.id} is paid in cash. Calculating if courier can return the exact change."
                )

                if courier.wallet_details:
                    money_data = json.loads(order.money)
                    total_money = sum(
                        float(denomination[:-3]) * quantity
                        for denomination, quantity in money_data.items()
                    )

                    print(f"Total money given by customer: {total_money}")

                    required_change = calculate_required_change(
                        order.total_price, total_money
                    )
                    meets_change, optimal_change = get_optimal_change(
                        required_change, courier.wallet_details
                    )
                    print(
                        f"Courier {courier.id} can return exact change: {meets_change}"
                    )
                    if meets_change:
                        print(
                            f"Optimal change for courier {courier.id} to return: {optimal_change}"
                        )
                else:
                    meets_change = False
                    print(
                        f"Courier {courier.id} does not have wallet details, cannot return change."
                    )

            # Count how many criteria the courier meets
            criteria_count = sum([meets_weight, meets_distance, meets_change])

            print(f"Evaluating Courier ID {courier.id}:")
            print(f"  - Meets weight criteria: {meets_weight}")
            print(f"  - Meets distance criteria: {meets_distance}")
            print(f"  - Meets change criteria: {meets_change}")
            print(f"  - Total criteria met: {criteria_count}")

             # Add courier to the corresponding list based on criteria met
            if criteria_count == 3:
                couriers_five_criteria.append(courier)
            elif criteria_count == 2:
                couriers_four_criteria.append(courier)
            elif criteria_count == 1:
                couriers_three_criteria.append(courier)
            else:
                couriers_two_criteria.append(courier)

        # Assign the best suitable courier based on the criteria
        assigned_courier = None
        if couriers_five_criteria:
            assigned_courier = couriers_five_criteria[0]
            print(f"Assigned courier ID {assigned_courier.id} meeting 5 criteria.")
        elif couriers_four_criteria:
            assigned_courier = couriers_four_criteria[0]
            print(f"Assigned courier ID {assigned_courier.id} meeting 4 criteria.")
        elif couriers_three_criteria:
            assigned_courier = couriers_three_criteria[0]
            print(f"Assigned courier ID {assigned_courier.id} meeting 3 criteria.")
        elif couriers_two_criteria:
            assigned_courier = couriers_two_criteria[0]
            print(f"Assigned courier ID {assigned_courier.id} meeting 2 criteria.")

        # If a courier is assigned, calculate travel time and update order and courier status
        if assigned_courier:
            travel_time = calculate_travel_time(
                (order.restaurant.latitude, order.restaurant.longitude),
                (order.delivery_latitude, order.delivery_longitude),
                assigned_courier.vehicle_type.value,
            )
            travel_time_delta = timedelta(minutes=travel_time)

            estimated_delivery_time = (
                order_queue.estimated_preparation_time + travel_time_delta
            )

            new_assignment = OrderAssignment(
                order_id=order.id,
                courier_id=assigned_courier.id,
                status=OrderAssignmentStatus.in_delivery,
                estimated_delivery_time=estimated_delivery_time,
                optimal_change=json.dumps(optimal_change) if optimal_change else None,
            )

            db.add(new_assignment)
            order_queue.status = OrderQueueStatusEnum.assigned
            assigned_courier.status = CourierStatus.busy

            local_timezone = pytz.timezone("Europe/Sarajevo")
            local_now = datetime.now(local_timezone)

            message = f"You have a new order to deliver from {order.restaurant.name}."
            new_notification = Notification(
                user_id=assigned_courier.user_id,
                message=message,
                read=False,
                created_at=local_now.replace(tzinfo=None),
            )
            db.add(new_notification)

            conversation = (
                db.query(Conversation)
                .filter(
                    (Conversation.participant1_id == assigned_courier.user_id)
                    & (Conversation.participant2_id == order.customer_id)
                )
                .first()
            )

            if not conversation:
                conversation = Conversation(
                    participant1_id=assigned_courier.user_id,
                    participant2_id=order.customer_id,
                )
                db.add(conversation)
                db.flush()

            # Send a message to the customer informing about the courier assignment
            message_content = "Dear customer, your order has been assigned to me, and I will be delivering it shortly. Thank you for your patience!"
            new_chat = Chat(
                sender_id=assigned_courier.user_id,
                receiver_id=order.customer_id,
                message=message_content,
                conversation_id=conversation.id,
                created_at=local_now.replace(tzinfo=None),
            )
            db.add(new_chat)

            db.commit()
            print(
                f"Order ID {order.id} assigned to courier ID {assigned_courier.id} with optimal change: {optimal_change}."
            )
        else:
            print(f"No suitable courier found for order ID {order.id}.")
