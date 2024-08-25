import json

# Definišemo dostupne apoene u BAM
DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05]

def can_return_exact_change(required_change: float, courier_wallet: str) -> bool:
    result, _ = get_optimal_change(required_change, courier_wallet)
    return result

def get_optimal_change(required_change: float, courier_wallet: str) -> tuple[bool, dict]:
    money_data = json.loads(courier_wallet)

    # Kreiraj listu dostupnih apoena
    available_denominations = []
    for denomination, quantity in money_data.items():
        available_denominations.extend([round(float(denomination[:-3]), 2)] * quantity)
    available_denominations.sort(reverse=True)

    # Ispis dostupnih apoena nakon sortiranja
    print(f"Available denominations after sorting: {available_denominations}")

    # Proveri da li je zbir svih apoena u novčaniku dovoljan za traženi kusur
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
            change_to_return[coin] = change_to_return.get(coin, 0) + 1
            print(f"Remaining change after using {coin}: {remaining_change}")

        if remaining_change == 0:
            print("Exact change can be returned.")
            break

    if remaining_change == 0:
        print(f"Optimal change found: {change_to_return}")
        return True, change_to_return
    else:
        print("Cannot return exact change.")
        return False, None

def calculate_required_change(order_total, payment_amount):
    required_change = payment_amount - order_total
    print(f"Calculated required change: {required_change} from payment amount: {payment_amount} and order total: {order_total}")
    return required_change
