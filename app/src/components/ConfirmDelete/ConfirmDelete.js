import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmDelete.css';

function ConfirmDelete({ isOpen, message, onConfirm, onCancel }) {
  const { t } = useTranslation('global');

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content delete-popup">
        <h2>{t('ConfirmDelete.title')}</h2>
        <p>{message}</p>
        <div className="delete-popup-buttons">
          <button className="confirm-delete-button" onClick={onConfirm}>{t('ConfirmDelete.confirmButton')}</button>
          <button className="cancel-delete-button" onClick={onCancel}>{t('ConfirmDelete.cancelButton')}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
