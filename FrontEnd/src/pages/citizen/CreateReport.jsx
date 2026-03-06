import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
import './CreateReport.css';
// --- FIX LEAFLET ICON ISSUE ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SUB-COMPONENT: HANDLE MAP CLICKS ---
function LocationMarker({ position, setPosition, setFormData }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      map.setView(e.latlng, map.getZoom(), { animate: false });

      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

// --- SUB-COMPONENT: AUTO RECENTER MAP ---
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: false });
    }
  }, [lat, lng, map]);
  return null;
}

const API_BASE_URL = 'http://localhost:5021/api';

const CreateReport = () => {
  const fileInputRef = useRef(null);
  
  // --- STATE MANAGEMENT ---
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    wasteTypeIds: [], // Stores array of checked IDs
    latitude: null,
    longitude: null,
    description: ''
  });

  // Map & Search State
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const defaultCenter = [10.7769, 106.7009];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // --- FETCH WASTE TYPES ---
  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/waste-types`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setWasteTypes(response.data);
      } catch (err) {
        console.error('Error fetching waste types:', err);
        setError('❌ Unable to load waste types');
      }
    };

    fetchWasteTypes();
  }, []);

  // --- ADDRESS SEARCH ---
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      setError('❌ Please enter an address to search');
      return;
    }
    
    setIsSearching(true);
    setError('');

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );

      if (response.data && response.data.length > 0) {
        const firstResult = response.data[0];
        const lat = parseFloat(firstResult.lat);
        const lng = parseFloat(firstResult.lon);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        setMarkerPosition({ lat, lng });
        setSuccess(`✅ Found: ${firstResult.display_name}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('❌ Address not found. Please try again.');
      }
    } catch (err) {
      console.error('Error searching address:', err);
      setError('❌ Error searching address.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- HANDLE MULTIPLE IMAGE FILES ---
  const processFiles = (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;

    if (selectedFiles.length + filesArray.length > 5) {
      setError('❌ You can only upload up to 5 images');
      return;
    }

    let hasError = false;
    const validFiles = [];
    const newPreviewUrls = [];

    filesArray.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError('❌ Some files exceed the 10MB limit');
        hasError = true;
      } else if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        setError('❌ Only PNG, JPG, JPEG image files are supported');
        hasError = true;
      } else {
        validFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    });

    if (!hasError) setError('');
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    processFiles(filesArray);
    e.target.value = null; 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const filesArray = Array.from(e.dataTransfer.files);
    processFiles(filesArray);
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prev => {
      const urlToRemove = prev[indexToRemove];
      URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  // --- HANDLE CHECKBOX CHANGES ---
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        wasteTypeIds: [...prev.wasteTypeIds, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        wasteTypeIds: prev.wasteTypeIds.filter(id => id !== value)
      }));
    }
  };

  // --- GET CURRENT GPS LOCATION ---
  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('❌ Browser does not support GPS');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        setMarkerPosition({ lat, lng });
        setSuccess('✅ Current location acquired');
        setTimeout(() => setSuccess(''), 3000);
        setLoadingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('❌ Unable to get location. Check GPS permissions.');
        setLoadingLocation(false);
      }
    );
  };

  // --- SUBMIT REPORT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ VALIDATION
    if (selectedFiles.length === 0) {
      setError('❌ Please select at least 1 image');
      return;
    }

    if (!formData.wasteTypeIds || formData.wasteTypeIds.length === 0) {
      setError('❌ Please select at least 1 waste type');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('❌ Please select a location on the map');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('❌ You are not logged in');
        return;
      }

      let latitude = parseFloat(formData.latitude);
      let longitude = parseFloat(formData.longitude);
      latitude = Math.max(-90, Math.min(90, latitude));
      longitude = Math.max(-180, Math.min(180, longitude));

      const submitData = new FormData();
      
      // Append MULTIPLE files
      selectedFiles.forEach((file) => {
        submitData.append('Images', file);
      });

      // Append MULTIPLE WasteTypeIds
      formData.wasteTypeIds.forEach((id) => {
        submitData.append('WasteTypeIds', parseInt(id));
      });
      
      // Format correctly for C# Decimal
      submitData.append('Latitude', new Blob([latitude.toString()], { type: 'text/plain' }));
      submitData.append('Longitude', new Blob([longitude.toString()], { type: 'text/plain' }));
      submitData.append('Description', formData.description || '');

      const response = await axios.post(
        `${API_BASE_URL}/waste-reports`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('✅ Report submitted successfully! Redirecting to home...');

      setTimeout(() => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        setFormData({
          wasteTypeIds: [],
          latitude: null,
          longitude: null,
          description: ''
        });
        setMarkerPosition(null);
        setSearchQuery('');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        window.location.href = '/citizen/home';
      }, 2000);

    } catch (err) {
      console.error('❌ Full Error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        let errorMsg = 'Server error';
        
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.errors) {
          if (typeof data.errors === 'object') {
            const errorsArray = Object.entries(data.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            errorMsg = errorsArray.join('; ');
          } else {
            errorMsg = JSON.stringify(data.errors);
          }
        } else if (data.title) {
          errorMsg = data.title;
        }
        
        setError(`❌ ${errorMsg}`);
      } else if (err.request) {
        setError('❌ Unable to connect to server. Check the backend.');
      } else {
        setError(`❌ An error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#1f2937', margin: '0 0 10px 0', fontSize: '28px' }}>📝 Create Waste Report</h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Take a photo & Select location on map</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>

          {/* LEFT COLUMN */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1f2937' }}>📷 Upload Waste Images</h3>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer', position: 'relative', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px dashed #10b981', borderRadius: '8px', backgroundColor: '#ecfdf5', transition: 'all 0.3s', marginBottom: '15px', padding: '20px' }}
            >
              <p style={{ fontSize: '16px', marginBottom: '10px', color: '#059669', fontWeight: 'bold' }}>
                📁 Drag and drop or click to select multiple images
              </p>
              <small style={{ color: '#666' }}>Supported: PNG, JPG, JPEG (Max 10MB/image, up to 5 images)</small>

              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* IMAGE PREVIEW GRID */}
            {previewUrls.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220, 38, 38, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* MULTIPLE WASTE TYPE SELECTION (CHECKBOXES) */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>
                Waste Type *
              </label>
              
              {/* Checkbox Grid (2 columns) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                maxHeight: '160px',
                overflowY: 'auto'
              }}>
                {wasteTypes && wasteTypes.length > 0 ? (
                  wasteTypes.map((type) => (
                    <label 
                      key={type.wasteTypeId} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    >
                      <input
                        type="checkbox"
                        value={type.wasteTypeId}
                        checked={formData.wasteTypeIds.includes(type.wasteTypeId.toString())}
                        onChange={handleCheckboxChange}
                        style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      {type.name}
                    </label>
                  ))
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '14px', gridColumn: 'span 2' }}>
                    Loading list...
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>Detailed Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add detailed information..."
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: MAP */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1f2937' }}>📍 Collection Location</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Ex: 123 Main St, Ho Chi Minh City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={handleSearchAddress} disabled={isSearching} style={{ padding: '10px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: isSearching ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {isSearching ? '⏳' : '🔍'} Search
              </button>
            </div>

            <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', marginBottom: '15px' }}>
              <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={markerPosition} setPosition={setMarkerPosition} setFormData={setFormData} />
                <RecenterAutomatically lat={formData.latitude} lng={formData.longitude} />
              </MapContainer>
            </div>

            <button type="button" onClick={handleGetCurrentLocation} disabled={loadingLocation} style={{ width: '100%', padding: '10px', background: loadingLocation ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
              📍 Use Current Location
            </button>

            {/* DISPLAY COORDINATES */}
            <div>
              <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', marginBottom: '8px' }}>
                <strong>🌍 Latitude (Lat):</strong>
                <div style={{ display: 'block', color: formData.latitude ? '#10b981' : '#999', fontSize: '14px', marginTop: '4px', fontFamily: 'monospace' }}>
                  {formData.latitude || 'Not selected'}
                </div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <strong>🌍 Longitude (Lng):</strong>
                <div style={{ display: 'block', color: formData.longitude ? '#10b981' : '#999', fontSize: '14px', marginTop: '4px', fontFamily: 'monospace' }}>
                  {formData.longitude || 'Not selected'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS & SUBMIT BUTTON */}
        <div style={{ marginTop: '20px' }}>
          {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '5px', marginBottom: '10px', borderLeft: '4px solid #ef4444' }}>{error}</div>}
          {success && <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '5px', marginBottom: '10px', borderLeft: '4px solid #10b981' }}>{success}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {loading ? '⏳ Sending report...' : '✓ Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;