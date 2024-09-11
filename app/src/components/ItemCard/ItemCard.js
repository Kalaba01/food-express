import React from "react";
import { Gallery } from "../index";
import "./ItemCard.css";

const ItemCard = ({
  item,
  isOpen,
  incrementQuantity,
  decrementQuantity,
  setItemQuantity,
  addToBasket,
  t,
}) => {
  return (
    <div className="menu-item-card-horizontal">
      <div className="item-image">
        <Gallery images={item.images.map((img) => img.image)} />
      </div>
      <div className="item-details-horizontal">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        <p className="item-price">
          {t("CustomerRestaurant.price")}: {item.price} BAM
        </p>
        <div className="item-quantity-controls">
          <button onClick={() => decrementQuantity(item.id)}>-</button>
          <input
            type="number"
            min="1"
            value={item.quantity || 1}
            onChange={(e) => setItemQuantity(item.id, e.target.value)}
          />
          <button onClick={() => incrementQuantity(item.id)}>+</button>
        </div>
        <button
          className={`add-to-basket-button ${!isOpen ? "disabled-button" : ""}`}
          onClick={() => addToBasket(item)}
          disabled={!isOpen}
          title={!isOpen ? t("CustomerRestaurant.outOfHours") : ""}
        >
          {t("CustomerRestaurant.add")}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
