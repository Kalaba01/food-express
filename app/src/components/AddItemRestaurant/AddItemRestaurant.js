import React from "react";

function AddItemRestaurant({
  currentItem,
  setCurrentItem,
  categories,
  handleAddItem,
  handleAddItemImage,
  closeAddItemPopup,
  t,
}) {
  return (
    <div className="modal">
      <div className="modal-content reduced-padding">
        <span className="close-button" onClick={closeAddItemPopup}>
          &times;
        </span>
        <h2>{t("Restaurant.addItem")}</h2>
        <form onSubmit={handleAddItem}>
          <div className="form-row">
            <label>
              {t("Restaurant.itemName")}
              <input
                type="text"
                value={currentItem?.name || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    name: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              {t("Restaurant.itemDescription")}
              <input
                type="text"
                value={currentItem?.description || ""}
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
                value={currentItem?.price || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    price: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              {t("Restaurant.itemWeight")}
              <input
                type="number"
                value={currentItem?.weight || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    weight: e.target.value,
                  })
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
                value={currentItem?.preparation_time || ""}
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
                value={currentItem?.menuCategory || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    menuCategory: e.target.value,
                  })
                }
                required
              >
                <option value="">{t("Restaurant.selectCategory")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              {t("Restaurant.category")}
              <select
                value={currentItem?.category || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    category: e.target.value,
                  })
                }
                required
              >
                <option value="">{t("Restaurant.selectCategory")}</option>
                <option value="food">{t("Restaurant.food")}</option>
                <option value="drink">{t("Restaurant.drink")}</option>
                <option value="alcohol">{t("Restaurant.alcohol")}</option>
                <option value="other">{t("Restaurant.other")}</option>
              </select>
            </label>
          </div>
          <div className="form-row full-width">
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
          </div>
          <button type="submit" className="save-button">
            {t("Restaurant.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItemRestaurant;
