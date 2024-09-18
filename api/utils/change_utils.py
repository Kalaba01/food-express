import json

DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05]

# Determines if the courier can return the required change and provides the optimal denominations to return if possible
def get_optimal_change(required_change: float, courier_wallet: str) -> tuple[bool, list]:
    money_data = json.loads(courier_wallet)

    available_denominations = []
    for denomination, quantity in money_data.items():
        available_denominations.extend([round(float(denomination[:-3]), 2)] * quantity)
    available_denominations.sort(reverse=True)

    print(f"Available denominations after sorting: {available_denominations}")

    total_available = sum(available_denominations)
    print(f"Total available amount: {total_available}, Required change: {required_change}")

    if total_available < required_change:
        print("Insufficient funds to return the required change.")
        return False, None

    change_to_return = {}
    remaining_change = round(required_change, 2)
    print(f"Starting with remaining change: {remaining_change}")

    for coin in available_denominations:
        print(f"Trying to use denomination: {coin}")
        while remaining_change >= coin:
            remaining_change = round(remaining_change - coin, 2)
            key = f"{int(coin)}BAM"
            change_to_return[key] = change_to_return.get(key, 0) + 1

        if remaining_change == 0:
            print("Exact change can be returned.")
            break

    if remaining_change == 0:
        formatted_change_to_return = [f"{key} x {quantity}" for key, quantity in change_to_return.items()]
        return True, formatted_change_to_return
    else:
        print("Cannot return exact change.")
        return False, None

# Calculates the amount of change required based on the order total and the payment amount provided
def calculate_required_change(order_total, payment_amount):
    required_change = payment_amount - order_total
    print(f"Calculated required change: {required_change} from payment amount: {payment_amount} and order total: {order_total}")
    return required_change
