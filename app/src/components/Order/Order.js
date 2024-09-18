import React, { useState, useContext, useEffect } from 'react';
import { NotificationPopup } from "../index";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { BasketContext } from '../../BasketContext';
import axios from 'axios';
import './Order.css';

function Order({ onClose }) {
  const { t } = useTranslation('global');
  const { basket, setBasket } = useContext(BasketContext);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [cutleryIncluded, setCutleryIncluded] = useState(false);
  const [showCutleryOption, setShowCutleryOption] = useState(false);
  const [cashAmounts, setCashAmounts] = useState({
    "200BAM": 0,
    "100BAM": 0,
    "50BAM": 0,
    "20BAM": 0,
    "10BAM": 0,
    "5BAM": 0,
    "2BAM": 0,
    "1BAM": 0,
    "0.50BAM": 0,
    "0.20BAM": 0,
    "0.10BAM": 0,
    "0.05BAM": 0
  });
  const navigate = useNavigate();

  // useEffect hook to determine if the cutlery option should be displayed
  useEffect(() => {
    const containsFood = basket.some(item => item.category === 'food');
    setShowCutleryOption(containsFood);
  }, [basket]);

  // Function to filter out cash denominations
  const filterCashAmounts = (cashAmounts) => {
    return Object.entries(cashAmounts).reduce((filtered, [key, value]) => {
      if (value > 0) {
        filtered[key] = value;
      }
      return filtered;
    }, {});
  };

  // Function to calculate the total cash based on the inputted denominations
  const calculateTotalCash = () => {
    return Object.entries(cashAmounts).reduce((total, [denomination, count]) => {
      const value = parseFloat(denomination.replace('BAM', ''));
      return total + (value * count);
    }, 0);
  };

  // Function to handle the confirmation and submission of the order
  const handleConfirmOrder = async () => {
    if (!address || !contact || !paymentMethod || (paymentMethod === 'card' && !cardNumber)) {
      setNotification({ message: t('Order.fillAllFields'), type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const customerId = decodedToken ? decodedToken.id : null;

    if (!customerId) {
      setNotification({ message: t('Order.invalidSession'), type: 'error' });
      return;
    }

    const filteredCashAmounts = paymentMethod === 'cash' ? filterCashAmounts(cashAmounts) : null;
    const totalPrice = basket.reduce((total, item) => total + item.price * item.quantity, 0);

    if (paymentMethod === 'cash') {
      const totalCash = calculateTotalCash();
      if (totalCash < totalPrice) {
        setNotification({ message: t('Order.insufficientCash'), type: 'error' });
        return;
      }
    }

    const orderData = {
      customer_id: customerId,
      restaurant_id: basket[0].restaurant_id,
      total_price: totalPrice,
      delivery_address: address,
      cutlery_included: showCutleryOption ? cutleryIncluded : null,
      contact: contact,
      payment_method: paymentMethod,
      card_number: paymentMethod === 'card' ? cardNumber : null,
      money: paymentMethod === 'cash' ? JSON.stringify(filteredCashAmounts) : null,
      items: basket.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price: item.price
      }))
    };

    try {
      const response = await axios.post('http://localhost:8000/order/', orderData);
      setNotification({ message: t('Order.success'), type: 'success' });
      setBasket([]);
      onClose();
      navigate('/customer/track-orders');
    } catch (error) {
      setNotification({ message: `${t('Order.error')}: ${error.response.data.detail}`, type: 'error' });
    }
  };

  return (
    <div className="order-modal">
      <div className="order-modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{t('Order.confirmOrder')}</h2>

        <label>{t('Order.address')}</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label>{t('Order.contact')}</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <label>{t('Order.paymentMethod')}</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="" disabled>{t('Order.choosePayment')}</option>
          <option value="cash">{t('Order.cash')}</option>
          <option value="card">{t('Order.card')}</option>
        </select>

        {paymentMethod === 'card' && (
          <div className="card-payment">
            <label>{t('Order.cardNumber')}</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="cash-payment">
            <label>{t('Order.cashAmounts')}</label>
            <div className="cash-denominations">
              <div>
                <label>200 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["200BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "200BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>100 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["100BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "100BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>50 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["50BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "50BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>20 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["20BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "20BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>10 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["10BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "10BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>5 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["5BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "5BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>2 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["2BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "2BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>1 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["1BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "1BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.50 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["0.50BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "0.50BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.20 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["0.20BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "0.20BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.10 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["0.10BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "0.10BAM": Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.05 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts["0.05BAM"]}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, "0.05BAM": Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {showCutleryOption && (
          <div className="cutlery-option">
            <label>{t('Order.includeCutlery')}</label>
            <select
              value={cutleryIncluded ? 'yes' : 'no'}
              onChange={(e) => setCutleryIncluded(e.target.value === 'yes')}
            >
              <option value="yes">{t('Order.yes')}</option>
              <option value="no">{t('Order.no')}</option>
            </select>
          </div>
        )}

        <button className="confirm-order-button" onClick={handleConfirmOrder}>
          {t('Order.confirm')}
        </button>
      </div>
      {notification.message && (
        <NotificationPopup message={notification.message} type={notification.type} />
      )}
    </div>
  );
}

export default Order;
