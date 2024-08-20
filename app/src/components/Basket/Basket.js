import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import './Basket.css';

function Basket() {
  const [basketVisible, setBasketVisible] = useState(false);
  const [items, setItems] = useState([
    { id: 1, name: "Pizza", quantity: 2, price: 15 },
    { id: 2, name: "Burger", quantity: 1, price: 8 }
  ]);

  const toggleBasket = () => {
    setBasketVisible(!basketVisible);
  };

  const removeFromBasket = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="basket-container">
      <FaShoppingCart size={24} onClick={toggleBasket} className="basket-icon" />
      {basketVisible && (
        <div className="basket-popup">
          <h2>Your Basket</h2>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <p>{item.name} (x{item.quantity})</p>
                <p>Price: {item.price * item.quantity}</p>
                <button onClick={() => removeFromBasket(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="total-price">
            <h3>Total: {totalPrice}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default Basket;
