import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactStars from "react-rating-stars-component";
import axios from "axios";
import "./Rating.css";

function Rating({ orderId, onClose }) {
  const { t } = useTranslation('global');
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [courierRating, setCourierRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {  
    try {
      const token = localStorage.getItem("token");
      const data = {
        order_id: orderId,
        restaurant_rating: restaurantRating,
        courier_rating: courierRating,
        comments: comment,
      };

      await axios.post(
        "http://localhost:8000/rating/submit",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(t("Rating.successMessage"));
      onClose();
    } catch (error) {
      console.error(t("Rating.errorMessage"), error);
    }
  };

  return (
    <div className="rating-popup">
      <div className="rating-content">
        <h3>{t("Rating.title")}</h3>

        <div className="rating-section">
          <label>{t("Rating.rateRestaurant")}:</label>
          <div className="stars-container">
            <ReactStars
              count={5}
              onChange={setRestaurantRating}
              size={30}
              isHalf={true}
              activeColor="#ffd700"
            />
          </div>
        </div>

        <div className="rating-section">
          <label>{t("Rating.rateCourier")}:</label>
          <div className="stars-container">
            <ReactStars
              count={5}
              onChange={setCourierRating}
              size={30}
              isHalf={true}
              activeColor="#ffd700"
            />
          </div>
        </div>

        <div className="rating-section">
          <label>{t("Rating.comment")}:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="rating-actions">
          <button onClick={handleSubmit} className="submit-btn">
            {t("Rating.finish")}
          </button>
          <button onClick={onClose} className="cancel-btn">
            {t("Rating.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rating;
