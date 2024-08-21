import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BasketContext } from '../../BasketContext';
import './Order.css';

function Order({ onClose }) {
  const { t } = useTranslation('global');
  const { basket, setBasket } = useContext(BasketContext);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');  // Inicijalna vrednost prazna
  const [cardNumber, setCardNumber] = useState('');
  const [cutleryIncluded, setCutleryIncluded] = useState(false);
  const [showCutleryOption, setShowCutleryOption] = useState(false);  // Kontrola za prikaz Cutlery opcije
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

  const handleConfirmOrder = () => {
    // Provera da li su sva polja popunjena
    if (!address || !contact || !paymentMethod || (paymentMethod === 'card' && !cardNumber)) {
      alert(t('Order.fillAllFields'));
      return;
    }

    // Logika za potvrdu narudžbe
    const orderData = {
      address,
      contact,
      paymentMethod,
      cardNumber: paymentMethod === 'card' ? cardNumber : null,
      cashAmounts: paymentMethod === 'cash' ? cashAmounts : null,
      cutleryIncluded: showCutleryOption ? cutleryIncluded : null,  // Dodato: Informacija o priboru za jelo
      items: basket,
    };

    console.log('Order confirmed:', orderData);

    // Prazni korpu nakon potvrde narudžbe
    setBasket([]);
    onClose();
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
          <option value="" disabled>{t('Order.choosePayment')}</option>  {/* Dodato kao placeholder */}
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
              {/* Input polja za apoene novca */}
              {/* Svi apoeni prikazani prema instrukcijama */}
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

        {/* Prikaz opcije za pribor za jelo ako je bar jedan item iz korpe kategorije food */}
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
    </div>
  );
}

export default Order;
