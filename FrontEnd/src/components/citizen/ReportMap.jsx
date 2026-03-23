import React, { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { DEFAULT_REPORT_CENTER } from "../../utils/reportForm";

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const LocationMarker = ({ position, onPickLocation }) => {
  const map = useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onPickLocation(lat, lng);
      map.setView(event.latlng, map.getZoom(), { animate: false });
    },
  });

  return position ? <Marker position={position} /> : null;
};

const RecenterAutomatically = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 16, { animate: false });
    }
  }, [latitude, longitude, map]);

  return null;
};

const ReportMap = ({
  searchQuery,
  setSearchQuery,
  onSearchAddress,
  isSearching,
  markerPosition,
  onPickLocation,
  latitude,
  longitude,
  onGetCurrentLocation,
  loadingLocation,
}) => {
  return (
    <>
      <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}>
        📍 Collection Location
      </h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="E.g.: 123 Main St, Ho Chi Minh City..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearchAddress();
            }
          }}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={onSearchAddress}
          disabled={isSearching}
          style={{
            padding: "10px 15px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isSearching ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: isSearching ? 0.7 : 1,
          }}
        >
          {isSearching ? "⏳" : "🔍"} Search
        </button>
      </div>

      <div
        style={{
          height: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #ddd",
          marginBottom: "15px",
        }}
      >
        <MapContainer
          center={DEFAULT_REPORT_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker position={markerPosition} onPickLocation={onPickLocation} />
          <RecenterAutomatically latitude={latitude} longitude={longitude} />
        </MapContainer>
      </div>

      <button
        type="button"
        onClick={onGetCurrentLocation}
        disabled={loadingLocation}
        style={{
          width: "100%",
          padding: "10px",
          background: loadingLocation ? "#ccc" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loadingLocation ? "not-allowed" : "pointer",
          fontWeight: "bold",
          marginBottom: "15px",
        }}
      >
        {loadingLocation ? "⏳ Getting location..." : "📍 Use Current Location"}
      </button>

      <div>
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "5px",
            marginBottom: "8px",
          }}
        >
          <strong>🌍 Latitude (Lat):</strong>
          <div
            style={{
              display: "block",
              color: latitude ? "#10b981" : "#999",
              fontSize: "14px",
              marginTop: "4px",
              fontFamily: "monospace",
            }}
          >
            {latitude || "Not selected"}
          </div>
        </div>

        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          <strong>🌍 Longitude (Lng):</strong>
          <div
            style={{
              display: "block",
              color: longitude ? "#10b981" : "#999",
              fontSize: "14px",
              marginTop: "4px",
              fontFamily: "monospace",
            }}
          >
            {longitude || "Not selected"}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportMap;
