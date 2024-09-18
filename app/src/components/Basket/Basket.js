import React, { useState, useContext, useEffect } from 'react';
import { Order } from "../index";
import { useTranslation } from 'react-i18next';
import { BasketContext } from '../../BasketContext';
import { FaShoppingCart } from 'react-icons/fa';
import './Basket.css';

function Basket() {
  const { t } = useTranslation('global');
  const { basket, setBasket } = useContext(BasketContext);
  const [basketVisible, setBasketVisible] = useState(false);
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);

  // useEffect hook initializes the basket state by resetting the basket when the component loads
  useEffect(() => {
    setBasket([]);
  }, []);

  // toggleBasket function shows or hides the basket popup
  const toggleBasket = () => {
    setBasketVisible(!basketVisible);
  };

  // removeFromBasket function removes an item from the basket
  const removeFromBasket = (itemId) => {
    setBasket((prevBasket) => prevBasket.filter((item) => item.id !== itemId));
  };

  // openOrderPopup function opens the order popup
  const openOrderPopup = () => {
    setIsOrderPopupOpen(true);
    toggleBasket();
  };
  
  // closeOrderPopup function closes the order popup
  const closeOrderPopup = () => {
    setIsOrderPopupOpen(false);
  };

  // totalPrice calculates the total cost of items in the basket
  const totalPrice = basket.reduce((total, item) => total + item.price * item.quantity, 0);

  // itemCount calculates the total number of items in the basket
  const itemCount = basket.reduce((count, item) => count + item.quantity, 0);
  
  const displayItemCount = itemCount > 9 ? '9+' : itemCount;

  return (
    <div className="basket-container">
      <div className="basket-icon-container">
        <FaShoppingCart size={28} onClick={toggleBasket} className="basket-icon" />
        {itemCount > 0 && (
          <div className="item-count-badge">
            {displayItemCount}
          </div>
        )}
      </div>
      {basketVisible && (
        <div className="basket-popup">
          <h2>{t('Basket.yourBasket')}</h2>
          <ul>
            {basket.map(item => (
              <li key={item.id}>
                <p>{item.name} (x{item.quantity})</p>
                <p>{t('Basket.price')}: {item.price * item.quantity} BAM</p>
                <button onClick={() => removeFromBasket(item.id)}>{t('Basket.remove')}</button>
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h3>{t('Basket.total')}: {totalPrice} BAM</h3>
          </div>
          {basket.length > 0 && (
            <button className="order-button" onClick={openOrderPopup}>{t('Basket.order')}</button>
          )}
        </div>
      )}
      {isOrderPopupOpen && <Order onClose={closeOrderPopup} />}
    </div>
  );
}

export default Basket;
