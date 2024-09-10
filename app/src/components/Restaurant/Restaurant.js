import React, { useEffect, useState } from "react";
import {
  Header,
  LookupTable,
  ConfirmDelete,
  NotificationPopup,
  Gallery,
  GalleryPopup,
  EditRestaurant,
  AddCategoryRestaurant,
  EditCategoryRestaurant,
  AddItemRestaurant,
  EditItemRestaurant,
  Loading
} from "../index";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
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
    operating_hours: [],
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
    operating_hours: [],
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
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = [
    t("Restaurant.days.Monday"),
    t("Restaurant.days.Tuesday"),
    t("Restaurant.days.Wednesday"),
    t("Restaurant.days.Thursday"),
    t("Restaurant.days.Friday"),
    t("Restaurant.days.Saturday"),
    t("Restaurant.days.Sunday"),
  ];

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value, 10));
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
        operating_hours: response.data.operating_hours || [],
        category: response.data.category || "",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
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
    } catch (error) {
      console.error("Error fetching categories:", error);
      setNotification({
        message: t("Restaurant.errorFetchingCategories"),
        type: "error",
      });
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
      setNotification({
        message: t("Restaurant.errorFetchingItems"),
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [id]);

  useEffect(() => {
    fetchItems();
  }, [id]);

  const openImageGalleryPopup = (item) => {
    if (item && item.images && item.images.length > 0) {
      setCurrentGalleryItem(item);
      setIsImageGalleryOpen(true);
    }
  };

  const closeImageGalleryPopup = () => {
    setIsImageGalleryOpen(false);
    setCurrentGalleryItem(null);
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
          operating_hours: restaurantData.operating_hours,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingRestaurant(false);
      setNotification({
        message: t("Restaurant.restaurantUpdated"),
        type: "success",
      });
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

        setNotification({
          message: t("Restaurant.imageDeleted"),
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        setNotification({
          message: t("Restaurant.errorDeletingImage"),
          type: "error",
        });
      }
    } else {
      console.error("Image ID is undefined or invalid, cannot delete.");
      setNotification({
        message: t("Restaurant.invalidImageId"),
        type: "error",
      });
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (currentCategory && currentCategory.id) {
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
        setNotification({
          message: t("Restaurant.categoryUpdated"),
          type: "success",
        });
      } else {
        const response = await axios.post(
          `http://localhost:8000/restaurants/${id}/categories`,
          {
            name: currentCategory.name,
            description: currentCategory.description,
            restaurant_id: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories([...categories, response.data]);
        setNotification({
          message: t("Restaurant.categoryAdded"),
          type: "success",
        });
      }
      closeAddCategoryPopup();
      closeEditCategoryPopup();
    } catch (error) {
      console.error("Error saving category:", error);
      setNotification({
        message: t("Restaurant.errorSavingCategory"),
        type: "error",
      });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
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

      const newItemId = response.data.id;

      const imageUploads = currentItem.images
        .filter((image) => image.file)
        .map(async (image) => {
          const formData = new FormData();
          formData.append("file", image.file);

          const response = await axios.post(
            `http://localhost:8000/items/${newItemId}/images`,
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

      closeAddItemPopup();

      setCurrentItem({
        name: "",
        description: "",
        price: "",
        weight: "",
        preparation_time: "",
        menuCategory: "",
        category: "",
        images: [],
      });

      setNotification({
        message: t("Restaurant.itemAdded"),
        type: "success",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      setNotification({
        message: t("Restaurant.errorAddingItem"),
        type: "error",
      });
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:8000/restaurants/${id}/items/${currentItem.id}`,
        {
          name: currentItem?.name,
          description: currentItem?.description,
          price: parseFloat(currentItem?.price),
          weight: parseInt(currentItem?.weight, 10),
          preparation_time: parseInt(currentItem?.preparation_time, 10),
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

      const imageUploads = currentItem.images
        .filter((image) => image.file)
        .map(async (image) => {
          const formData = new FormData();
          formData.append("file", image.file);

          const response = await axios.post(
            `http://localhost:8000/items/${currentItem.id}/images`,
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

      setNotification({
        message: t("Restaurant.itemUpdated"),
        type: "success",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      setNotification({
        message: t("Restaurant.errorUpdatingItem"),
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      if (deleteType === "item" && itemToDelete) {
        await axios.delete(
          `http://localhost:8000/items/${itemToDelete.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setItems(items.filter((item) => item.id !== itemToDelete.id));
        setNotification({
          message: t("Restaurant.itemDeleted"),
          type: "success",
        });
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
        setNotification({
          message: t("Restaurant.categoryDeleted"),
          type: "success",
        });
      } else if (deleteType === "restaurantImage" && imageToDelete !== null) {
        await handleConfirmDeleteRestaurantImage();
      } else if (deleteType === "itemImage" && imageToDelete !== null) {
        await handleConfirmDeleteItemImage();
      }
      closeDeletePopup();
    } catch (error) {
      console.error("Error deleting item, category or image:", error);
      setNotification({
        message: t("Restaurant.errorDeletingItem"),
        type: "error",
      });
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
        setNotification({
          message: t("Restaurant.itemImageDeleted"),
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        setNotification({
          message: t("Restaurant.errorDeletingItemImage"),
          type: "error",
        });
      }
    } else {
      console.error("Image ID is undefined or invalid, cannot delete.");
      setNotification({
        message: t("Restaurant.invalidImageId"),
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="owner"
        />
        <Loading />
      </>
    );
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
        <div className="restaurant-operating-hours">
          <h3>{t("Restaurant.operatingHours")}</h3>
          <ul>
            {restaurant.operating_hours.map((hours, index) => (
              <li key={index}>
                {t(`Restaurant.days.${hours.day_of_week}`)}:{" "}
                {hours.opening_time} - {hours.closing_time}
              </li>
            ))}
          </ul>
        </div>
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
            <Gallery
              images={restaurant.images.map(
                (image) => `data:image/jpeg;base64,${image.image}`
              )}
            />
          ) : (
            <p className="no-images">{t("Restaurant.noImages")}</p>
          )}
        </div>

        <button onClick={handleRestaurantEdit}>
          {editingRestaurant ? t("Restaurant.cancel") : t("Restaurant.edit")}
        </button>

        {editingRestaurant && (
          <EditRestaurant
            restaurantData={restaurantData}
            handleRestaurantChange={handleRestaurantChange}
            handleSaveRestaurant={handleSaveRestaurant}
            handleAddRestaurantImage={handleAddRestaurantImage}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            daysOfWeek={daysOfWeek}
            setRestaurantData={setRestaurantData}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            handlePrevImage={handlePrevImage}
            handleNextImage={handleNextImage}
            openDeletePopup={openDeletePopup}
            handleRestaurantEdit={handleRestaurantEdit}
          />
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
          <GalleryPopup
            images={currentGalleryItem.images.map((image) =>
              image.image.startsWith("data:image/jpeg;base64,")
                ? image.image
                : `data:image/jpeg;base64,${image.image}`
            )}
            initialIndex={currentGalleryImageIndex}
            onClose={closeImageGalleryPopup}
          />
        )}

        {isEditCategoryOpen && (
          <EditCategoryRestaurant
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            handleSaveCategory={handleSaveCategory}
            closeEditCategoryPopup={closeEditCategoryPopup}
            t={t}
          />
        )}

        {isAddCategoryOpen && (
          <AddCategoryRestaurant
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            handleSaveCategory={handleSaveCategory}
            closeAddCategoryPopup={closeAddCategoryPopup}
            t={t}
          />
        )}

        {isAddItemOpen && (
          <AddItemRestaurant
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            categories={categories}
            handleAddItem={handleAddItem}
            handleAddItemImage={handleAddItemImage}
            closeAddItemPopup={closeAddItemPopup}
            t={t}
          />
        )}

        {isEditItemOpen && (
          <EditItemRestaurant
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            categories={categories}
            currentGalleryImageIndex={currentGalleryImageIndex}
            setCurrentGalleryImageIndex={setCurrentGalleryImageIndex}
            handleDeleteItemImage={handleDeleteItemImage}
            handleAddItemImage={handleAddItemImage}
            handleEditItem={handleEditItem}
            closeEditItemPopup={closeEditItemPopup}
            t={t}
          />
        )}

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

        {notification.message && (
          <NotificationPopup
            message={notification.message}
            type={notification.type}
          />
        )}
      </div>
    </div>
  );
}

export default Restaurant;
