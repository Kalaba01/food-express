import React from 'react';
import { FaUser } from 'react-icons/fa';

function LoginRegister({ openPopupModal }) {
  return (
    <FaUser className="icon" onClick={() => openPopupModal('login')} />
  );
}

export default LoginRegister;
