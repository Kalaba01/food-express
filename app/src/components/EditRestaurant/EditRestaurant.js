import React from "react";
import { FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

function EditRestaurant({
  restaurantData,
  handleRestaurantChange,
  handleSaveRestaurant,
  handleAddRestaurantImage,
  selectedDay,
  setSelectedDay,
  daysOfWeek,
  setRestaurantData,
  currentImageIndex,
  handlePrevImage,
  handleNextImage,
  openDeletePopup,
  handleRestaurantEdit,
}) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={handleRestaurantEdit}>
          &times;
        </span>
        <h2>Edit Restaurant</h2>
        <form onSubmit={handleSaveRestaurant}>
          <div className="form-row">
            <label>
              Name
              <input
                type="text"
                name="name"
                value={restaurantData.name}
                onChange={handleRestaurantChange}
                required
              />
            </label>
            <label>
              Contact
              <input
                type="text"
                name="contact"
                value={restaurantData.contact}
                onChange={handleRestaurantChange}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Capacity
              <select
                name="capacity"
                value={restaurantData.capacity}
                onChange={handleRestaurantChange}
                required
              >
                <option value="normal">Normal</option>
                <option value="busy">Busy</option>
                <option value="crowded">Crowded</option>
              </select>
            </label>
            <label>
              Category
              <input
                type="text"
                name="category"
                value={restaurantData.category || ""}
                onChange={handleRestaurantChange}
                required
              />
            </label>
          </div>

          <div className="operating-hours-section">
            <h3>Operating Hours</h3>
            <div className="select-day-row">
              <label>Select Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              >
                {daysOfWeek.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {restaurantData.operating_hours[selectedDay] && (
              <div className="form-row operating-hours-input">
                <label>{daysOfWeek[selectedDay]}</label>
                <input
                  type="time"
                  value={restaurantData.operating_hours[selectedDay].opening_time}
                  onChange={(e) =>
                    setRestaurantData((prevData) => {
                      const newHours = [...prevData.operating_hours];
                      newHours[selectedDay].opening_time = e.target.value;
                      return { ...prevData, operating_hours: newHours };
                    })
                  }
                />
                <span> - </span>
                <input
                  type="time"
                  value={restaurantData.operating_hours[selectedDay].closing_time}
                  onChange={(e) =>
                    setRestaurantData((prevData) => {
                      const newHours = [...prevData.operating_hours];
                      newHours[selectedDay].closing_time = e.target.value;
                      return { ...prevData, operating_hours: newHours };
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="restaurant-images-gallery">
            {restaurantData.images.length > 0 && (
              <>
                {restaurantData.images.length > 1 && (
                  <FaArrowLeft className="gallery-arrow left" onClick={handlePrevImage} />
                )}
                <div className="image-container">
                  <img
                    src={`data:image/jpeg;base64,${restaurantData.images[currentImageIndex].image}`}
                    alt={`Restaurant ${currentImageIndex + 1}`}
                    className="gallery-image"
                  />
                  <FaTrash
                    className="delete-image-icon"
                    onClick={() => openDeletePopup("restaurantImage", currentImageIndex)}
                  />
                </div>
                {restaurantData.images.length > 1 && (
                  <FaArrowRight className="gallery-arrow right" onClick={handleNextImage} />
                )}
              </>
            )}
          </div>

          <div className="image-upload-container">
            <label className="image-upload-label">
              Images
              <input
                type="file"
                name="images"
                multiple
                onChange={handleAddRestaurantImage}
                className="image-upload-input"
              />
            </label>
          </div>

          <button type="submit" className="save-button">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditRestaurant;
