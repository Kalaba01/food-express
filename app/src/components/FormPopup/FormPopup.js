import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Captcha from '../Captcha/Captcha';
import './FormPopup.css';

function FormPopup({ type, closeModal, switchToOtherForm, showNotification, handleLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    additional_info: ''
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [usernameValid, setUsernameValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [emailFormatValid, setEmailFormatValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const navigate = useNavigate();

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (type === 'register') {
      if (name === 'username') {
        if (!value) {
          setUsernameValid(null);
        } else {
          try {
            const response = await axios.get(`http://localhost:8000/check-username/${value}`);
            setUsernameValid(!response.data.exists);
          } catch (error) {
            console.error('Error checking username:', error);
          }
        }
      }

      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailFormatValid(emailRegex.test(value));
        if (emailRegex.test(value)) {
          try {
            const response = await axios.get(`http://localhost:8000/check-email/${value}`);
            setEmailValid(!response.data.exists);
          } catch (error) {
            console.error('Error checking email:', error);
          }
        } else {
          setEmailValid(null);
        }
      }

      if (name === 'password') {
        const isValid = value.length >= 6 && /\d/.test(value);
        setPasswordValid(isValid);
        setPasswordMatch(value === formData.confirmPassword);
      }

      if (name === 'confirmPassword') {
        setPasswordMatch(formData.password === value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'register') {
      if (formData.password !== formData.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }
      if (!captchaVerified) {
        showNotification('Please complete the CAPTCHA', 'error');
        return;
      }
  
      try {
        const response = await axios.post('http://localhost:8000/register', {
          ...formData,
          role: 'customer',
        });
  
        if (response.status === 200 || response.status === 201) {
          showNotification('Registration successful', 'success');
          closeModal();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const detail = error.response.data.detail;
          if (detail === 'Email already registered') {
            showNotification('Email already in use', 'error');
          } else if (detail === 'Username already registered') {
            showNotification('Username already taken', 'error');
          } else {
            showNotification('Registration failed', 'error');
          }
        } else {
          showNotification('Registration failed', 'error');
        }
      }
    } else if (type === 'login') {
      try {
        const loginData = new URLSearchParams();
        loginData.append('username', formData.username);
        loginData.append('password', formData.password);
  
        const response = await axios.post('http://localhost:8000/token', loginData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
  
        const token = response.data.access_token; // Extract the token from the response
        const userResponse = await axios.get('http://localhost:8000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userRole = userResponse.data.role;
        handleLogin(userRole);
        showNotification('Login Successful', 'success'); // Show success message
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
      } catch (error) {
        showNotification('Invalid username or password', 'error');
      }
    } else if (['partner', 'deliver', 'join'].includes(type)) {
      if (!captchaVerified) {
        showNotification('Please complete the CAPTCHA', 'error');
        return;
      }
      try {
        const requestData = {
          ...formData,
          request_type: type,
        };
        const response = await axios.post('http://localhost:8000/requests/', requestData);
        if (response.status === 200 || response.status === 201) {
          showNotification('Request submitted successfully', 'success');
        } else {
          showNotification('Failed to submit request', 'error');
        }
        closeModal();
      } catch (error) {
        showNotification('Failed to submit request', 'error');
      }
    }
  };  

  const resetFormData = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      additional_info: ''
    });
    setCaptchaVerified(false);
    setPasswordMatch(true);
    setUsernameValid(null);
    setEmailValid(null);
    setEmailFormatValid(null);
    setPasswordValid(null);
  };

  let formFields = [];
  let title = '';
  let switchText = '';

  switch (type) {
    case 'login':
      formFields = [
        { label: 'Username', name: 'username', type: 'text', required: true },
        { label: 'Password', name: 'password', type: 'password', required: true }
      ];
      title = 'Login';
      switchText = "Don't have an account? <span class='switch-link'>Register</span>";
      break;

    case 'register':
      formFields = [
        { label: 'Username', name: 'username', type: 'text', required: true },
        { label: 'Email', name: 'email', type: 'email', required: true },
        { label: 'Password', name: 'password', type: 'password', required: true },
        { label: 'Confirm Password', name: 'confirmPassword', type: 'password', required: true }
      ];
      title = 'Register';
      switchText = "Already have an account? <span class='switch-link'>Login</span>";
      break;

    case 'partner':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text', required: true },
        { label: 'Last Name', name: 'last_name', type: 'text', required: true },
        { label: 'Email', name: 'email', type: 'email', required: true },
        { label: 'Business Information', name: 'additional_info', type: 'textarea', required: true }
      ];
      title = 'Become a Partner';
      break;

    case 'deliver':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text', required: true },
        { label: 'Last Name', name: 'last_name', type: 'text', required: true },
        { label: 'Email', name: 'email', type: 'email', required: true },
        { label: 'Delivery Experience', name: 'additional_info', type: 'textarea', required: true }
      ];
      title = 'Deliver with Us';
      break;

    case 'join':
      formFields = [
        { label: 'First Name', name: 'first_name', type: 'text', required: true },
        { label: 'Last Name', name: 'last_name', type: 'text', required: true },
        { label: 'Email', name: 'email', type: 'email', required: true },
        { label: 'Motivation', name: 'additional_info', type: 'textarea', required: true }
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
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <div className="input-wrapper">
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}
                {(field.name === 'username' && usernameValid !== null && formData.username) && (
                  <span className="validation-icon" title={usernameValid ? '' : 'This username is already taken'}>
                    {usernameValid ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
                  </span>
                )}
                {(field.name === 'email' && type === 'register' && formData.email) && (
                  <span className="validation-icon" title={!emailFormatValid ? 'Please enter a valid email address' : (emailValid === false ? 'This email is already in use' : '')}>
                    {emailFormatValid === false || emailValid === false ? <FaTimesCircle color="red" /> : <FaCheckCircle color="green" />}
                  </span>
                )}
                {(field.name === 'password' && passwordValid !== null && formData.password) && (
                  <span className="validation-icon" title={!passwordValid ? 'Password must be at least 6 characters long and contain at least one number' : ''}>
                    {passwordValid ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
                  </span>
                )}
                {(field.name === 'confirmPassword' && passwordMatch !== null && formData.confirmPassword) && (
                  <span className="validation-icon" title={!passwordMatch ? "Passwords don't match" : ''}>
                    {passwordMatch ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(type === 'register' || type === 'partner' || type === 'deliver' || type === 'join') && (
            <Captcha onVerify={handleCaptchaVerify} />
          )}
          <button type="submit">Submit</button>
        </form>
        {switchText && (
          <p className="switch-text" onClick={() => { switchToOtherForm(type === 'login' ? 'register' : 'login'); resetFormData(); }} dangerouslySetInnerHTML={{ __html: switchText }}></p>
        )}
      </div>
    </div>
  );
}

export default FormPopup;
