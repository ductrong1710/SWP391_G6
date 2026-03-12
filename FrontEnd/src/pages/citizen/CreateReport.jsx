// src/pages/citizen/CreateReport.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import wasteReportService from "../../services/wasteReportService";

// --- KHẮC PHỤC LỖI MẤT ICON CỦA LEAFLET ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, setFormData }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      map.setView(e.latlng, map.getZoom(), { animate: false });

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: false });
    }
  }, [lat, lng, map]);
  return null;
}

const CreateReport = () => {
  const fileInputRef = useRef(null);

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    wasteTypeIds: [], // ĐỔI THÀNH MẢNG ĐỂ CHỨA NHIỀU ID
    latitude: null,
    longitude: null,
    description: "",
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const defaultCenter = [10.7769, 106.7009];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const data = await wasteReportService.getWasteTypes();
        setWasteTypes(data);
      } catch (err) {
        console.error("Error fetching waste types:", err);
        setError("❌ Unable to load waste type list");
      }
    };
    fetchWasteTypes();
  }, []);

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      setError("❌ Please enter an address to search");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (response.data && response.data.length > 0) {
        const firstResult = response.data[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setMarkerPosition({ lat, lng });
        setSuccess(`✅ Found: ${firstResult.display_name}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("❌ Address not found. Please try again.");
      }
    } catch (err) {
      console.error("Error searching address:", err);
      setError("❌ Error searching for address.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("❌ File size exceeds 10MB");
        return;
      }
      if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        setError("❌ Only PNG, JPG, JPEG image files are supported");
        return;
      }
      setSelectedFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("❌ Your browser does not support GPS");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setMarkerPosition({ lat, lng });
        setSuccess("✅ Current location obtained");
        setTimeout(() => setSuccess(""), 3000);
        setLoadingLocation(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("❌ Unable to get location. Check GPS permissions.");
        setLoadingLocation(false);
      }
    );
  };

  // --- XỬ LÝ CHỌN CHECKBOX ---
  const handleCheckboxChange = (e) => {
    const id = parseInt(e.target.value);
    setFormData((prev) => {
      if (e.target.checked) {
        return { ...prev, wasteTypeIds: [...prev.wasteTypeIds, id] };
      } else {
        return {
          ...prev,
          wasteTypeIds: prev.wasteTypeIds.filter((val) => val !== id),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("❌ Please select an image");
      return;
    }

    if (formData.wasteTypeIds.length === 0) {
      setError("❌ Please select at least one waste type");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("❌ Please select a location on the map");
      return;
    }

    try {
      setLoading(true);

      let latitude = parseFloat(formData.latitude);
      let longitude = parseFloat(formData.longitude);

      latitude = Math.max(-90, Math.min(90, latitude));
      longitude = Math.max(-180, Math.min(180, longitude));

      const submitData = new FormData();
      submitData.append("Image", selectedFile);
      submitData.append(
        "Latitude",
        new Blob([latitude.toString()], { type: "text/plain" })
      );
      submitData.append(
        "Longitude",
        new Blob([longitude.toString()], { type: "text/plain" })
      );
      submitData.append("Description", formData.description || "");

      // NẠP TẤT CẢ CÁC ID LOẠI RÁC ĐÃ CHỌN VÀO FORMDATA
      formData.wasteTypeIds.forEach((id) => {
        submitData.append("WasteTypeIds", id);
      });

      await wasteReportService.createReport(submitData);

      setSuccess("✅ Report submitted successfully! Redirecting to home...");

      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
          wasteTypeIds: [],
          latitude: null,
          longitude: null,
          description: "",
        });
        setMarkerPosition(null);
        setSearchQuery("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        window.location.href = "/citizen/home";
      }, 2000);
    } catch (err) {
      console.error("❌ Error submitting report:", err);
      let errorMsg = "Server error";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") errorMsg = data;
        else if (data.message) errorMsg = data.message;
        else if (data.title) errorMsg = data.title;
      }
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h2
          style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "28px" }}
        >
          📝 Create Waste Report
        </h2>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
          Take a photo &amp; select a location on the map
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {/* CỘT TRÁI: UPLOAD ẢNH & CHỌN LOẠI RÁC */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}
            >
              📷 Upload Waste Photo
            </h3>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: "pointer",
                position: "relative",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                transition: "all 0.3s",
                marginBottom: "15px",
              }}
            >
              {previewUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    padding: "10px",
                  }}
                >
                  <img
                    src={previewUrl}
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setError("");
                    }}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                    📁 Drag &amp; drop an image here or click to select
                  </p>
                  <small style={{ color: "#666" }}>
                    Supported: PNG, JPG, JPEG (Max 10MB)
                  </small>
                </>
              )}

              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* CHỌN LOẠI RÁC THEO KIỂU CHECKBOX */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Waste Types * (You can select multiple)
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#fafafa",
                }}
              >
                {wasteTypes && wasteTypes.length > 0 ? (
                  wasteTypes.map((type) => (
                    <label
                      key={type.wasteTypeId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor: "white",
                        padding: "6px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "20px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      <input
                        type="checkbox"
                        value={type.wasteTypeId}
                        checked={formData.wasteTypeIds.includes(type.wasteTypeId)}
                        onChange={handleCheckboxChange}
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      {type.name}
                    </label>
                  ))
                ) : (
                  <span style={{ color: "#999" }}>Loading list...</span>
                )}
              </div>
            </div>

            {/* MÔ TẢ */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Detailed Description
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add detailed information about the waste (optional)..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}
            >
              📍 Collection Location
            </h3>

            {/* TÌM KIẾM ĐỊA CHỈ */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="E.g.: 123 Main St, Ho Chi Minh City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchAddress();
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
                onClick={handleSearchAddress}
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

            {/* BẢN ĐỒ */}
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
                center={defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker
                  position={markerPosition}
                  setPosition={setMarkerPosition}
                  setFormData={setFormData}
                />
                <RecenterAutomatically
                  lat={formData.latitude}
                  lng={formData.longitude}
                />
              </MapContainer>
            </div>

            {/* NÚT LẤY VỊ TRÍ HIỆN TẠI */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
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
              {loadingLocation
                ? "⏳ Getting location..."
                : "📍 Use Current Location"}
            </button>

            {/* HIỂN THỊ TỌA ĐỘ */}
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
                    color: formData.latitude ? "#10b981" : "#999",
                    fontSize: "14px",
                    marginTop: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  {formData.latitude || "Not selected"}
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
                    color: formData.longitude ? "#10b981" : "#999",
                    fontSize: "14px",
                    marginTop: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  {formData.longitude || "Not selected"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO LỖI & THÀNH CÔNG */}
        <div style={{ marginTop: "20px" }}>
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "5px",
                marginBottom: "10px",
                borderLeft: "4px solid #ef4444",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderRadius: "5px",
                marginBottom: "10px",
                borderLeft: "4px solid #10b981",
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading ? "⏳ Submitting report..." : "✓ Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;