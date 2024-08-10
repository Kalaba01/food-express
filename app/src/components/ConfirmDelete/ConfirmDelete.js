import React from 'react';
import './ConfirmDelete.css';

function ConfirmDelete({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content delete-popup">
        <h2>Confirm Deletion</h2>
        <p>{message}</p>
        <div className="delete-popup-buttons">
          <button className="confirm-delete-button" onClick={onConfirm}>Confirm</button>
          <button className="cancel-delete-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
