import React, { useState, useEffect } from 'react';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Status.css';

function Status({ id }) {
  const { t } = useTranslation('global');
  const [status, setStatus] = useState('offline');
  const [showPopup, setShowPopup] = useState(false);

  // Fetches the current status of the courier based on their ID
  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/courier/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus(response.data.status);
      } catch (error) {
        console.error('Failed to fetch status', error);
      }
    };
    fetchStatus();
  }, [id]);

  // Handles the status change when a new status is selected
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  // Sends the updated status to the server and hides the popup
  const handleSaveStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('http://localhost:8000/courier/status', { id, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPopup(false);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="status-container">
      <HiOutlineStatusOnline
        className="status-icon"
        onClick={() => setShowPopup(!showPopup)}
      />
      {showPopup && (
        <div className="status-popup">
          <div className="status-option">
            <input
              type="radio"
              id="online"
              name="status"
              value="online"
              checked={status === 'online'}
              onChange={() => handleStatusChange('online')}
            />
            <label htmlFor="online">{t('Status.online')}</label>
          </div>
          <div className="status-option">
            <input
              type="radio"
              id="offline"
              name="status"
              value="offline"
              checked={status === 'offline'}
              onChange={() => handleStatusChange('offline')}
            />
            <label htmlFor="offline">{t('Status.offline')}</label>
          </div>
          <button className="status-save-button" onClick={handleSaveStatus}>
            {t('Status.save')}
          </button>
        </div>
      )}
    </div>
  );
}

export default Status;
