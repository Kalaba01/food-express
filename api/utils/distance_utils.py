import os
import requests
from dotenv import load_dotenv
import openrouteservice
from openrouteservice import convert

load_dotenv()

OSRM_BASE_URL = os.getenv('OSRM_BASE')

# Calculates the distance between two coordinates based on the vehicle type (car or bike) using the OSRM service
def calculate_route_distance(start_coords, end_coords, vehicle_type):
    profile = 'car' if vehicle_type == 'car' else 'bike'

    print(f"Calculating route distance from {start_coords} to {end_coords} using {vehicle_type}")

    url = f"{OSRM_BASE_URL}/route/v1/{profile}/{start_coords[1]},{start_coords[0]};{end_coords[1]},{end_coords[0]}?overview=false"

    response = requests.get(url)
    data = response.json()

    if response.status_code != 200 or not data.get("routes"):
        raise Exception(f"Error calculating route distance: {data.get('message', 'No routes found')}")

    distance_in_meters = data["routes"][0]["distance"]

    print(f"Calculated route distance: {distance_in_meters} meters")
    return distance_in_meters

# Calculates the travel time between a restaurant and a delivery location using the vehicle type (car or bike) with the OSRM service
def calculate_travel_time(restaurant_coords, delivery_coords, vehicle_type):
    profile = 'car' if vehicle_type == 'car' else 'bike'

    print(f"Calculating travel time from {restaurant_coords} to {delivery_coords} using {vehicle_type}")

    url = f"http://router.project-osrm.org/route/v1/{profile}/{restaurant_coords[1]},{restaurant_coords[0]};{delivery_coords[1]},{delivery_coords[0]}?overview=false"

    response = requests.get(url)
    data = response.json()

    if response.status_code != 200 or not data.get("routes"):
        raise Exception(f"Error calculating travel time: {data.get('message', 'No routes found')}")

    travel_time_seconds = data["routes"][0]["duration"]
    travel_time_minutes = travel_time_seconds / 60

    print(f"Calculated travel time: {travel_time_minutes} minutes")
    return travel_time_minutes
