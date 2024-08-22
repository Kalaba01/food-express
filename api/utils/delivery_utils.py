from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.models import RestaurantDeliveryZone, DeliveryZone

def is_in_delivery_zone(db: Session, restaurant_id: int, latitude: float, longitude: float) -> bool:
    try:
        zones = db.query(RestaurantDeliveryZone).filter_by(restaurant_id=restaurant_id).all()

        for zone in zones:
            delivery_zone = db.query(DeliveryZone).filter_by(id=zone.delivery_zone_id).first()

            if delivery_zone:
                min_latitude = min(delivery_zone.point1_latitude, delivery_zone.point2_latitude,
                                   delivery_zone.point3_latitude, delivery_zone.point4_latitude)
                max_latitude = max(delivery_zone.point1_latitude, delivery_zone.point2_latitude,
                                   delivery_zone.point3_latitude, delivery_zone.point4_latitude)
                min_longitude = min(delivery_zone.point1_longitude, delivery_zone.point2_longitude,
                                    delivery_zone.point3_longitude, delivery_zone.point4_longitude)
                max_longitude = max(delivery_zone.point1_longitude, delivery_zone.point2_longitude,
                                    delivery_zone.point3_longitude, delivery_zone.point4_longitude)

                if min_latitude <= latitude <= max_latitude and min_longitude <= longitude <= max_longitude:
                    return True
        return False

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while checking the delivery zone: {str(e)}"
        )
