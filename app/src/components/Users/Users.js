import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer, NotificationPopup } from '../index';
import './Users.css';

function Users({ darkMode, toggleDarkMode }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editOption, setEditOption] = useState('');
  const [filterRole, setFilterRole] = useState('all');

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

  const handleSaveClick = async () => {
    if (!editUser || !editField) return;

    if (editOption === 'password' && editValue !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    const updateData = { [editField]: editValue };

    try {
      await axios.put(`http://localhost:8000/users/${editUser.id}`, updateData);
      setUsers(users.map(user => (user.id === editUser.id ? { ...user, ...updateData } : user)));
      setEditUser(null);
      resetPopup();
      showNotification('User updated successfully', 'success');
    } catch (error) {
      if (error.response && error.response.data.detail === "New password cannot be the same as the old password") {
        showNotification('New password cannot be the same as the old password', 'error');
      } else {
        showNotification('Error updating user', 'error');
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

  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
      <div className="users-container">
        <h1>Users</h1>
        <div className="filter-buttons">
          <button className={`filter-button ${filterRole === 'all' ? 'active' : ''}`} onClick={() => handleRoleFilter('all')}>All</button>
          <button className={`filter-button ${filterRole === 'administrator' ? 'active' : ''}`} onClick={() => handleRoleFilter('administrator')}>Admin</button>
          <button className={`filter-button ${filterRole === 'owner' ? 'active' : ''}`} onClick={() => handleRoleFilter('owner')}>Owner</button>
          <button className={`filter-button ${filterRole === 'courier' ? 'active' : ''}`} onClick={() => handleRoleFilter('courier')}>Courier</button>
          <button className={`filter-button ${filterRole === 'customer' ? 'active' : ''}`} onClick={() => handleRoleFilter('customer')}>Customer</button>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>E-mail</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEditClick(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>&times;</span>
            <h2>Edit User</h2>
            <select onChange={handleOptionChange} value={editOption} className="select-field">
              <option value="">Select field to edit</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="role">Role</option>
            </select>
            {editOption && (
              <>
                {editOption === 'role' ? (
                  <select value={editValue} onChange={handleInputChange} className="input-field">
                    <option value="administrator">Administrator</option>
                    <option value="owner">Owner</option>
                    <option value="courier">Courier</option>
                    <option value="customer">Customer</option>
                  </select>
                ) : (
                  <>
                    <input
                      type={editOption === 'password' ? 'password' : 'text'}
                      value={editValue}
                      onChange={handleInputChange}
                      placeholder={`Enter new ${editOption}`}
                      className="input-field"
                    />
                    {editOption === 'password' && (
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Confirm password"
                        className="input-field"
                      />
                    )}
                  </>
                )}
                <button className="save-button" onClick={handleSaveClick}>Save</button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Users;
