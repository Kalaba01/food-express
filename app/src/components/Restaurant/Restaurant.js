import React, { useEffect, useState } from "react";
import {
  Header,
  LookupTable,
  ConfirmDelete,
  NotificationPopup,
} from "../index";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaArrowLeft,
  FaArrowRight,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../LookupTable/LookupTable.css";

function Restaurant({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState({
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    contact: "",
    capacity: "",
    images: [],
    totalRating: null,
  });
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
  });
  const [currentItem, setCurrentItem] = useState(null);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [currentGalleryItem, setCurrentGalleryItem] = useState(null);
  const [currentGalleryImageIndex, setCurrentGalleryImageIndex] = useState(0);
  const [deleteType, setDeleteType] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showNotification = (message, type = "info") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000); // Notification disappears after 3 seconds
  };

  const fetchRestaurant = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8000/restaurants/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRestaurant(response.data);
      setRestaurantData({
        name: response.data.name,
        contact: response.data.contact,
        capacity: response.data.capacity,
        images: response.data.images || [],
        totalRating:
          response.data.rating_count > 0
            ? response.data.total_rating / response.data.rating_count
            : null,
      });
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      const token = localStorage.getItem("token");
      try {
        const categoriesResponse = await axios.get(
          `http://localhost:8000/restaurants/${id}/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(categoriesResponse.data || []);

        fetchItems();
      } catch (error) {
        console.error("Error fetching categories or items:", error);
      }
    };

    fetchCategoriesAndItems();
  }, [id]);

  const openImageGalleryPopup = (item) => {
    if (item && item.images && item.images.length > 0) {
      setCurrentGalleryItem(item);
      setCurrentGalleryImageIndex(0);
      setIsImageGalleryOpen(true);
    } else {
      setCurrentGalleryItem({ images: [] });
      setCurrentGalleryImageIndex(0);
      setIsImageGalleryOpen(true);
    }
  };

  const closeImageGalleryPopup = () => {
    setIsImageGalleryOpen(false);
    setCurrentGalleryItem(null);
  };

  const handleNextGalleryImage = () => {
    setCurrentGalleryImageIndex((prevIndex) =>
      prevIndex === currentGalleryItem.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevGalleryImage = () => {
    setCurrentGalleryImageIndex((prevIndex) =>
      prevIndex === 0 ? currentGalleryItem.images.length - 1 : prevIndex - 1
    );
  };

  const openEditCategoryPopup = (category) => {
    setCurrentCategory(category);
    setIsEditCategoryOpen(true);
  };

  const closeEditCategoryPopup = () => {
    setCurrentCategory(null);
    setIsEditCategoryOpen(false);
  };

  const openAddCategoryPopup = () => {
    setCurrentCategory({ name: "" });
    setIsAddCategoryOpen(true);
  };

  const closeAddCategoryPopup = () => {
    setIsAddCategoryOpen(false);
  };

  const openEditItemPopup = (item) => {
    setCurrentItem(item);
    setCurrentGalleryImageIndex(0);
    setIsEditItemOpen(true);
  };

  const closeEditItemPopup = () => {
    setCurrentItem(null);
    setIsEditItemOpen(false);
  };

  const openAddItemPopup = () => {
    setIsAddItemOpen(true);
  };

  const closeAddItemPopup = () => {
    setIsAddItemOpen(false);
  };

  const openDeletePopup = (type, item) => {
    setDeleteType(type);
    if (type === "item") {
      setItemToDelete(item);
    } else if (type === "category") {
      setCategoryToDelete(item);
    } else if (type === "restaurantImage") {
      setImageToDelete(item);
    } else if (type === "itemImage") {
      setImageToDelete(item);
    }
    setDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setItemToDelete(null);
    setCategoryToDelete(null);
    setImageToDelete(null);
    setDeletePopupOpen(false);
  };

  const handleRestaurantEdit = () => {
    setEditingRestaurant(!editingRestaurant);
  };

  const handleRestaurantChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const imageUploads = restaurantData.images
        .filter((image) => image.file)
        .map(async (image) => {
          const formData = new FormData();
          formData.append("file", image.file);

          const response = await axios.post(
            `http://localhost:8000/restaurants/${id}/images`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          return response.data.image;
        });

      const uploadedImages = await Promise.all(imageUploads);

      setRestaurantData((prevData) => ({
        ...prevData,
        images: [
          ...prevData.images.filter((image) => !image.file),
          ...uploadedImages,
        ],
      }));

      await axios.put(
        `http://localhost:8000/restaurants/${id}`,
        {
          ...restaurantData,
          images: [
            ...restaurantData.images.filter((image) => !image.file),
            ...uploadedImages.map((img) => img.id),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingRestaurant(false);
    } catch (error) {
      console.error("Error saving restaurant data:", error);
    }
  };

  const handleAddRestaurantImage = (e) => {
    const files = e.target.files;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectURL = URL.createObjectURL(file);
      newImages.push({ file, objectURL });
    }

    setRestaurantData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newImages],
    }));

    if (isEditItemOpen || isAddItemOpen) {
      setCurrentItem((prevItem) => ({
        ...prevItem,
        images: [...(prevItem.images || []), ...newImages],
      }));
    }
  };

  const handleAddItemImage = (e) => {
    const files = e.target.files;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectURL = URL.createObjectURL(file);
      newImages.push({ file, objectURL });
    }

    setCurrentItem((prevItem) => ({
      ...prevItem,
      images: [...(prevItem.images || []), ...newImages],
    }));
  };

  const handleConfirmDeleteRestaurantImage = async () => {
    const token = localStorage.getItem("token");

    const imageId = restaurantData.images[imageToDelete]?.id;

    if (imageId) {
      try {
        await axios.delete(
          `http://localhost:8000/restaurants/${id}/images/${imageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedImages = restaurantData.images.filter(
          (_, index) => index !== imageToDelete
        );

        let newIndex = currentImageIndex;
        if (currentImageIndex >= updatedImages.length) {
          newIndex = updatedImages.length - 1;
        }

        setRestaurantData((prevData) => ({
          ...prevData,
          images: updatedImages,
        }));
        setCurrentImageIndex(newIndex);

        await fetchRestaurant();

        closeDeletePopup();

        showNotification(t("Restaurant.imageDeleted"), "success");
      } catch (error) {
        console.error("Error deleting image:", error);
        showNotification(t("Restaurant.errorDeletingImage"), "error");
      }
    } else {
      console.error("Image ID is undefined or invalid, cannot delete.");
      showNotification(t("Restaurant.invalidImageId"), "error");
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (currentCategory && currentCategory.id) {
        // Update existing category
        await axios.put(
          `http://localhost:8000/restaurants/${id}/categories/${currentCategory.id}`,
          {
            name: currentCategory.name,
            description: currentCategory.description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(
          categories.map((cat) =>
            cat.id === currentCategory.id
              ? {
                  ...cat,
                  name: currentCategory.name,
                  description: currentCategory.description,
                }
              : cat
          )
        );
        showNotification(t("Restaurant.categoryUpdated"), "success");
      } else {
        // Add new category
        const response = await axios.post(
          `http://localhost:8000/restaurants/${id}/categories`,
          {
            name: currentCategory.name,
            description: currentCategory.description,
            restaurant_id: id, // Dodaj restaurant_id u zahtev
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories([...categories, response.data]);
        showNotification(t("Restaurant.categoryAdded"), "success");
      }
      closeAddCategoryPopup();
    } catch (error) {
      console.error("Error saving category:", error);
       showNotification(t("Restaurant.errorSavingCategory"), "error");
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let itemId = currentItem?.id;

      if (!itemId) {
        const response = await axios.post(
          `http://localhost:8000/restaurants/${id}/items`,
          {
            name: currentItem?.name,
            description: currentItem?.description,
            price: parseFloat(currentItem?.price),
            weight: parseInt(currentItem?.weight, 10),
            preparation_time: parseInt(currentItem?.preparation_time, 10),
            restaurant_id: id,
            menu_category_id: categories.find(
              (category) => category.name === currentItem?.menuCategory
            )?.id,
            category: currentItem?.category,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        itemId = response.data.id;
        setItems([...items, response.data]);
      }

      const imageUploads = currentItem.images
        .filter((image) => image.file)
        .map(async (image) => {
          const formData = new FormData();
          formData.append("file", image.file);

          const response = await axios.post(
            `http://localhost:8000/items/${itemId}/images`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          return response.data.image;
        });

      await Promise.all(imageUploads);

      await fetchItems();

      closeEditItemPopup();
      closeAddItemPopup();

      showNotification(t("Restaurant.itemAdded"), "success");
    } catch (error) {
      console.error("Error saving item:", error);
      showNotification(t("Restaurant.errorSavingItem"), "error");
    }
  };

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    try {
      const itemsResponse = await axios.get(
        `http://localhost:8000/restaurants/${id}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItems(itemsResponse.data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      if (deleteType === "item" && itemToDelete) {
        await axios.delete(
          `http://localhost:8000/restaurants/${id}/items/${itemToDelete.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setItems(items.filter((item) => item.id !== itemToDelete.id));
        showNotification(t("Restaurant.itemDeleted"), "success");
      } else if (deleteType === "category" && categoryToDelete) {
        await axios.delete(
          `http://localhost:8000/restaurants/${id}/categories/${categoryToDelete.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(
          categories.filter((cat) => cat.id !== categoryToDelete.id)
        );
        showNotification(t("Restaurant.categoryDeleted"), "success");
      } else if (deleteType === "restaurantImage" && imageToDelete !== null) {
        await handleConfirmDeleteRestaurantImage();
      } else if (deleteType === "itemImage" && imageToDelete !== null) {
        await handleConfirmDeleteItemImage();
      }
      closeDeletePopup();
    } catch (error) {
      console.error("Error deleting item, category or image:", error);
      showNotification(t("Restaurant.errorDeletingItem"), "error");
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {halfStar && <FaStarHalfAlt />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} />
        ))}
      </div>
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === restaurant.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? restaurant.images.length - 1 : prevIndex - 1
    );
  };

  const handleDeleteItemImage = (imageIndex) => {
    setImageToDelete(imageIndex);
    setDeleteType("itemImage");
    setDeletePopupOpen(true);
  };

  const handleConfirmDeleteItemImage = async () => {
    const token = localStorage.getItem("token");

    const imageId = currentItem.images[imageToDelete]?.id;

    if (imageId) {
      try {
        await axios.delete(
          `http://localhost:8000/items/${currentItem.id}/images/${imageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedImages = currentItem.images.filter(
          (_, index) => index !== imageToDelete
        );

        let newIndex = currentGalleryImageIndex;
        if (currentGalleryImageIndex >= updatedImages.length) {
          newIndex = updatedImages.length - 1;
        }

        setCurrentItem((prevItem) => ({
          ...prevItem,
          images: updatedImages,
        }));
        setCurrentGalleryImageIndex(newIndex);

        closeDeletePopup();
        showNotification(t("Restaurant.itemImageDeleted"), "success");
      } catch (error) {
        console.error("Error deleting image:", error);
        showNotification(t("Restaurant.errorDeletingItemImage"), "error");
      }
    } else {
      console.error("Image ID is undefined or invalid, cannot delete.");
      showNotification(t("Restaurant.invalidImageId"), "error");
    }
  };

  if (!restaurant) {
    return <p>{t("Restaurant.loading")}</p>;
  }

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="owner"
      />
      <div className="restaurant-container">
        <h1 className="restaurant-name">{restaurant.name}</h1>
        <div className="restaurant-rating">
          {restaurantData.totalRating ? (
            renderStars(restaurantData.totalRating)
          ) : (
            <p style={{ color: "#FFD700" }}>{t("Restaurant.noRating")}</p>
          )}
        </div>
        <p className="restaurant-location">
          {restaurant.city}, {restaurant.address}
        </p>
        <p className="restaurant-contact">{restaurant.contact}</p>
        <p className="restaurant-capacity">
          {t("Restaurant.capacity")}: {restaurant.capacity}
        </p>
        <p className="restaurant-category">
          {t("Restaurant.category")}: {restaurant.category}
        </p>

        <div className="restaurant-images">
          {restaurant.images.length > 0 ? (
            <div className="restaurant-images-gallery">
              <FaArrowLeft
                className="gallery-arrow left"
                onClick={handlePrevImage}
              />
              <img
                src={`data:image/jpeg;base64,${restaurant.images[currentImageIndex].image}`}
                alt={`Restaurant ${currentImageIndex + 1}`}
                className="gallery-image"
              />
              <FaArrowRight
                className="gallery-arrow right"
                onClick={handleNextImage}
              />
            </div>
          ) : (
            <p className="no-images">{t("Restaurant.noImages")}</p>
          )}
        </div>

        <button onClick={handleRestaurantEdit}>
          {editingRestaurant ? t("Restaurant.cancel") : t("Restaurant.edit")}
        </button>

        {editingRestaurant && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-button" onClick={handleRestaurantEdit}>
                &times;
              </span>
              <h2>{t("Restaurant.editRestaurant")}</h2>
              <form onSubmit={handleSaveRestaurant}>
                <label>
                  {t("Restaurant.name")}
                  <input
                    type="text"
                    name="name"
                    value={restaurantData.name}
                    onChange={handleRestaurantChange}
                    required
                  />
                </label>
                <label>
                  {t("Restaurant.contact")}
                  <input
                    type="text"
                    name="contact"
                    value={restaurantData.contact}
                    onChange={handleRestaurantChange}
                    required
                  />
                </label>
                <label>
                  {t("Restaurant.capacity")}
                  <select
                    name="capacity"
                    value={restaurantData.capacity}
                    onChange={handleRestaurantChange}
                    required
                  >
                    <option value="normal">{t("Restaurant.normal")}</option>
                    <option value="busy">{t("Restaurant.busy")}</option>
                    <option value="crowded">{t("Restaurant.crowded")}</option>
                  </select>
                </label>

                <div className="restaurant-images-gallery">
                  {restaurantData.images.length > 0 && (
                    <>
                      {restaurantData.images.length > 1 && (
                        <FaArrowLeft
                          className="gallery-arrow left"
                          onClick={handlePrevImage}
                        />
                      )}
                      <div className="image-container">
                        <img
                          src={`data:image/jpeg;base64,${restaurantData.images[currentImageIndex].image}`}
                          alt={`Restaurant ${currentImageIndex + 1}`}
                          className="gallery-image"
                        />
                        <FaTrash
                          className="delete-image-icon"
                          onClick={() =>
                            openDeletePopup(
                              "restaurantImage",
                              currentImageIndex
                            )
                          }
                        />
                      </div>
                      {restaurantData.images.length > 1 && (
                        <FaArrowRight
                          className="gallery-arrow right"
                          onClick={handleNextImage}
                        />
                      )}
                    </>
                  )}
                </div>

                <div className="image-upload-container">
                  <label className="image-upload-label">
                    {t("Restaurant.images")}
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
                  {t("Restaurant.save")}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="restaurant-categories">
          <h2>{t("Restaurant.categories")}</h2>
          <button onClick={openAddCategoryPopup}>
            {t("Restaurant.addCategory")}
          </button>
          <LookupTable
            columns={[
              t("Restaurant.categoryName"),
              t("Restaurant.categoryDescription"),
            ]}
            data={categories}
            showActions={true}
            actions={[
              {
                label: <FaEdit />,
                className: "edit-button",
                handler: (item) => openEditCategoryPopup(item),
              },
              {
                label: <FaTrash />,
                className: "delete-button",
                handler: (item) => openDeletePopup("category", item),
              },
            ]}
            customRenderers={{
              [t("Restaurant.categoryName")]: (item) => item.name,
              [t("Restaurant.categoryDescription")]: (item) => item.description,
            }}
          />
        </div>

        <div className="restaurant-items">
          <h2>{t("Restaurant.items")}</h2>
          <button onClick={openAddItemPopup}>{t("Restaurant.addItem")}</button>
          <LookupTable
            columns={[
              t("Restaurant.itemName"),
              t("Restaurant.itemDescription"),
              t("Restaurant.itemPrice"),
              t("Restaurant.itemWeight"),
              t("Restaurant.itemPrepTime"),
              t("Restaurant.menuCategory"),
              t("Restaurant.category"),
            ]}
            data={items}
            showActions={true}
            actions={[
              {
                label: <FaEdit />,
                className: "edit-button",
                handler: (item) => openEditItemPopup(item),
              },
              {
                label: <FaTrash />,
                className: "delete-button",
                handler: (item) => openDeletePopup("item", item),
              },
            ]}
            customRenderers={{
              [t("Restaurant.itemName")]: (item) => (
                <span
                  onClick={() => {
                    openImageGalleryPopup(item);
                  }}
                  style={{ cursor: "pointer", color: "#4A90E2" }}
                >
                  {item.name}
                </span>
              ),
              [t("Restaurant.itemDescription")]: (item) => item.description,
              [t("Restaurant.itemPrice")]: (item) => `${item.price} BAM`,
              [t("Restaurant.itemWeight")]: (item) => `${item.weight} g`,
              [t("Restaurant.itemPrepTime")]: (item) =>
                `${item.preparation_time} min`,
              [t("Restaurant.menuCategory")]: (item) => item.menuCategory,
              [t("Restaurant.category")]: (item) => item.category,
            }}
          />
        </div>

        {isImageGalleryOpen && currentGalleryItem && (
          <div className="item-modal">
            <div className="item-modal-content">
              <span
                className="item-close-button"
                onClick={closeImageGalleryPopup}
              >
                &times;
              </span>
              <h2>{currentGalleryItem.name}</h2>
              {currentGalleryItem.images &&
              currentGalleryItem.images.length > 0 ? (
                <div className="item-gallery">
                  {currentGalleryItem.images.length > 1 && (
                    <FaArrowLeft
                      className="item-gallery-arrow left"
                      onClick={handlePrevGalleryImage}
                    />
                  )}
                  <img
                    src={
                      currentGalleryItem.images[currentGalleryImageIndex].image
                    }
                    alt={`Item ${currentGalleryImageIndex + 1}`}
                    className="item-gallery-image"
                  />
                  {currentGalleryItem.images.length > 1 && (
                    <FaArrowRight
                      className="item-gallery-arrow right"
                      onClick={handleNextGalleryImage}
                    />
                  )}
                </div>
              ) : (
                <p>{t("Restaurant.noImages")}</p>
              )}
            </div>
          </div>
        )}

        {/* Popup za editovanje kategorije */}
        {isEditCategoryOpen && (
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
                <button type="submit" className="save-button">
                  {t("Restaurant.save")}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Popup za dodavanje kategorije */}
        {isAddCategoryOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-button" onClick={closeAddCategoryPopup}>
                &times;
              </span>
              <h2>{t("Restaurant.addCategory")}</h2>
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
        )}

        {/* Editovanje Itema */}
        {isEditItemOpen && (
          <div className="modal">
            <div className="modal-content reduced-padding">
              <span className="close-button" onClick={closeEditItemPopup}>
                &times;
              </span>
              <h2>{t("Restaurant.editItem")}</h2>
              <form onSubmit={handleSaveItem}>
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
                      value={currentItem ? currentItem.weight : ""}
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
                    <input
                      type="text"
                      value={currentItem ? currentItem.menuCategory : ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          menuCategory: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                </div>
                <label>
                  {t("Restaurant.category")}
                  <input
                    type="text"
                    value={currentItem ? currentItem.category : ""}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        category: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                {/* Horizontalna galerija za uređivanje slika */}
                {currentItem &&
                  currentItem.images &&
                  currentItem.images.length > 0 && (
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
                          src={
                            currentItem.images[currentGalleryImageIndex].image
                          }
                          alt={`Item ${currentGalleryImageIndex + 1}`}
                          className="horizontal-gallery-image"
                        />
                        <FaTrash
                          className="delete-image-icon"
                          onClick={() =>
                            handleDeleteItemImage(currentGalleryImageIndex)
                          }
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

                {/* Polje za upload novih slika */}
                <div className="image-upload-container">
                  <label className="image-upload-label">
                    {t("Restaurant.uploadImages")}
                    <input
                      type="file"
                      name="images"
                      multiple
                      onChange={handleAddItemImage} // Funkcija za upload slika
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
        )}

        {/* Popup za dodavanje itema */}
        {isAddItemOpen && (
          <div className="modal">
            <div className="modal-content reduced-padding">
              <span className="close-button" onClick={closeAddItemPopup}>
                &times;
              </span>
              <h2>{t("Restaurant.addItem")}</h2>
              <form onSubmit={handleSaveItem}>
                <div className="form-row">
                  <label>
                    {t("Restaurant.itemName")}
                    <input
                      type="text"
                      value={currentItem ? currentItem.name : ""}
                      onChange={(e) => setCurrentItem({ name: e.target.value })}
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
                      value={currentItem ? currentItem.weight : ""}
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
                      value={currentItem ? currentItem.category : ""}
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
        )}

        {/* Confirm Delete Popup */}
        <ConfirmDelete
          isOpen={deletePopupOpen}
          message={
            deleteType === "restaurantImage" || deleteType === "itemImage"
              ? t("ConfirmDelete.imageMessage")
              : t("ConfirmDelete.confirmMessage")
          }
          onConfirm={handleDelete}
          onCancel={closeDeletePopup}
        />

        <NotificationPopup
          message={notification.message}
          type={notification.type}
          visible={notification.visible}
        />
      </div>
    </div>
  );
}

export default Restaurant;
