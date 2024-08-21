import React, { useState, useContext } from 'react';
import { BasketContext } from '../../BasketContext';
import { FaShoppingCart } from 'react-icons/fa';
import './Basket.css';

function Basket() {
  const [basketVisible, setBasketVisible] = useState(false);
  const { basket, setBasket } = useContext(BasketContext);

  const toggleBasket = () => {
    setBasketVisible(!basketVisible);
  };

  const removeFromBasket = (itemId) => {
    setBasket((prevBasket) => prevBasket.filter((item) => item.id !== itemId));
  };

  const totalPrice = basket.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="basket-container">
      <FaShoppingCart size={24} onClick={toggleBasket}  className="basket-icon" />
      {basketVisible && (
        <div className="basket-popup">
          <h2>Your Basket</h2>
          <ul>
            {basket.map(item => (
              <li key={item.id}>
                <p>{item.name} (x{item.quantity})</p>
                <p>Price: {item.price * item.quantity} BAM</p>
                <button onClick={() => removeFromBasket(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h3>Total: {totalPrice} BAM</h3>
          </div>
        </div>
       )} 
    </div>
  );
}

export default Basket;
