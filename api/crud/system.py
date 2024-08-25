import json
from datetime import timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.models import (
    OrderQueue, OrderQueueStatusEnum, Order, OrderItem, Item, 
    Courier, CourierStatus, VehicleType, OrderAssignment, 
    OrderAssignmentStatus, PaymentMethod, ItemCategory
)
from utils.distance_utils import calculate_route_distance, calculate_travel_time
from utils.change_utils import get_optimal_change, calculate_required_change

async def assign_orders_to_couriers(db: Session):
    orders = db.query(OrderQueue).filter(OrderQueue.status == OrderQueueStatusEnum.pending).all()

    if not orders:
        print("No pending orders found.")
        return
    
    print(f"Found {len(orders)} pending orders in the queue.")

    for order_queue in orders:
        order = db.query(Order).filter(Order.id == order_queue.order_id).first()
        if not order:
            print(f"Order with ID {order_queue.order_id} not found.")
            continue

        # Provjeri da li narudžba sadrži alkohol
        contains_alcohol = db.query(Item.category).join(OrderItem, Item.id == OrderItem.item_id) \
            .filter(OrderItem.order_id == order.id, Item.category == ItemCategory.alcohol).count() > 0
        
        print(f"Order ID {order.id} contains alcohol: {contains_alcohol}")

        # Filtriraj kurire koji su online i zadovoljavaju halal uslov, kao i kurire koji dostavljaju za taj restoran
        if contains_alcohol:
            couriers = db.query(Courier).filter(
                Courier.status == CourierStatus.online,
                Courier.halal_mode == False,
                Courier.restaurant_id == order.restaurant_id
            ).all()
            print(f"Found {len(couriers)} online couriers not in halal mode for restaurant ID {order.restaurant_id}.")
        else:
            couriers = db.query(Courier).filter(
                Courier.status == CourierStatus.online,
                Courier.restaurant_id == order.restaurant_id
            ).all()
            print(f"Found {len(couriers)} online couriers for restaurant ID {order.restaurant_id}.")

        # Inicijalizuj liste za kurire po kriterijumima
        couriers_five_criteria = []
        couriers_four_criteria = []
        couriers_three_criteria = []
        couriers_two_criteria = []

        # Izračunaj udaljenost između restorana i adrese dostave
        distance = calculate_route_distance(
            (order.restaurant.latitude, order.restaurant.longitude),
            (order.delivery_latitude, order.delivery_longitude),
            'car'  # Tip vozila se menja ispod
        )

        for courier in couriers:
            meets_weight = (courier.vehicle_type == VehicleType.car or order_queue.weight <= 6000)  # 6 kg u gramima
            meets_distance = (
                (courier.vehicle_type == VehicleType.bike and distance <= 5000) or  # 5 km u metrima
                (courier.vehicle_type == VehicleType.car and distance > 5000)
            )

            meets_change = True
            optimal_change = None

            if order.payment_method == PaymentMethod.cash:
                print(f"Order {order.id} is paid in cash. Calculating if courier can return the exact change.")
                money_data = json.loads(order.money)
                total_money = sum(float(denomination[:-3]) * quantity for denomination, quantity in money_data.items())

                print(f"Total money given by customer: {total_money}")

                required_change = calculate_required_change(order.total_price, total_money)
                meets_change, optimal_change = get_optimal_change(required_change, courier.wallet_details)
                print(f"Courier {courier.id} can return exact change: {meets_change}")
                if meets_change:
                    print(f"Optimal change for courier {courier.id} to return: {optimal_change}")

            criteria_count = sum([meets_weight, meets_distance, meets_change])

            # Dodavanje detaljnog ispisa kriterijuma
            print(f"Evaluating Courier ID {courier.id}:")
            print(f"  - Meets weight criteria: {meets_weight}")
            print(f"  - Meets distance criteria: {meets_distance}")
            print(f"  - Meets change criteria: {meets_change}")
            print(f"  - Total criteria met: {criteria_count}")

            if criteria_count == 3:
                couriers_five_criteria.append(courier)
            elif criteria_count == 2:
                couriers_four_criteria.append(courier)
            elif criteria_count == 1:
                couriers_three_criteria.append(courier)
            else:
                couriers_two_criteria.append(courier)

        # Odaberi najboljeg kurira prema prioritetu kriterijuma
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

        if assigned_courier:
            # Konvertuj vreme putovanja iz minuta u timedelta
            travel_time = calculate_travel_time(
                (order.restaurant.latitude, order.restaurant.longitude),
                (order.delivery_latitude, order.delivery_longitude),
                assigned_courier.vehicle_type.value
            )
            travel_time_delta = timedelta(minutes=travel_time)

            # Kreiraj unos u order_assignments tabeli, sada sa optimalnim kusurom
            estimated_delivery_time = order_queue.estimated_preparation_time + travel_time_delta
            
            new_assignment = OrderAssignment(
                order_id=order.id,
                courier_id=assigned_courier.id,
                status=OrderAssignmentStatus.in_delivery,  # Status postavljen na 'in_delivery'
                estimated_delivery_time=estimated_delivery_time,
                optimal_change=json.dumps(optimal_change) if optimal_change else None  # Dodavanje optimalnog kusura
            )
            db.add(new_assignment)
            order_queue.status = OrderQueueStatusEnum.assigned
            assigned_courier.status = CourierStatus.busy
            db.commit()
            print(f"Order ID {order.id} assigned to courier ID {assigned_courier.id} with optimal change: {optimal_change}.")
        else:
            print(f"No suitable courier found for order ID {order.id}.")
