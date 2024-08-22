import React, { useState, useContext, useEffect } from 'react';
import { NotificationPopup } from "../index";
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
    twoHundred: 0,
    oneHundred: 0,
    fifty: 0,
    twenty: 0,
    ten: 0,
    five: 0,
    two: 0,
    one: 0,
    fiftyCents: 0,
    twentyCents: 0,
    tenCents: 0,
    fiveCents: 0
  });

  useEffect(() => {
    const containsFood = basket.some(item => item.category === 'food');
    setShowCutleryOption(containsFood);
  }, [basket]);

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

    const orderData = {
      customer_id: customerId,
      restaurant_id: basket[0].restaurant_id,
      total_price: basket.reduce((total, item) => total + item.price * item.quantity, 0),
      status: 'pending',
      delivery_address: address,
      cutlery_included: showCutleryOption ? cutleryIncluded : null,
      contact: contact,
      payment_method: paymentMethod,
      card_number: paymentMethod === 'card' ? cardNumber : null,
      money: paymentMethod === 'cash' ? JSON.stringify(cashAmounts) : null,
      items: basket
    };

    try {
      const response = await axios.post('http://localhost:8000/order/', orderData);
      setNotification({ message: t('Order.success'), type: 'success' });
      setBasket([]);
      onClose();
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
                  value={cashAmounts.twoHundred}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, twoHundred: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>100 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.oneHundred}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, oneHundred: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>50 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.fifty}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, fifty: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>20 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.twenty}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, twenty: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>10 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.ten}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, ten: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>5 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.five}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, five: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>2 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.two}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, two: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>1 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.one}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, one: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.50 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.fiftyCents}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, fiftyCents: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.20 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.twentyCents}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, twentyCents: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.10 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.tenCents}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, tenCents: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>0.05 BAM</label>
                <input
                  type="number"
                  min="0"
                  value={cashAmounts.fiveCents}
                  onChange={(e) => setCashAmounts({ ...cashAmounts, fiveCents: Number(e.target.value) })}
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
