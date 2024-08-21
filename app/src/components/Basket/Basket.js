import React, { useState, useContext } from 'react';
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

  const toggleBasket = () => {
    setBasketVisible(!basketVisible);
  };

  const removeFromBasket = (itemId) => {
    setBasket((prevBasket) => prevBasket.filter((item) => item.id !== itemId));
  };

  const openOrderPopup = () => {
    setIsOrderPopupOpen(true);
    toggleBasket();
  };
  
  const closeOrderPopup = () => {
    setIsOrderPopupOpen(false);
  };

  const totalPrice = basket.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="basket-container">
      <FaShoppingCart size={24} onClick={toggleBasket} className="basket-icon" />
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
