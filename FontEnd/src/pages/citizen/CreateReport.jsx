// src/pages/citizen/CreateReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5021/api';

const CreateReport = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    wasteTypeId: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Lấy danh sách waste types khi component mount
  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/waste-types`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWasteTypes(response.data);
    } catch (err) {
      console.error('Error fetching waste types:', err);
      setError('Không thể tải danh sách loại rác. Vui lòng đăng nhập lại.');
    }
  };

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File không được vượt quá 10MB');
        return;
      }

      // Kiểm tra định dạng file
      if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        setError('Chỉ chấp nhận file PNG, JPG, JPEG');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Tạo preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
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

  // Lấy vị trí hiện tại
  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
        setLoadingLocation(false);
        setSuccess('Đã lấy vị trí hiện tại thành công!');
        setTimeout(() => setSuccess(''), 3000);
      },
      (err) => {
        setError('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.');
        setLoadingLocation(false);
      }
    );
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh rác thải');
      setLoading(false);
      return;
    }

    if (!formData.wasteTypeId) {
      setError('Vui lòng chọn loại rác');
      setLoading(false);
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Vui lòng nhập hoặc lấy vị trí');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Tạo FormData để gửi multipart/form-data
      const submitData = new FormData();
      submitData.append('Image', selectedFile);
      submitData.append('WasteTypeId', formData.wasteTypeId);
      submitData.append('Latitude', formData.latitude);
      submitData.append('Longitude', formData.longitude);
      submitData.append('Description', formData.description || '');

      const response = await axios.post(
        `${API_BASE_URL}/waste-reports`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(`Báo cáo đã được tạo thành công! ID: ${response.data.id}`);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({
        wasteTypeId: '',
        latitude: '',
        longitude: '',
        description: ''
      });

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
    <div className="report-container fade-in">
      <div className="report-header">
        <h2>Create Waste Report</h2>
        <p className="subtitle">Upload a photo of your waste and let our AI help identify the type</p>
      </div>

      {/* Thông báo lỗi/thành công */}
      {error && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          color: '#060'
        }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="report-grid">
          {/* CỘT TRÁI: UPLOAD ẢNH */}
          <div className="report-card">
            <div className="card-header-title">
              <span className="icon-green">📷</span> Upload Waste Photo
            </div>
            
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {previewUrl ? (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255,0,0,0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">⬆️</div>
                  <p><span className="text-green">Click to upload</span> or drag and drop</p>
                  <p className="file-info">PNG, JPG up to 10MB</p>
                </>
              )}
              
              <input
                id="file-input"
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-group">
              <label>Confirm Waste Type *</label>
              <select 
                className="form-select"
                value={formData.wasteTypeId}
                onChange={(e) => setFormData({ ...formData, wasteTypeId: e.target.value })}
                required
              >
                <option value="">Select waste type</option>
                {wasteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.pointsPerKg && `(${type.pointsPerKg} points/kg)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-select"
                rows="3"
                placeholder="Additional details about the waste..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ VÀ VỊ TRÍ */}
          <div className="report-card">
            <div className="card-header-title">
              <span className="icon-green">📍</span> Collection Location
            </div>

            <div className="map-preview">
              {formData.latitude && formData.longitude ? (
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '8px' }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude-0.01},${formData.latitude-0.01},${formData.longitude+0.01},${formData.latitude+0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                  allowFullScreen
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
                  alt="Map Preview" 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              )}
            </div>

            <button 
              type="button"
              className="btn-outline-full"
              onClick={handleGetCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? '⏳ Getting location...' : '📍 Use Current Location'}
            </button>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Latitude *</label>
              <input
                type="number"
                step="any"
                className="form-select"
                placeholder="e.g., 10.8231"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="number"
                step="any"
                className="form-select"
                placeholder="e.g., 106.6297"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✓ Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;