import math

# Calculates the average rating
def calculate_average_rating(total_rating: float, rating_count: int) -> float:
    if rating_count == 0:
        return 0
    average = total_rating / rating_count
    return round(average * 2) / 2
