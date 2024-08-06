import React, { useState, useEffect } from 'react';
import { Header, Footer, NotificationPopup } from '../index';
import axios from 'axios';
import './Requests.css';

function Requests({ darkMode, toggleDarkMode }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
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
      await axios.put(`http://localhost:8000/requests/${id}`, { status });
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status } : request
      ));
      setNotification({ message: `Request ${status}`, type: 'success' });
    } catch (error) {
      setNotification({ message: 'Error updating request status', type: 'error' });
      console.error('Error updating request status:', error);
    }
  };

  const filteredRequests = requests.filter(request => request.status === filter);

  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      <div className="requests-container">
        <h1>Requests</h1>
        <div className="filter-buttons">
          <button onClick={() => setFilter('pending')}>Pending</button>
          <button onClick={() => setFilter('accepted')}>Accepted</button>
          <button onClick={() => setFilter('denied')}>Denied</button>
        </div>
        <table className="requests-table">
          <thead>
            <tr>
              <th>Ime</th>
              <th>Prezime</th>
              <th>E-mail</th>
              <th>Info</th>
              <th>Type</th>
              <th>Created</th>
              {filter === 'pending' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>{request.first_name}</td>
                <td>{request.last_name}</td>
                <td>{request.email}</td>
                <td>{request.additional_info || 'No Info'}</td>
                <td>{request.request_type}</td>
                <td>{new Date(request.created_at).toLocaleString()}</td>
                {filter === 'pending' && (
                  <td>
                    <button className="accept-button" onClick={() => updateRequestStatus(request.id, 'accepted')}>Prihvati</button>
                    <button className="deny-button" onClick={() => updateRequestStatus(request.id, 'denied')}>Odbij</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
      <Footer />
    </div>
  );
}

export default Requests;
