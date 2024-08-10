import React, { useState, useEffect } from 'react';
import { Header, NotificationPopup, LookupTable } from '../index';
import { useTranslation } from 'react-i18next';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../LookupTable/LookupTable.css';

function Users({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editOption, setEditOption] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditUser(user);
    setIsPopupOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/users/${userToDelete.id}`);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      showNotification(t('Users.deleteSuccess'), 'success');
    } catch (error) {
      showNotification(t('Users.deleteError'), 'error');
    } finally {
      setDeletePopupOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeletePopupOpen(false);
    setUserToDelete(null);
  };

  const handleSaveClick = async (event) => {
    event.preventDefault();

    if (!editUser || !editField) return;

    if (editOption === 'password' && editValue !== confirmPassword) {
      showNotification(t('FormPopup.common.validationIcons.passwordsDontMatch'), 'error');
      return;
    }

    const updateData = { [editField]: editValue };

    try {
      const response = await axios.put(`http://localhost:8000/users/${editUser.id}`, updateData);
      
      if (response.data.message === 'New password cannot be the same as the old password') {
        showNotification(t('Users.passwordSameAsOld'), 'error');
        return;
      }

      setUsers(users.map(user => (user.id === editUser.id ? { ...user, ...updateData } : user)));
      setEditUser(null);
      resetPopup();
      showNotification(t('FormPopup.common.success.registration'), 'success');
    } catch (error) {
      if (error.response && error.response.data.detail === 'New password cannot be the same as the old password') {
        showNotification(t('Users.passwordSameAsOld'), 'error');
      } else {
        showNotification(t('FormPopup.common.errors.requestFailed'), 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleOptionChange = (event) => {
    setEditOption(event.target.value);
    setEditField(event.target.value);
    setEditValue(event.target.value === 'password' ? '' : editUser[event.target.value]);
    if (event.target.value !== 'password') {
      setConfirmPassword('');
    }
  };

  const handleInputChange = (event) => {
    setEditValue(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const resetPopup = () => {
    setIsPopupOpen(false);
    setEditOption('');
    setEditField('');
    setEditValue('');
    setConfirmPassword('');
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
  };

  const filteredUsers = filterRole === 'all' ? users : users.filter(user => user.role === filterRole);

  const columns = [t('Users.username'), t('Users.email'), t('Users.role')];

  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
      <div className="users-container">
        <h1>{t('Users.title')}</h1>
        <div className="filter-buttons">
          <button className={`filter-button ${filterRole === 'all' ? 'active' : ''}`} onClick={() => handleRoleFilter('all')}>{t('Users.all')}</button>
          <button className={`filter-button ${filterRole === 'administrator' ? 'active' : ''}`} onClick={() => handleRoleFilter('administrator')}>{t('Users.administrator')}</button>
          <button className={`filter-button ${filterRole === 'owner' ? 'active' : ''}`} onClick={() => handleRoleFilter('owner')}>{t('Users.owner')}</button>
          <button className={`filter-button ${filterRole === 'courier' ? 'active' : ''}`} onClick={() => handleRoleFilter('courier')}>{t('Users.courier')}</button>
          <button className={`filter-button ${filterRole === 'customer' ? 'active' : ''}`} onClick={() => handleRoleFilter('customer')}>{t('Users.customer')}</button>
        </div>
        <LookupTable
          columns={columns}
          data={filteredUsers}
          actions={[
            {
              label: t('Users.edit'),
              className: 'edit-button',
              handler: handleEditClick,
            },
            {
              label: <FaTrash />,
              className: 'delete-button',
              handler: handleDeleteClick,
            }
          ]}
          filterRole={filterRole}
          showActions={true}
        />
      </div>

      {isPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>&times;</span>
            <h2>{t('Users.editUser')}</h2>
            <form onSubmit={handleSaveClick}>
              <select onChange={handleOptionChange} value={editOption} className="select-field" required>
                <option value="">{t('Users.selectField')}</option>
                <option value="username">{t('Users.username')}</option>
                <option value="email">{t('Users.email')}</option>
                <option value="password">{t('Users.password')}</option>
                <option value="role">{t('Users.role')}</option>
              </select>
              {editOption && (
                <>
                  {editOption === 'role' ? (
                    <select value={editValue} onChange={handleInputChange} className="input-field" required>
                      <option value="administrator">{t('Users.administrator')}</option>
                      <option value="owner">{t('Users.owner')}</option>
                      <option value="courier">{t('Users.courier')}</option>
                      <option value="customer">{t('Users.customer')}</option>
                    </select>
                  ) : (
                    <>
                      <input
                        type={editOption === 'password' ? 'password' : editOption === 'email' ? 'email' : 'text'}
                        value={editValue}
                        onChange={handleInputChange}
                        placeholder={t(`Users.enterNew${editOption.charAt(0).toUpperCase() + editOption.slice(1)}`)}
                        className="input-field"
                        required
                        pattern={editOption === 'password' ? "^(?=.*[0-9]).{6,}$" : undefined}
                        title={editOption === 'password' ? t('Users.passwordRequirements') : undefined}
                      />
                      {editOption === 'password' && (
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          placeholder={t('Users.confirmPassword')}
                          className="input-field"
                          required
                        />
                      )}
                    </>
                  )}
                  <button type="submit" className="save-button">{t('Users.save')}</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {deletePopupOpen && (
        <div className="modal">
          <div className="modal-content delete-popup">
            <h2>{t('Users.confirmDeleteTitle')}</h2>
            <p>{t('Users.confirmDeleteMessage')}</p>
            <div className="delete-popup-buttons">
              <button className="confirm-delete-button" onClick={confirmDelete}>{t('Users.confirm')}</button>
              <button className="cancel-delete-button" onClick={cancelDelete}>{t('Users.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
