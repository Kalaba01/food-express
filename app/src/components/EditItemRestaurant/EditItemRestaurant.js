import React from "react";
import { FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

function EditItemRestaurant({
  currentItem,
  setCurrentItem,
  categories,
  currentGalleryImageIndex,
  setCurrentGalleryImageIndex,
  handleDeleteItemImage,
  handleAddItemImage,
  handleEditItem,
  closeEditItemPopup,
  t,
}) {
  return (
    <div className="modal">
      <div className="modal-content reduced-padding">
        <span className="close-button" onClick={closeEditItemPopup}>
          &times;
        </span>
        <h2>{t("Restaurant.editItem")}</h2>
        <form onSubmit={handleEditItem}>
          <div className="form-row">
            <label>
              {t("Restaurant.itemName")}
              <input
                type="text"
                value={currentItem ? currentItem.name : ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              {t("Restaurant.itemDescription")}
              <input
                type="text"
                value={currentItem ? currentItem.description : ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    description: e.target.value,
                  })
                }
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              {t("Restaurant.itemPrice")}
              <input
                type="number"
                step="0.01"
                value={currentItem ? currentItem.price : ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, price: e.target.value })
                }
                required
              />
            </label>
            <label>
              {t("Restaurant.itemWeight")}
              <input
                type="number"
                value={currentItem ? currentItem.weight : ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, weight: e.target.value })
                }
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              {t("Restaurant.itemPrepTime")}
              <input
                type="number"
                value={currentItem ? currentItem.preparation_time : ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    preparation_time: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              {t("Restaurant.menuCategory")}
              <select
                value={currentItem ? currentItem.menuCategory : ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    menuCategory: e.target.value,
                  })
                }
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {t("Restaurant.category")}
            <select
              value={currentItem ? currentItem.category : ""}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  category: e.target.value,
                })
              }
              required
            >
              <option value="food">{t("Restaurant.food")}</option>
              <option value="drink">{t("Restaurant.drink")}</option>
              <option value="alcohol">{t("Restaurant.alcohol")}</option>
              <option value="other">{t("Restaurant.other")}</option>
            </select>
          </label>

          {currentItem && currentItem.images && currentItem.images.length > 0 && (
            <div className="horizontal-gallery">
              <FaArrowLeft
                className="gallery-arrow left"
                onClick={() =>
                  setCurrentGalleryImageIndex((prevIndex) =>
                    prevIndex === 0
                      ? currentItem.images.length - 1
                      : prevIndex - 1
                  )
                }
              />
              <div className="image-container">
                <img
                  src={currentItem.images[currentGalleryImageIndex].image}
                  alt={`Item ${currentGalleryImageIndex + 1}`}
                  className="horizontal-gallery-image"
                />
                <FaTrash
                  className="delete-image-icon"
                  onClick={() => handleDeleteItemImage(currentGalleryImageIndex)}
                />
              </div>
              <FaArrowRight
                className="gallery-arrow right"
                onClick={() =>
                  setCurrentGalleryImageIndex((prevIndex) =>
                    prevIndex === currentItem.images.length - 1
                      ? 0
                      : prevIndex + 1
                  )
                }
              />
            </div>
          )}

          <div className="image-upload-container">
            <label className="image-upload-label">
              {t("Restaurant.uploadImages")}
              <input
                type="file"
                name="images"
                multiple
                onChange={handleAddItemImage}
                className="image-upload-input"
              />
            </label>
          </div>

          <button type="submit" className="save-button">
            {t("Restaurant.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditItemRestaurant;
