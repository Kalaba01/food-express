import React, { useState } from "react";
import ReactStars from "react-rating-stars-component";
import axios from "axios";
import "./Rating.css";

function Rating({ orderId, onClose }) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [courierRating, setCourierRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {  
    try {
      const token = localStorage.getItem("token");
      console.log(orderId);
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

      console.log("Rating submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="rating-popup">
      <div className="rating-content">
        <h3>Rate Your Experience</h3>

        <div className="rating-section">
          <label>Rate Restaurant:</label>
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
          <label>Rate Courier:</label>
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
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="rating-actions">
          <button onClick={handleSubmit} className="submit-btn">
            Finish
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rating;
