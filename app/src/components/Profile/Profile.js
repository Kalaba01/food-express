import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, Loading } from "../index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Profile.css";

function Profile({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    profilePicture: null,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setEditData({
          username: response.data.username,
          email: response.data.email,
          profilePicture: response.data.profilePicture,
        });
      } catch (error) {
        console.error('Profile.errorFetchingProfile', error); 
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditButtonClick = () => {
    setIsEditPopupOpen(true);
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordPopupOpen(true);
  };

  const handleCloseChangePasswordPopup = () => {
    setIsChangePasswordPopupOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditData({ ...editData, profilePicture: file });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      if (editData.profilePicture) {
        formData.append("profilePicture", editData.profilePicture);
      }

      const response = await axios.put("http://localhost:8000/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
      setIsEditPopupOpen(false);
      setNotification({ message: t('Profile.profileUpdatedSuccessfully'), type: 'success' });
    } catch (error) {
      console.error(t('Profile.errorSavingProfile'));
      setNotification({ message: t('Profile.errorSavingProfile'), type: 'error' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ message: t('Profile.passwordsDontMatch'), type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:8000/change-password", passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotification({ message: t('Profile.passwordChangedSuccessfully'), type: 'success' });
      setIsChangePasswordPopupOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error.response && error.response.data.detail === "New password cannot be the same as the old password") {
        setNotification({ message: t('Profile.newPasswordCannotBeSame'), type: 'error' });
      } else {
        console.error(t('Profile.errorChangingPassword'));
        setNotification({ message: t('Profile.errorChangingPassword'), type: 'error' });
      }
    }
  };


  if (loading) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="courier"
        />
        <Loading />;
      </>
    );
  }

  return (
    <>
      {user && (
        <>
          <Header
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            userType={user.role}
          />
          <div className="profile-container">
            <div className="profile-card">
              <img
                src={`data:image/jpeg;base64,${user.profilePicture}`}
                alt={t('Profile.profilePicture')}
                className="profile-picture"
              />
              <h2 className="profile-username">{user.username}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">{user.role}</p>
              <button className="edit-button" onClick={handleEditButtonClick}>
                {t('Profile.editProfile')}
              </button>
              <button className="change-password-button" onClick={handleChangePasswordClick}>
                {t('Profile.changePassword')}
              </button>
            </div>
          </div>

          {isEditPopupOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-button" onClick={handleCloseEditPopup}>
                  &times;
                </span>
                <h2>{t('Profile.editProfile')}</h2>
                <form>
                  <label>
                    {t('Profile.username')}:
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    {t('Profile.email')}:
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label className="image-upload-label">
                    {t('Profile.profilePicture')}:
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button type="button" onClick={handleSave}>
                    {t('Profile.save')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {isChangePasswordPopupOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-button" onClick={handleCloseChangePasswordPopup}>
                  &times;
                </span>
                <h2>{t('Profile.changePassword')}</h2>
                <form>
                  <label>
                    {t('Profile.oldPassword')}:
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>
                  <label>
                    {t('Profile.newPassword')}:
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>
                  <label>
                    {t('Profile.confirmNewPassword')}:
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </label>
                  <button type="button" onClick={handleChangePassword}>
                    {t('Profile.changePassword')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
      {notification.message && (
        <NotificationPopup message={notification.message} type={notification.type} />
      )}
    </>
  );
}

export default Profile;
