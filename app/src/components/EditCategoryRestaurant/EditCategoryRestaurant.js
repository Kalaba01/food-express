import React from "react";

function EditCategoryRestaurant({
  currentCategory,
  setCurrentCategory,
  handleSaveCategory,
  closeEditCategoryPopup,
  t
}) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeEditCategoryPopup}>
          &times;
        </span>
        <h2>{t("Restaurant.editCategory")}</h2>
        <form onSubmit={handleSaveCategory}>
          <label>
            {t("Restaurant.categoryName")}
            <input
              type="text"
              value={currentCategory ? currentCategory.name : ""}
              onChange={(e) =>
                setCurrentCategory({
                  ...currentCategory,
                  name: e.target.value,
                })
              }
              required
            />
          </label>
          <label>
            {t("Restaurant.categoryDescription")}
            <input
              type="text"
              value={currentCategory ? currentCategory.description : ""}
              onChange={(e) =>
                setCurrentCategory({
                  ...currentCategory,
                  description: e.target.value,
                })
              }
              required
            />
          </label>
          <button type="submit" className="save-button">
            {t("Restaurant.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditCategoryRestaurant;
