import React, { useState, useEffect } from "react";
import { Header, NotificationPopup, LookupTable, ConfirmDelete, Map, Loading } from "../index";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { FaMapPin, FaTrash } from "react-icons/fa";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../LookupTable/LookupTable.css";

function DeliveryZones({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation("global");
  const [zones, setZones] = useState([]);
  const [editZone, setEditZone] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    bounds: null,
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect fetches the delivery zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/delivery-zones/"
        );
        setZones(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching delivery zones:", error);
        setIsLoading(false);
      }
    };

    fetchZones();
  }, []);

  // handleEditClick sets the selected zone for editing and opens the popup
  const handleEditClick = (zone) => {
    setEditZone(zone);
    setIsPopupOpen(true);
  };

  // handleMapClick sets the selected zone to view it on the map and opens the map popup
  const handleMapClick = (zone) => {
    setEditZone(zone);
    setIsMapPopupOpen(true);
  };

  // handleDeleteClick sets the selected zone for deletion and opens the delete confirmation popup
  const handleDeleteClick = (zone) => {
    setZoneToDelete(zone);
    setDeletePopupOpen(true);
  };

  // confirmDelete deletes the selected zone
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/delivery-zones/${zoneToDelete.id}`
      );
      setZones(zones.filter((zone) => zone.id !== zoneToDelete.id));
      showNotification(t("DeliveryZones.success.delete"), "success");
    } catch (error) {
      showNotification(t("FormPopup.errors.requestFailed"), "error");
    } finally {
      setDeletePopupOpen(false);
      setZoneToDelete(null);
    }
  };

  // cancelDelete cancels the deletion and closes the delete confirmation popup
  const cancelDelete = () => {
    setDeletePopupOpen(false);
    setZoneToDelete(null);
  };

  // handleSaveClick updates an existing delivery zone
  const handleSaveClick = async (event) => {
    event.preventDefault();

    if (!editZone) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/delivery-zones/${editZone.id}`,
        editZone
      );
      setZones(
        zones.map((zone) => (zone.id === editZone.id ? response.data : zone))
      );
      setEditZone(null);
      resetPopup();
      showNotification(t("FormPopup.common.success.edit"), "success");
    } catch (error) {
      showNotification(t("FormPopup.common.errors.requestFailed"), "error");
    }
  };

  // handleNewZoneSave saves a new delivery zone after creating its name and bounds
  const handleNewZoneSave = async (event) => {
    event.preventDefault();

    if (!newZone.name) {
      showNotification(t("DeliveryZones.enterName"), "error");
      return;
    }

    if (!newZone.bounds) {
      showNotification(t("DeliveryZones.selectArea"), "error");
      return;
    }

    if (zones.some((zone) => zone.name === newZone.name)) {
      showNotification(t("DeliveryZones.duplicateName"), "error");
      return;
    }

    const bounds = newZone.bounds;
    const zoneData = {
      name: newZone.name,
      point1_latitude: bounds[0][0],
      point1_longitude: bounds[0][1],
      point2_latitude: bounds[1][0],
      point2_longitude: bounds[1][1],
      point3_latitude: bounds[0][0],
      point3_longitude: bounds[1][1],
      point4_latitude: bounds[1][0],
      point4_longitude: bounds[0][1],
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/delivery-zones/",
        zoneData
      );
      setZones([...zones, response.data]);
      resetPopup();
      showNotification(t("FormPopup.common.success.create"), "success");
    } catch (error) {
      showNotification(t("FormPopup.common.errors.requestFailed"), "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // handleCreated stores the bounds of a newly created zone from the map drawing tool
  const handleCreated = (e) => {
    const layer = e.layer;
    const bounds = layer.getBounds();
    setNewZone({
      ...newZone,
      bounds: [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ],
    });
  };

  // handleEditBoundsChange updates the bounds of an existing zone when edited on the map
  const handleEditBoundsChange = (e) => {
    const layer = e.target;
    const bounds = layer.getBounds();
    setEditZone({
      ...editZone,
      point1_latitude: bounds.getSouthWest().lat,
      point1_longitude: bounds.getSouthWest().lng,
      point2_latitude: bounds.getNorthEast().lat,
      point2_longitude: bounds.getNorthEast().lng,
      point3_latitude: bounds.getSouthWest().lat,
      point3_longitude: bounds.getNorthEast().lng,
      point4_latitude: bounds.getNorthEast().lat,
      point4_longitude: bounds.getSouthWest().lng,
    });
  };

  // resetPopup closes all popups and resets the zone form data
  const resetPopup = () => {
    setIsPopupOpen(false);
    setIsMapPopupOpen(false);
    setNewZone({ name: "", bounds: null });
    setEditZone(null);
  };

  const columns = [t("DeliveryZones.name")];

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
      <div className="zones-container">
        <h1>{t("DeliveryZones.title")}</h1>
        <button className="create-button" onClick={() => setIsPopupOpen(true)}>
          {t("DeliveryZones.create")}
        </button>
        <LookupTable
          columns={columns}
          data={zones}
          actions={[
            {
              label: t("DeliveryZones.edit"),
              className: "edit-button",
              handler: handleEditClick,
            },
            {
              label: <FaMapPin />,
              className: "map-icon",
              handler: handleMapClick,
            },
            {
              label: <FaTrash />,
              className: "delete-button",
              handler: handleDeleteClick,
            },
          ]}
          showActions
        />
      </div>

      {isPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>
              &times;
            </span>
            <h2>
              {editZone
                ? t("DeliveryZones.editZone")
                : t("DeliveryZones.createZone")}
            </h2>
            <form onSubmit={editZone ? handleSaveClick : handleNewZoneSave}>
              <input
                type="text"
                value={editZone ? editZone.name : newZone.name}
                onChange={(e) =>
                  editZone
                    ? setEditZone({ ...editZone, name: e.target.value })
                    : setNewZone({ ...newZone, name: e.target.value })
                }
                placeholder={t("DeliveryZones.name")}
                className="input-field"
                required
              />
              <MapContainer
                style={{ height: "400px", width: "350px" }}
                center={
                  editZone && editZone.point1_latitude && editZone.point1_longitude
                    ? [editZone.point1_latitude, editZone.point1_longitude]
                    : [43.856746, 18.412669] // Dodajte default vrednosti da izbegnete grešku
                }
                zoom={15}
                whenCreated={(map) => {
                  if (editZone) {
                    const bounds = [
                      [editZone.point1_latitude, editZone.point1_longitude],
                      [editZone.point3_latitude, editZone.point3_longitude],
                    ];
                    const rectangle = new L.Rectangle(bounds, {
                      draggable: true,
                    });
                    rectangle.addTo(map);
                    rectangle.on("edit", () => {
                      handleEditBoundsChange({ target: rectangle });
                    });
                  }
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <FeatureGroup>
                  <EditControl
                    position="topright"
                    onCreated={handleCreated}
                    draw={{
                      rectangle: true,
                      polyline: false,
                      polygon: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
              <button type="submit" className="save-button">
                {editZone ? t("DeliveryZones.save") : t("DeliveryZones.create")}
              </button>
            </form>
          </div>
        </div>
      )}

      {isMapPopupOpen && editZone && (
        <div className="modal">
          <div className="modal-content map-popup">
            <span className="close-button" onClick={resetPopup}>
              &times;
            </span>
            <h2>{t("DeliveryZones.viewZone")}</h2>
            <Map
              bounds={[
                [editZone.point1_latitude, editZone.point1_longitude],
                [editZone.point2_latitude, editZone.point2_longitude],
                [editZone.point3_latitude, editZone.point3_longitude],
                [editZone.point4_latitude, editZone.point4_longitude]
              ]}
            />
          </div>
        </div>
      )}

      <ConfirmDelete
        isOpen={deletePopupOpen}
        message={t("DeliveryZones.confirmDeleteMessage")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default DeliveryZones;
