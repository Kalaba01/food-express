import React, { useState } from 'react';
import './RequestPopup.css';

function RequestPopup({ closeModal, formType }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    additionalInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      ...formData,
      request_type: formType
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        console.log('Request submitted successfully');
        closeModal();
      } else {
        console.error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  let additionalInfoLabel;
  let additionalInfoPlaceholder;
  let title;

  switch (formType) {
    case 'partner':
      additionalInfoLabel = 'Business Information';
      additionalInfoPlaceholder = 'Tell us about your business';
      title = 'Become a Partner';
      break;
    case 'deliver':
      additionalInfoLabel = 'Delivery Experience';
      additionalInfoPlaceholder = 'Tell us about your delivery experience';
      title = 'Deliver with Us';
      break;
    case 'join':
      additionalInfoLabel = 'Motivation';
      additionalInfoPlaceholder = 'Tell us why you want to join our team';
      title = 'Join the Team';
      break;
    default:
      additionalInfoLabel = 'Additional Info';
      additionalInfoPlaceholder = 'Additional Info';
      title = 'Form';
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeModal}>&times;</span>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <label htmlFor="additionalInfo">{additionalInfoLabel}</label>
          <textarea id="additionalInfo" name="additionalInfo" placeholder={additionalInfoPlaceholder} value={formData.additionalInfo} onChange={handleChange} required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default RequestPopup;
