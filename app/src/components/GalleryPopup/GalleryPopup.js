import React, { useState } from "react";
import "./GalleryPopup.css";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

function GalleryPopup({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
          <FaTimes className="popup-close" onClick={onClose} />
        <div className="popup-gallery">
            <FaChevronLeft className="popup-gallery-arrow popup-gallery-left-arrow" onClick={goToPrevious} />
          <div className="popup-gallery-image-wrapper">
            <img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="popup-gallery-image"
            />
          </div>
            <FaChevronRight className="popup-gallery-arrow popup-gallery-right-arrow" onClick={goToNext} />
        </div>
      </div>
    </div>
  );
}

export default GalleryPopup;
