import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, LookupTable, Loading } from "../index";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../LookupTable/LookupTable.css";

function Requests({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [requests, setRequests] = useState([]);
  const [filterRole, setFilterRole] = useState("pending");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Fetches requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:8000/requests/");
        setRequests(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Function to update the status of a specific request
  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.put(`http://localhost:8000/requests/${id}`, {
        status,
      });
      setRequests(
        requests.map((request) =>
          request.id === id ? { ...request, status } : request
        )
      );
      setNotification({ message: `Request ${status}`, type: "success" });

      if (status === "accepted" && response.data.status === "accepted") {
        setNotification({
          message: "User account created and email sent successfully.",
          type: "success",
        });
      }
    } catch (error) {
      setNotification({
        message: "Error updating request status",
        type: "error",
      });
      console.error("Error updating request status:", error);
    }
  };

  // Function to handle filtering requests by their status
  const handleRoleFilter = (role) => {
    setFilterRole(role);
  };

  const filteredRequests = requests.filter(
    (request) => request.status === filterRole
  );

  const columns = [
    t("Requests.ime"),
    t("Requests.prezime"),
    t("Requests.email"),
    t("Requests.info"),
    t("Requests.type"),
    t("Requests.created"),
  ];

  if (isLoading) {
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

  if (!(requests.length > 0)) {
    return (
      <>
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userType="administrator"
        />
        <p>{t("Requests.noRequests")}</p>
      </>
    );
  }

  return (
    <div>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        userType="administrator"
      />
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
        />
      )}
      <div className="requests-container">
        <h1>{t("Requests.title")}</h1>
        <div className="filter-buttons">
          <button
            className={`filter-button ${
              filterRole === "pending" ? "active" : ""
            }`}
            onClick={() => handleRoleFilter("pending")}
          >
            {t("Requests.pending")}
          </button>
          <button
            className={`filter-button ${
              filterRole === "accepted" ? "active" : ""
            }`}
            onClick={() => handleRoleFilter("accepted")}
          >
            {t("Requests.accepted")}
          </button>
          <button
            className={`filter-button ${
              filterRole === "denied" ? "active" : ""
            }`}
            onClick={() => handleRoleFilter("denied")}
          >
            {t("Requests.denied")}
          </button>
        </div>
        <LookupTable
          columns={columns}
          data={filteredRequests}
          actions={[
            {
              label: t("Requests.accept"),
              className: "accept-button",
              handler: (request) => updateRequestStatus(request.id, "accepted"),
              show: filterRole === "pending",
            },
            {
              label: t("Requests.deny"),
              className: "deny-button",
              handler: (request) => updateRequestStatus(request.id, "denied"),
              show: filterRole === "pending",
            },
          ]}
          filterRole={filterRole}
          showActions={filterRole === "pending"}
        />
      </div>
    </div>
  );
}

export default Requests;
