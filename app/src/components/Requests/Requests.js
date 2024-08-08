import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, NotificationPopup } from '../index';
import LookupTable from '../LookupTable/LookupTable';
import './Requests.css';
import { useTranslation } from 'react-i18next';

function Requests({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [requests, setRequests] = useState([]);
  const [filterRole, setFilterRole] = useState('pending');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/requests/');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.put(`http://localhost:8000/requests/${id}`, { status });
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status } : request
      ));
      setNotification({ message: `Request ${status}`, type: 'success' });

      // Provjeri da li je zahtjev odobren i prikaži obavijest
      if (status === 'accepted' && response.data.status === 'accepted') {
        setNotification({ message: 'User account created and email sent successfully.', type: 'success' });
      }
    } catch (error) {
      setNotification({ message: 'Error updating request status', type: 'error' });
      console.error('Error updating request status:', error);
    }
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
  };

  const filteredRequests = requests.filter(request => request.status === filterRole);

  const columns = [t('Requests.ime'), t('Requests.prezime'), t('Requests.email'), t('Requests.info'), t('Requests.type'), t('Requests.created')];

  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
      <div className="requests-container">
        <h1>{t('Requests.title')}</h1>
        <div className="filter-buttons">
          <button className={`filter-button ${filterRole === 'pending' ? 'active' : ''}`} onClick={() => handleRoleFilter('pending')}>{t('Requests.pending')}</button>
          <button className={`filter-button ${filterRole === 'accepted' ? 'active' : ''}`} onClick={() => handleRoleFilter('accepted')}>{t('Requests.accepted')}</button>
          <button className={`filter-button ${filterRole === 'denied' ? 'active' : ''}`} onClick={() => handleRoleFilter('denied')}>{t('Requests.denied')}</button>
        </div>
        <LookupTable
          columns={columns}
          data={filteredRequests}
          actions={[
            {
              label: t('Requests.accept'),
              className: 'accept-button',
              handler: (request) => updateRequestStatus(request.id, 'accepted'),
              show: filterRole === 'pending',
            },
            {
              label: t('Requests.deny'),
              className: 'deny-button',
              handler: (request) => updateRequestStatus(request.id, 'denied'),
              show: filterRole === 'pending',
            },
          ]}
          filterRole={filterRole}
          showActions={filterRole === 'pending'}
        />
      </div>
    </div>
  );
}

export default Requests;
