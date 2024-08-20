import React, { useState } from "react";
import "./Gallery.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function Gallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="custom-gallery-container">
      <div className="custom-gallery-image-wrapper">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="custom-gallery-image"
        />
      </div>
        <FaArrowLeft className="custom-gallery-arrow custom-gallery-left-arrow" onClick={goToPrevious}/>
        <FaArrowRight className="custom-gallery-arrow custom-gallery-right-arrow" onClick={goToNext} />
    </div>
  );
}

export default Gallery;
