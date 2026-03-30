import React, { useState } from 'react';

const OnTheWayActions = ({ onArrived, imagePreview, onFileChange }) => {
  const [localFile, setLocalFile] = useState(null);

  // Xử lý khi chọn ảnh
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setLocalFile(file);
    if (onFileChange) {
      onFileChange(e); // Gọi hàm của component cha để tạo ảnh xem trước
    }
  };

  // Xử lý khi bấm Mark Arrived
  const handleArrived = () => {
    onArrived(localFile); // Truyền file thật lên API
  };

  return (
    <div className="settings-card active-dispatch-section mb-4">
      <div className="card-header-simple">
        <h3>Arrival Confirmation</h3>
        <p className="text-gray">Upload the before photo and mark that you have arrived.</p>
      </div>

      {/* Khu vực chọn ảnh (Đã áp dụng CSS mới) */}
      <div className="btn-file-wrapper mb-4">
        <input
          type="file"
          id="beforePhotoInput"
          className="file-upload-input"
          onChange={handleFileSelect}
          accept="image/*"
        />
        <label htmlFor="beforePhotoInput" className="file-upload-label">
          <span className="icon-image">📷</span>
          {localFile ? localFile.name : "Choose a photo before collection"}
        </label>
      </div>

      {/* Khu vực hiển thị ảnh xem trước */}
      {imagePreview && (
        <div className="image-preview-container mb-4">
          <img src={imagePreview} alt="Preview" className="image-preview" />
        </div>
      )}

      {/* Nút xác nhận */}
      <button className="btn-start-trip" onClick={handleArrived}>
        📍 Mark Arrived
      </button>
    </div>
  );
};

export default OnTheWayActions;