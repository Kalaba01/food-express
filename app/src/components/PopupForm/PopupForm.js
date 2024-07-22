import React, { useState } from 'react';
import axios from 'axios';
import './PopupForm.css';
import { useNavigate } from 'react-router-dom';

function PopupForm({ type, closeModal, switchToOtherForm, showNotification, handleLogin }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (type === 'login') {
        const loginData = new URLSearchParams();
        loginData.append('username', formData.username);
        loginData.append('password', formData.password);

        response = await axios.post('http://localhost:8000/token', loginData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const token = response.data.access_token;
        const userResponse = await axios.get('http://localhost:8000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = userResponse.data.role;
        handleLogin(userRole);
        closeModal();
        if (userRole === 'customer') {
          navigate('/customer');
        } else if (userRole === 'owner') {
          navigate('/owner');
        } else if (userRole === 'courier') {
          navigate('/courier');
        } else if (userRole === 'administrator') {
          navigate('/admin');
        }

      } else if (type === 'register') {
        response = await axios.post('http://localhost:8000/register', {
          ...formData,
          role: 'customer'
        });
        if (response.status === 200 || response.status === 201) {
          showNotification('Registration successful', 'success');
        } else {
          showNotification('Registration failed', 'error');
        }
        closeModal();
      } else {
        const requestData = {
          ...formData,
          request_type: type === 'partner' ? 'partner' : type === 'deliver' ? 'driver' : 'team'
        };
        response = await axios.post('http://localhost:8000/requests/', requestData);
        if (response.status === 200 || response.status === 201) {
          showNotification('Request submitted successfully', 'success');
        } else {
          showNotification('Failed to submit request', 'error');
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      showNotification('Error submitting request', 'error');
    }
  };

  let formFields = [];
  let title = '';
  let switchText = '';

  switch (type) {
    case 'login':
      formFields = [
        { label: 'Username', name: 'username', type: 'text' },
        { label: 'Password', name: 'password', type: 'password' }
      ];
      title = 'Login';
      switchText = "Don't have an account? <span class='switch-link'>Register</span>";
      break;

    case 'register':
      formFields = [
        { label: 'Username', name: 'username', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Password', name: 'password', type: 'password' }
      ];
      title = 'Register';
      switchText = "Already have an account? <span class='switch-link'>Login</span>";
      break;

    case 'partner':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text' },
        { label: 'Last Name', name: 'last_name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Business Information', name: 'additional_info', type: 'textarea' }
      ];
      title = 'Become a Partner';
      break;

    case 'deliver':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text' },
        { label: 'Last Name', name: 'last_name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Delivery Experience', name: 'additional_info', type: 'textarea' }
      ];
      title = 'Deliver with Us';
      break;

    case 'join':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text' },
        { label: 'Last Name', name: 'last_name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Motivation', name: 'additional_info', type: 'textarea' }
      ];
      title = 'Join the Team';
      break;

    default:
      break;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeModal}>&times;</span>
        <h2>{title}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <React.Fragment key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required
                />
              )}
            </React.Fragment>
          ))}
          <button type="submit">Submit</button>
        </form>
        {switchText && <p className="switch-text" onClick={() => switchToOtherForm(type === 'login' ? 'register' : 'login')} dangerouslySetInnerHTML={{ __html: switchText }}></p>}
      </div>
    </div>
  );
}

export default PopupForm;
