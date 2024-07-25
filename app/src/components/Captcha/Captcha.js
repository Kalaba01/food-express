import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './Captcha.css';

function Captcha({ onVerify }) {
  const handleCaptchaVerify = (token) => {
    if (token) {
      onVerify(true);
    } else {
      onVerify(false);
    }
  };

  return (
    <div className="captcha-container">
      <ReCAPTCHA
        sitekey="6LfkoxYqAAAAANfYopnEkcsUPDkk0GitkdSw-POG"
        onChange={handleCaptchaVerify}
      />
    </div>
  );
}

export default Captcha;
