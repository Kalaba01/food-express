import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const customMarkerIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Map({ latitude, longitude, address, bounds }) {
  return (
    <div className="map-popup">
      <MapContainer
        style={{ height: "400px", width: "100%" }}
        center={bounds ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] : [latitude, longitude]}
        zoom={15}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {bounds ? (
          <Rectangle bounds={bounds} />
        ) : (
          <Marker position={[latitude, longitude]} icon={customMarkerIcon}>
            <Popup>{address}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
