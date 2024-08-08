import React, { useState, useEffect, useRef } from 'react';
import { Header, NotificationPopup, LookupTable } from '../index';
import { MapContainer, TileLayer, FeatureGroup, Rectangle } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { FaMapPin, FaTrash } from 'react-icons/fa';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../LookupTable/LookupTable.css';

function DeliveryZones({ darkMode, toggleDarkMode }) {
  const { t } = useTranslation('global');
  const [zones, setZones] = useState([]);
  const [editZone, setEditZone] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    bounds: null
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const editGroupRef = useRef(null); // Dodaj referencu za edit grupu

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get('http://localhost:8000/delivery-zones/');
        setZones(response.data);
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
      }
    };

    fetchZones();
  }, []);

  const handleEditClick = (zone) => {
    setEditZone(zone);
    setIsPopupOpen(true);
  };

  const handleMapClick = (zone) => {
    setEditZone(zone);
    setIsMapPopupOpen(true);
  };

  const handleDeleteClick = async (zoneId) => {
    try {
      await axios.delete(`http://localhost:8000/delivery-zones/${zoneId}`);
      setZones(zones.filter(zone => zone.id !== zoneId));
      showNotification(t('FormPopup.common.success.delete'), 'success');
    } catch (error) {
      showNotification(t('FormPopup.common.errors.requestFailed'), 'error');
    }
  };

  const handleSaveClick = async (event) => {
    event.preventDefault();

    if (!editZone) return;

    try {
      const response = await axios.put(`http://localhost:8000/delivery-zones/${editZone.id}`, editZone);
      setZones(zones.map(zone => (zone.id === editZone.id ? response.data : zone)));
      setEditZone(null);
      resetPopup();
      showNotification(t('FormPopup.common.success.edit'), 'success');
    } catch (error) {
      showNotification(t('FormPopup.common.errors.requestFailed'), 'error');
    }
  };

  const handleNewZoneSave = async (event) => {
    event.preventDefault();

    if (!newZone.name) {
      showNotification(t('DeliveryZones.enterName'), 'error');
      return;
    }

    if (!newZone.bounds) {
      showNotification(t('DeliveryZones.selectArea'), 'error');
      return;
    }

    if (zones.some(zone => zone.name === newZone.name)) {
      showNotification(t('DeliveryZones.duplicateName'), 'error');
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
      const response = await axios.post('http://localhost:8000/delivery-zones/', zoneData);
      setZones([...zones, response.data]);
      resetPopup();
      showNotification(t('FormPopup.common.success.create'), 'success');
    } catch (error) {
      showNotification(t('FormPopup.common.errors.requestFailed'), 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    const bounds = layer.getBounds();
    setNewZone({
      ...newZone,
      bounds: [[bounds.getSouthWest().lat, bounds.getSouthWest().lng], [bounds.getNorthEast().lat, bounds.getNorthEast().lng]]
    });
  };

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

  const resetPopup = () => {
    setIsPopupOpen(false);
    setIsMapPopupOpen(false);
    setNewZone({ name: '', bounds: null });
    setEditZone(null);
  };

  const columns = [t('DeliveryZones.name')];

  return (
    <div>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} userType="administrator" />
      {notification.message && <NotificationPopup message={notification.message} type={notification.type} />}
      <div className="zones-container">
        <h1>{t('DeliveryZones.title')}</h1>
        <button className="create-button" onClick={() => setIsPopupOpen(true)}>{t('DeliveryZones.create')}</button>
        <LookupTable
          columns={columns}
          data={zones}
          actions={[
            {
              label: t('DeliveryZones.edit'),
              className: 'edit-button',
              handler: handleEditClick,
            },
            {
              label: <FaMapPin />,
              className: 'map-icon',
              handler: handleMapClick,
            },
            {
              label: <FaTrash />,
              className: 'delete-button',
              handler: (zone) => handleDeleteClick(zone.id),
            }
          ]}
          showActions
        />
      </div>

      {isPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>&times;</span>
            <h2>{editZone ? t('DeliveryZones.editZone') : t('DeliveryZones.createZone')}</h2>
            <form onSubmit={editZone ? handleSaveClick : handleNewZoneSave}>
              <input
                type="text"
                value={editZone ? editZone.name : newZone.name}
                onChange={(e) => editZone ? setEditZone({ ...editZone, name: e.target.value }) : setNewZone({ ...newZone, name: e.target.value })}
                placeholder={t('DeliveryZones.name')}
                className="input-field"
                required
              />
              <MapContainer
                style={{ height: '400px', width: '100%' }}
                center={[51.505, -0.09]}
                zoom={13}
                whenCreated={(map) => {
                  if (editZone) {
                    const bounds = [
                      [editZone.point1_latitude, editZone.point1_longitude],
                      [editZone.point3_latitude, editZone.point3_longitude]
                    ];
                    const rectangle = new L.Rectangle(bounds, { draggable: true });
                    rectangle.addTo(map);
                    rectangle.on('edit', () => {
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
                      marker: false
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
              <button type="submit" className="save-button">{editZone ? t('DeliveryZones.save') : t('DeliveryZones.create')}</button>
            </form>
          </div>
        </div>
      )}

      {isMapPopupOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={resetPopup}>&times;</span>
            <h2>{t('DeliveryZones.viewZone')}</h2>
            <MapContainer
              style={{ height: '400px', width: '100%' }}
              center={[
                (editZone.point1_latitude + editZone.point3_latitude) / 2,
                (editZone.point1_longitude + editZone.point3_longitude) / 2
              ]}
              zoom={13}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Rectangle
                bounds={[
                  [editZone.point1_latitude, editZone.point1_longitude],
                  [editZone.point2_latitude, editZone.point2_longitude],
                  [editZone.point3_latitude, editZone.point3_longitude],
                  [editZone.point4_latitude, editZone.point4_longitude]
                ]}
              />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryZones;
