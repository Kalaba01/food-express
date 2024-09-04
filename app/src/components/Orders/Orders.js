import React, { useState, useEffect } from "react";
import { Header, LookupTable } from "../index";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../LookupTable/LookupTable.css";

function Orders({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8000/orders/");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleRestaurantClick = (order) => {
    setSelectedOrder(order);
    setIsPopupOpen(true);
  };

  const handleFilterClick = (status) => {
    setFilteredStatus(status);
  };

  const filteredOrders = filteredStatus
    ? orders.filter((order) => order.status === filteredStatus)
    : orders;

  const columns = [
    t("Orders.restaurant"),
    t("Orders.restaurantAddress"),
    t("Orders.customer"),
    t("Orders.customerAddress"),
    t("Orders.courier"),
    t("Orders.price"),
    t("Orders.cutlery"),
    t("Orders.created"),
    t("Orders.assigned"),
    t("Orders.status"),
  ];

  const customRenderers = {
    [t("Orders.restaurant")]: (item) => (
      <div
        onClick={() => handleRestaurantClick(item)}
        className={`order-row-orders ${
          selectedOrder && selectedOrder.id === item.id ? "active" : ""
        }`}
      >
        {item.restaurant_name || "N/A"}
      </div>
    ),
    [t("Orders.restaurantAddress")]: (item) => item.restaurant_address || "N/A",
    [t("Orders.customer")]: (item) => item.customer_name || "N/A",
    [t("Orders.customerAddress")]: (item) => item.customer_address || "N/A",
    [t("Orders.courier")]: (item) =>
      item.courier_name ? item.courier_name : t("Orders.pending"),
    [t("Orders.price")]: (item) =>
      item.total_price ? `${item.total_price} BAM` : "N/A",
    [t("Orders.cutlery")]: (item) =>
      item.cutlery_included ? t("Orders.yes") : t("Orders.no"),
    [t("Orders.created")]: (item) =>
      item.created_at ? new Date(item.created_at).toLocaleString() : "N/A",
    [t("Orders.assigned")]: (item) =>
      item.assigned_at
        ? new Date(item.assigned_at).toLocaleString()
        : t("Orders.pending"),
    [t("Orders.status")]: (item) => t(`Orders.status_${item.status}`) || "N/A",
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="administrator"
      />
      <div className="orders-container">
        <h1>{t("Orders.title")}</h1>
        <div className="filter-buttons">
          <button
            onClick={() => handleFilterClick("")}
            className={`filter-button ${filteredStatus === "" ? "active" : ""}`}
          >
            {t("Orders.all")}
          </button>
          <button
            onClick={() => handleFilterClick("pending")}
            className={`filter-button ${
              filteredStatus === "pending" ? "active" : ""
            }`}
          >
            {t("Orders.status_pending")}
          </button>
          <button
            onClick={() => handleFilterClick("preparing")}
            className={`filter-button ${
              filteredStatus === "preparing" ? "active" : ""
            }`}
          >
            {t("Orders.status_preparing")}
          </button>
          <button
            onClick={() => handleFilterClick("in_delivery")}
            className={`filter-button ${
              filteredStatus === "in_delivery" ? "active" : ""
            }`}
          >
            {t("Orders.status_in_delivery")}
          </button>
          <button
            onClick={() => handleFilterClick("delivered")}
            className={`filter-button ${
              filteredStatus === "delivered" ? "active" : ""
            }`}
          >
            {t("Orders.status_delivered")}
          </button>
          <button
            onClick={() => handleFilterClick("cancelled")}
            className={`filter-button ${
              filteredStatus === "cancelled" ? "active" : ""
            }`}
          >
            {t("Orders.status_cancelled")}
          </button>
        </div>
        <LookupTable
          columns={columns}
          data={filteredOrders}
          showActions={false}
          customRenderers={customRenderers}
          onRowClick={handleRestaurantClick}
        />
      </div>

      {isPopupOpen && selectedOrder && (
        <div className="modal">
          <div className="modal-content order-details-modal">
            <span className="close-button" onClick={closePopup}>
              &times;
            </span>
            <h2>{t("Orders.orderDetails")}</h2>
            {selectedOrder.order_items &&
            selectedOrder.order_items.length > 0 ? (
              <ul>
                {selectedOrder.order_items.map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.quantity} x {item.price} BAM
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("Orders.noItems")}</p>
            )}
            <p>
              {t("Orders.totalPrice")}: {selectedOrder.total_price} BAM
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
