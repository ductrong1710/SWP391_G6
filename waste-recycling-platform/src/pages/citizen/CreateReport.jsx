// src/pages/citizen/CreateReport.jsx
import React from 'react';

const CreateReport = () => {
  return (
    <div className="report-container fade-in">
      <div className="report-header">
        <h2>Create Waste Report</h2>
        <p className="subtitle">Upload a photo of your waste and let our AI help identify the type</p>
      </div>

      <div className="report-grid">
        {/* CỘT TRÁI: UPLOAD ẢNH */}
        <div className="report-card">
          <div className="card-header-title">
            <span className="icon-green">📷</span> Upload Waste Photo
          </div>
          
          <div className="upload-area">
            <div className="upload-icon">⬆️</div>
            <p><span className="text-green">Click to upload</span> or drag and drop</p>
            <p className="file-info">PNG, JPG up to 10MB</p>
          </div>

          <div className="form-group">
            <label>Confirm Waste Type</label>
            <select className="form-select">
              <option>Select waste type</option>
              <option>Plastic</option>
              <option>Paper</option>
              <option>Metal</option>
              <option>Electronics</option>
            </select>
          </div>
        </div>

        {/* CỘT PHẢI: BẢN ĐỒ */}
        <div className="report-card">
          <div className="card-header-title">
            <span className="icon-green">📍</span> Collection Location
          </div>

          <div className="map-preview">
            {/* Ảnh bản đồ mẫu */}
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
              alt="Map Preview" 
            />
          </div>

          <button className="btn-outline-full">📍 Use Current Location</button>
        </div>
      </div>

      <div className="form-footer">
        <button className="btn-submit">Submit Report</button>
      </div>
    </div>
  );
};

export default CreateReport;