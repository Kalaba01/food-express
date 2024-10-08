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
  Loading,
} from "../index";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../LookupTable/LookupTable.css";

function Restaurant({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const { id } = useParams();
  const navigate = useNavigate();
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

  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const daysOfWeek = [
    t("Restaurant.days.Monday"),
    t("Restaurant.days.Tuesday"),
    t("Restaurant.days.Wednesday"),
    t("Restaurant.days.Thursday"),
    t("Restaurant.days.Friday"),
    t("Restaurant.days.Saturday"),
    t("Restaurant.days.Sunday"),
  ];

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

      const sortedOperatingHours = response.data.operating_hours.sort(
        (a, b) =>
          dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
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
        operating_hours: sortedOperatingHours,
        category: response.data.category || "",
      });
      setIsLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/unauthorized");
      } else {
        console.error("Error fetching restaurant:", error);
        setIsLoading(false);
      }
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

  // Hook to fetch the restaurant data
  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  // Hook to fetch the categories of the restaurant
  useEffect(() => {
    fetchCategories();
  }, [id]);

  // Hook to fetch the items of the restaurant
  useEffect(() => {
    fetchItems();
  }, [id]);

  // Opens the image gallery popup for a selected item if it has images
  const openImageGalleryPopup = (item) => {
    if (item && item.images && item.images.length > 0) {
      setCurrentGalleryItem(item);
      setIsImageGalleryOpen(true);
    }
  };

  // Closes the image gallery popup
  const closeImageGalleryPopup = () => {
    setIsImageGalleryOpen(false);
    setCurrentGalleryItem(null);
  };

  // Closes the image gallery popup
  const openEditCategoryPopup = (category) => {
    setCurrentCategory(category);
    setIsEditCategoryOpen(true);
  };

  // Closes the category edit popup
  const closeEditCategoryPopup = () => {
    setCurrentCategory(null);
    setIsEditCategoryOpen(false);
  };

  // Closes the category edit popup
  const openAddCategoryPopup = () => {
    setCurrentCategory({ name: "" });
    setIsAddCategoryOpen(true);
  };

  // Closes the add category popup
  const closeAddCategoryPopup = () => {
    setIsAddCategoryOpen(false);
  };

  // Opens the item edit popup
  const openEditItemPopup = (item) => {
    setCurrentItem(item);
    setCurrentGalleryImageIndex(0);
    setIsEditItemOpen(true);
  };

  // Closes the item edit popup
  const closeEditItemPopup = () => {
    setCurrentItem(null);
    setIsEditItemOpen(false);
  };

  // Opens the add item popup
  const openAddItemPopup = () => {
    setIsAddItemOpen(true);
  };

  // Closes the add item popup
  const closeAddItemPopup = () => {
    setIsAddItemOpen(false);
  };

  // Opens the delete confirmation popup for a specified type (item, category, or image)
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

  // Closes the delete confirmation popup
  const closeDeletePopup = () => {
    setItemToDelete(null);
    setCategoryToDelete(null);
    setImageToDelete(null);
    setDeletePopupOpen(false);
  };

  // Toggles the restaurant edit mode
  const handleRestaurantEdit = () => {
    setEditingRestaurant(!editingRestaurant);
  };

  // Updates the restaurant data form fields
  const handleRestaurantChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value,
    });
  };

  // Saves the restaurant data
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

  // Adds new image/s to the restaurant
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

  // Adds new image/s to an item
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

  // Confirms and handles the deletion of a restaurant image
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

  // Saves or updates a restaurant category
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

  // Adds a new item to the restaurant's menu
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

  // Edits an existing item in the restaurant's menu
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

  // Handles the deletion of items, categories, or images
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      if (deleteType === "item" && itemToDelete) {
        await axios.delete(`http://localhost:8000/items/${itemToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  // Renders star ratings based on the provided rating
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

  // Navigates to the next image in the restaurant gallery
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === restaurant.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navigates to the previous image in the restaurant gallery
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? restaurant.images.length - 1 : prevIndex - 1
    );
  };

  // Handles the deletion of an item image
  const handleDeleteItemImage = (imageIndex) => {
    setImageToDelete(imageIndex);
    setDeleteType("itemImage");
    setDeletePopupOpen(true);
  };

  // Confirms and handles the deletion of an item image
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
