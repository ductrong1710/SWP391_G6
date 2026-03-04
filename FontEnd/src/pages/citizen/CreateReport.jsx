import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// --- KHẮC PHỤC LỖI MẤT ICON CỦA LEAFLET ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COMPONENT CON: XỬ LÝ CLICK TRÊN BẢN ĐỒ ---
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

// --- COMPONENT CON: TỰ ĐỘNG DI CHUYỂN MAP KHI CÓ TỌA ĐỘ MỚI ---
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
  
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    wasteTypeId: '',
    latitude: null,
    longitude: null,
    description: ''
  });

  // State quản lý bản đồ & Tìm kiếm
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
        setError('❌ Không thể tải danh sách loại rác');
      }
    };

    fetchWasteTypes();
  }, []);

  // --- HÀM TÌM KIẾM ĐỊA CHỈ ---
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      setError('❌ Vui lòng nhập địa chỉ để tìm kiếm');
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
        setSuccess(`✅ Tìm thấy: ${firstResult.display_name}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('❌ Không tìm thấy địa chỉ. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error searching address:', err);
      setError('❌ Lỗi khi tìm kiếm địa chỉ.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- XỬ LÝ FILE ẢNH ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('❌ Kích thước file vượt quá 10MB');
        return;
      }

      if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        setError('❌ Chỉ hỗ trợ file ảnh PNG, JPG, JPEG');
        return;
      }

      setSelectedFile(file);
      setError('');
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

  // --- LẤY VỊ TRÍ GPS ---
  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('❌ Trình duyệt không hỗ trợ GPS');
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
        setSuccess('✅ Đã lấy vị trí hiện tại');
        setTimeout(() => setSuccess(''), 3000);
        setLoadingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('❌ Không thể lấy vị trí. Kiểm tra quyền truy cập GPS.');
        setLoadingLocation(false);
      }
    );
  };

  // --- GỬI BÁO CÁO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ VALIDATE
    if (!selectedFile) {
      setError('❌ Vui lòng chọn ảnh');
      return;
    }

    if (!formData.wasteTypeId) {
      setError('❌ Vui lòng chọn loại rác');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('❌ Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('❌ Bạn chưa đăng nhập');
        return;
      }

      // ✅ PARSE VÀ FORMAT ĐÚNG CHO C# DECIMAL
      let latitude = parseFloat(formData.latitude);
      let longitude = parseFloat(formData.longitude);
      
      // Clamp to valid range
      latitude = Math.max(-90, Math.min(90, latitude));
      longitude = Math.max(-180, Math.min(180, longitude));
      
      const wasteTypeId = parseInt(formData.wasteTypeId);

      console.log('=== SUBMITTING ===');
      console.log('Image:', selectedFile.name);
      console.log('WasteTypeId:', wasteTypeId);
      console.log('Latitude:', latitude);
      console.log('Longitude:', longitude);
      console.log('Description:', formData.description);

      // ✅ GỬI FORMDATA - FORMAT ĐẶC BIỆT CHO C# DECIMAL
      const submitData = new FormData();
      submitData.append('Image', selectedFile);
      submitData.append('WasteTypeId', wasteTypeId);
      
      // ⭐ KEY: Dùng Blob để force gửi đúng type
      submitData.append('Latitude', new Blob([latitude.toString()], { type: 'text/plain' }));
      submitData.append('Longitude', new Blob([longitude.toString()], { type: 'text/plain' }));
      submitData.append('Description', formData.description || '');

      console.log('FormData prepared:', {
        Image: selectedFile.name,
        WasteTypeId: wasteTypeId,
        Latitude: latitude,
        Longitude: longitude,
        Description: formData.description
      });

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

      console.log('✅ Success:', response.data);
      setSuccess('✅ Báo cáo đã được gửi thành công! Đang chuyển về trang chủ...');

      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
          wasteTypeId: '',
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
      console.error('Response Data:', err.response?.data);
      console.error('Response Status:', err.response?.status);
      console.error('Response Headers:', err.response?.headers);
      
      if (err.response?.data) {
        const data = err.response.data;
        let errorMsg = 'Lỗi từ server';
        
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.errors) {
          if (typeof data.errors === 'object') {
            const errorsArray = Object.entries(data.errors)
              .map(([key, val]) => {
                if (Array.isArray(val)) {
                  return `${key}: ${val.join(', ')}`;
                }
                return `${key}: ${val}`;
              });
            errorMsg = errorsArray.join('; ');
          } else {
            errorMsg = JSON.stringify(data.errors);
          }
        } else if (data.title) {
          errorMsg = data.title;
        }
        
        setError(`❌ ${errorMsg}`);
      } else if (err.request) {
        setError('❌ Không thể kết nối tới server. Kiểm tra lại backend.');
      } else {
        setError(`❌ Đã xảy ra lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh' 
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#1f2937', margin: '0 0 10px 0', fontSize: '28px' }}>
          📝 Tạo Báo Cáo Rác Thải
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
          Chụp ảnh & Chọn vị trí trên bản đồ
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>

          {/* CỘT TRÁI: UPLOAD ẢNH & CHỌN LOẠI RÁC */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1f2937' }}>
              📷 Tải Lên Ảnh Rác Thải
            </h3>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: 'pointer',
                position: 'relative',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s',
                marginBottom: '15px'
              }}
            >
              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%', padding: '10px' }}>
                  <img
                    src={previewUrl}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setError('');
                    }}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                    📁 Kéo thả ảnh vào đây hoặc click để chọn
                  </p>
                  <small style={{ color: '#666' }}>Hỗ trợ: PNG, JPG, JPEG (Max 10MB)</small>
                </>
              )}

              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* CHỌN LOẠI RÁC */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>
                Loại Rác Thải *
              </label>
              <select
                value={formData.wasteTypeId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    wasteTypeId: e.target.value
                  });
                }}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Chọn loại rác --</option>
                {wasteTypes && wasteTypes.length > 0 ? (
                  wasteTypes.map((type) => (
                    <option key={type.wasteTypeId} value={type.wasteTypeId}>
                      {type.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải danh sách...</option>
                )}
              </select>
            </div>

            {/* MÔ TẢ */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>
                Mô Tả Chi Tiết
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Thêm thông tin chi tiết về rác thải (tùy chọn)..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1f2937' }}>
              📍 Vị Trí Thu Gom
            </h3>

            {/* TÌM KIẾM ĐỊA CHỈ */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="VD: Quốc lộ 1, TP. Hồ Chí Minh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchAddress();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearching}
                style={{
                  padding: '10px 15px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isSearching ? 0.7 : 1
                }}
              >
                {isSearching ? '⏳' : '🔍'} Tìm
              </button>
            </div>

            {/* BẢN ĐỒ */}
            <div
              style={{
                height: '300px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #ddd',
                marginBottom: '15px'
              }}
            >
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
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
                width: '100%',
                padding: '10px',
                background: loadingLocation ? '#ccc' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loadingLocation ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}
            >
              {loadingLocation ? '⏳ Đang lấy vị trí...' : '📍 Sử Dụng Vị Trí Hiện Tại'}
            </button>

            {/* HIỂN THỊ TỌA ĐỘ */}
            <div>
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px',
                  marginBottom: '8px'
                }}
              >
                <strong>🌍 Vĩ độ (Lat):</strong>
                <div
                  style={{
                    display: 'block',
                    color: formData.latitude ? '#10b981' : '#999',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  {formData.latitude || 'Chưa chọn'}
                </div>
              </div>

              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px'
                }}
              >
                <strong>🌍 Kinh độ (Lng):</strong>
                <div
                  style={{
                    display: 'block',
                    color: formData.longitude ? '#10b981' : '#999',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  {formData.longitude || 'Chưa chọn'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO LỖI & THÀNH CÔNG */}
        <div style={{ marginTop: '20px' }}>
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '5px',
                marginBottom: '10px',
                borderLeft: '4px solid #ef4444'
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '5px',
                marginBottom: '10px',
                borderLeft: '4px solid #10b981'
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? '⏳ Đang gửi báo cáo...' : '✓ Gửi Báo Cáo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;