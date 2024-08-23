import React, { useState, useEffect } from 'react';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import axios from 'axios';
import './Status.css';

function Status({ id }) {
  const [status, setStatus] = useState('offline');
  const [showPopup, setShowPopup] = useState(false);

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

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

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
            <label htmlFor="online">Online</label>
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
            <label htmlFor="offline">Offline</label>
          </div>
          <button className="status-save-button" onClick={handleSaveStatus}>Save</button>
        </div>
      )}
    </div>
  );
}

export default Status;
