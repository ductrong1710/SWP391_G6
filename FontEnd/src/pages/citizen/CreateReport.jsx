// src/pages/citizen/CreateReport.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// --- 1. IMPORT CÁC THÀNH PHẦN BẢN ĐỒ ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Bắt buộc có CSS
import L from 'leaflet';


// --- 2. KHẮC PHỤC LỖI MẤT ICON CỦA LEAFLET ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 3. COMPONENT CON: XỬ LÝ CLICK TRÊN BẢN ĐỒ ---
function LocationMarker({ position, setPosition, setFormData }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      map.setView(e.latlng, map.getZoom(), { animate: false });

      setFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

// --- 4. COMPONENT CON: TỰ ĐỘNG DI CHUYỂN MAP KHI CÓ TỌA ĐỘ MỚI ---
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: false });
    }
  }, [lat, lng]);
  return null;
}

const API_BASE_URL = 'http://localhost:5021/api';

const CreateReport = () => {
  const fileInputRef = useRef(null);
  // --- DỮ LIỆU MẪU ---
  const [wasteTypes, setWasteTypes] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    wasteTypeId: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  console.log(
    'wasteTypeId =',
    formData.wasteTypeId,
    '| type =',
    typeof formData.wasteTypeId
  );


  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          `${API_BASE_URL}/waste-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setWasteTypes(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách loại rác');
      }
    };

    fetchWasteTypes();
  }, []);


  // State quản lý bản đồ & Tìm kiếm
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Lưu từ khóa tìm kiếm
  const [isSearching, setIsSearching] = useState(false); // Trạng thái đang tìm
  const defaultCenter = [10.7769, 106.7009];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // --- HÀM TÌM KIẾM ĐỊA CHỈ (Dùng OpenStreetMap Nominatim) ---
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError('');

    try {
      // Gọi API miễn phí của OpenStreetMap
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];

        // Cập nhật vị trí mới
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        setMarkerPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setSuccess(`🔍 Đã tìm thấy: ${response.data[0].display_name.substring(0, 40)}...`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert('Không tìm thấy địa chỉ này. Vui lòng thử từ khóa khác (VD: Chợ Bến Thành, Landmark 81...)');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tìm kiếm địa chỉ.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- XỬ LÝ FILE ẢNH ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return setError('File quá lớn (>10MB)');
      if (!file.type.match(/image\/(png|jpg|jpeg)/)) return setError('Chỉ nhận file ảnh (PNG, JPG)');

      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Xử lý khi kéo thả file
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
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
      setError('Trình duyệt không hỗ trợ GPS');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
        setMarkerPosition({ lat, lng });
        setLoadingLocation(false);
      },
      (err) => {
        setError('Không thể lấy vị trí. Hãy kiểm tra quyền truy cập.');
        setLoadingLocation(false);
      }
    );
  };

  // --- GỬI BÁO CÁO ---
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    console.log("TOKEN:", token);

    const submitData = new FormData();
    submitData.append('Image', selectedFile);
    submitData.append('WasteTypeId', parseInt(formData.wasteTypeId));
    submitData.append('Latitude', formData.latitude);
    submitData.append('Longitude', formData.longitude);
    submitData.append('Description', formData.description || '');

    await axios.post(
      'http://localhost:5021/api/waste-reports',
      submitData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert('Report created successfully!');

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({
        wasteTypeId: '',
        latitude: '',
        longitude: '',
        description: ''
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Scroll to top để hiển thị thông báo
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Error creating report:', err);

      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 429) {
        setError('Bạn đã tạo quá nhiều báo cáo. Vui lòng thử lại sau.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi tạo báo cáo. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Create Waste Report</h2>
        <p className="subtitle">Upload photo & Pin location</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="report-grid">

          {/* CỘT TRÁI */}
          <div className="report-card">
            <div className="card-header-title">📷 Upload Waste Photo</div>
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}

              style={{ cursor: 'pointer', position: 'relative', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px dashed #ccc', borderRadius: '8px' }}
            >
              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={previewUrl} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 30, height: 30 }}>✕</button>
                </div>
              ) : (
                <p>Click or Drag to Upload</p>
              )}

              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"

                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Confirm Waste Type *</label>

              <select
                className="form-select"
                value={formData.wasteTypeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wasteTypeId: e.target.value
                  })
                }
                required
              >
                <option value="">-- Select Type --</option>

                {wasteTypes.map((type) => (
                  <option
                    key={type.wasteTypeId}
                    value={type.wasteTypeId} //giá trị nhận là wasteTypeId không phải Id
                  >
                    {type.name}
                  </option>
                ))}
              </select>

            </div>


            <div className="form-group">
              <label>Description</label>
              <textarea className="form-select" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Additional details..." />
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ */}
          <div className="report-card">
            <div className="card-header-title">📍 Collection Location</div>

            {/* --- THANH TÌM KIẾM ĐỊA CHỈ (MỚI) --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Nhập địa chỉ (VD: Hà Nội, Chợ Bến Thành...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearching}
                style={{ padding: '10px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {isSearching ? '...' : '🔍 Tìm'}
              </button>
            </div>

            {/* KHUNG MAP */}
            <div className="map-preview" style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', zIndex: 0 }}>
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={markerPosition} setPosition={setMarkerPosition} setFormData={setFormData} />
                <RecenterAutomatically lat={formData.latitude} lng={formData.longitude} />
              </MapContainer>
            </div>

            <button type="button" className="btn-outline-full" onClick={handleGetCurrentLocation} disabled={loadingLocation} style={{ marginTop: '10px', width: '100%' }}>
              {loadingLocation ? '⏳ Getting location...' : '📍 Use Current Location'}
            </button>

            {/* HIỂN THỊ TỌA ĐỘ */}
            <div className="coordinate-box">
              <div className="coordinate-item">
                🌍 Vĩ độ (Lat):
                <span className="coordinate-value">
                  {formData.latitude || 'Chưa chọn'}
                </span>
              </div>

              <div className="coordinate-item">
                🌍 Kinh độ (Lng):
                <span className="coordinate-value">
                  {formData.longitude || 'Chưa chọn'}
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="form-footer">
          {error && <div className="alert alert-error">❌ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : '✓ Submit Report'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateReport;