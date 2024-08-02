import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Captcha from "../Captcha/Captcha";
import { useTranslation } from 'react-i18next';
import "./FormPopup.css";

function FormPopup({
  type,
  closeModal,
  switchToOtherForm,
  showNotification,
  handleLogin,
}) {
  const { t } = useTranslation('global');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    additional_info: "",
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [usernameValid, setUsernameValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [emailFormatValid, setEmailFormatValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (type === "register") {
      if (name === "username") {
        if (!value) {
          setUsernameValid(null);
        } else {
          try {
            const response = await axios.get(
              `http://localhost:8000/check-username/${value}`
            );
            setUsernameValid(!response.data.exists);
          } catch (error) {
            console.error("Error checking username:", error);
          }
        }
      }

      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailFormatValid(emailRegex.test(value));
        if (emailRegex.test(value)) {
          try {
            const response = await axios.get(
              `http://localhost:8000/check-email/${value}`
            );
            setEmailValid(!response.data.exists);
          } catch (error) {
            console.error("Error checking email:", error);
          }
        } else {
          setEmailValid(null);
        }
      }

      if (name === "password") {
        const isValid = value.length >= 6 && /\d/.test(value);
        setPasswordValid(isValid);
        setPasswordMatch(value === formData.confirmPassword);
      }

      if (name === "confirmPassword") {
        setPasswordMatch(formData.password === value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "register") {
      if (formData.password !== formData.confirmPassword) {
        showNotification(t("FormPopup.common.validationIcons.passwordsDontMatch"), "error");
        return;
      }
      if (!captchaVerified) {
        showNotification(t("FormPopup.common.errors.captcha"), "error");
        return;
      }

      try {
        const response = await axios.post("http://localhost:8000/register", {
          ...formData,
          role: "customer",
        });

        if (response.status === 200 || response.status === 201) {
          showNotification(t("FormPopup.common.success.registration"), "success");
          closeModal();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const detail = error.response.data.detail;
          if (detail === "Email already registered") {
            showNotification(t("FormPopup.common.errors.emailInUse"), "error");
          } else if (detail === "Username already registered") {
            showNotification(t("FormPopup.common.errors.usernameTaken"), "error");
          } else {
            showNotification(t("FormPopup.common.errors.registrationFailed"), "error");
          }
        } else {
          showNotification(t("FormPopup.common.errors.registrationFailed"), "error");
        }
      }
    } else if (type === "login") {
      try {
        const loginData = new URLSearchParams();
        loginData.append("username", formData.username);
        loginData.append("password", formData.password);

        const response = await axios.post(
          "http://localhost:8000/token",
          loginData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const token = response.data.access_token;
        localStorage.setItem("token", token);

        const decodedToken = jwtDecode(token);

        handleLogin(decodedToken.role, token);

        showNotification(t("FormPopup.common.success.login"), "success");
        closeModal();
      } catch (error) {
        showNotification(t("FormPopup.common.errors.invalidLogin"), "error");
      }
    } else if (["partner", "deliver", "join"].includes(type)) {
      if (!captchaVerified) {
        showNotification(t("FormPopup.common.errors.captcha"), "error");
        return;
      }
      try {
        const requestData = {
          ...formData,
          request_type: type,
        };
        const response = await axios.post(
          "http://localhost:8000/requests/",
          requestData
        );
        if (response.status === 200 || response.status === 201) {
          showNotification(t("FormPopup.common.success.request"), "success");
        } else {
          showNotification(t("FormPopup.common.errors.requestFailed"), "error");
        }
        closeModal();
      } catch (error) {
        showNotification(t("FormPopup.common.errors.requestFailed"), "error");
      }
    }
  };

  const resetFormData = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      additional_info: "",
    });
    setCaptchaVerified(false);
    setPasswordMatch(true);
    setUsernameValid(null);
    setEmailValid(null);
    setEmailFormatValid(null);
    setPasswordValid(null);
  };

  let formFields = [];
  let title = "";
  let switchText = "";
  let switchTextLink = "";

  switch (type) {
    case "login":
      formFields = [
        { label: t("FormPopup.login.usernameLabel"), name: "username", type: "text", required: true },
        { label: t("FormPopup.login.passwordLabel"), name: "password", type: "password", required: true },
      ];
      title = t("FormPopup.login.title");
      switchText = t("FormPopup.login.switchText");
      switchTextLink = t("FormPopup.login.switchTextLink");
      break;

    case "register":
      formFields = [
        { label: t("FormPopup.register.usernameLabel"), name: "username", type: "text", required: true },
        { label: t("FormPopup.register.emailLabel"), name: "email", type: "email", required: true },
        { label: t("FormPopup.register.passwordLabel"), name: "password", type: "password", required: true },
        { label: t("FormPopup.register.confirmPasswordLabel"), name: "confirmPassword", type: "password", required: true },
      ];
      title = t("FormPopup.register.title");
      switchText = t("FormPopup.register.switchText");
      switchTextLink = t("FormPopup.register.switchTextLink");
      break;

    case "partner":
      formFields = [
        { label: t("FormPopup.partner.firstNameLabel"), name: "first_name", type: "text", required: true },
        { label: t("FormPopup.partner.lastNameLabel"), name: "last_name", type: "text", required: true },
        { label: t("FormPopup.partner.emailLabel"), name: "email", type: "email", required: true },
        { label: t("FormPopup.partner.additionalInfoLabel"), name: "additional_info", type: "textarea", required: true },
      ];
      title = t("FormPopup.partner.title");
      break;

    case "deliver":
      formFields = [
        { label: t("FormPopup.deliver.firstNameLabel"), name: "first_name", type: "text", required: true },
        { label: t("FormPopup.deliver.lastNameLabel"), name: "last_name", type: "text", required: true },
        { label: t("FormPopup.deliver.emailLabel"), name: "email", type: "email", required: true },
        { label: t("FormPopup.deliver.additionalInfoLabel"), name: "additional_info", type: "textarea", required: true },
      ];
      title = t("FormPopup.deliver.title");
      break;

    case "join":
      formFields = [
        { label: t("FormPopup.join.firstNameLabel"), name: "first_name", type: "text", required: true },
        { label: t("FormPopup.join.lastNameLabel"), name: "last_name", type: "text", required: true },
        { label: t("FormPopup.join.emailLabel"), name: "email", type: "email", required: true },
        { label: t("FormPopup.join.additionalInfoLabel"), name: "additional_info", type: "textarea", required: true },
      ];
      title = t("FormPopup.join.title");
      break;

    default:
      break;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={closeModal}>
          &times;
        </span>
        <h2 className="modal-h2">{title}</h2>
        {error && <p className="error">{error}</p>}
        <form className="modal-form" onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <div className="input-wrapper">
                {field.type === "textarea" ? (
                  <textarea
                    className="modal-textarea"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  />
                ) : (
                  <input
                    className="modal-input"
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                  />
                )}
                {field.name === "username" &&
                  usernameValid !== null &&
                  formData.username && (
                    <span
                      className="validation-icon"
                      title={
                        usernameValid
                          ? ""
                          : t("FormPopup.common.validationIcons.usernameTaken")
                      }
                    >
                      {usernameValid ? (
                        <FaCheckCircle color="green" />
                      ) : (
                        <FaTimesCircle color="red" />
                      )}
                    </span>
                  )}
                {field.name === "email" &&
                  type === "register" &&
                  formData.email && (
                    <span
                      className="validation-icon"
                      title={
                        !emailFormatValid
                          ? t("FormPopup.common.validationIcons.validEmail")
                          : emailValid === false
                          ? t("FormPopup.common.validationIcons.emailInUse")
                          : ""
                      }
                    >
                      {emailFormatValid === false || emailValid === false ? (
                        <FaTimesCircle color="red" />
                      ) : (
                        <FaCheckCircle color="green" />
                      )}
                    </span>
                  )}
                {field.name === "password" &&
                  passwordValid !== null &&
                  formData.password && (
                    <span
                      className="validation-icon"
                      title={
                        !passwordValid
                          ? t("FormPopup.common.validationIcons.invalidPassword")
                          : ""
                      }
                    >
                      {passwordValid ? (
                        <FaCheckCircle color="green" />
                      ) : (
                        <FaTimesCircle color="red" />
                      )}
                    </span>
                  )}
                {field.name === "confirmPassword" &&
                  passwordMatch !== null &&
                  formData.confirmPassword && (
                    <span
                      className="validation-icon"
                      title={
                        !passwordMatch
                          ? t("FormPopup.common.validationIcons.passwordsDontMatch")
                          : ""
                      }
                    >
                      {passwordMatch ? (
                        <FaCheckCircle color="green" />
                      ) : (
                        <FaTimesCircle color="red" />
                      )}
                    </span>
                  )}
              </div>
              {type === "login" && field.name === "password" && (
                <p
                  className="forgot-password"
                  onClick={() => {
                    closeModal();
                    navigate("/forgot");
                  }}
                >
                  {t("FormPopup.login.forgotPassword")}
                </p>
              )}
            </div>
          ))}
          {(type === "register" ||
            type === "partner" ||
            type === "deliver" ||
            type === "join") && <Captcha onVerify={handleCaptchaVerify} />}
          <button className="modal-button" type="submit">
            {t("FormPopup.common.submit")}
          </button>
        </form>
        {switchText && (
          <p className="switch-text">
            {switchText}{" "}
            <span
              className="switch-link"
              onClick={() => {
                switchToOtherForm(type === "login" ? "register" : "login");
                resetFormData();
              }}
            >
              {switchTextLink}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default FormPopup;
