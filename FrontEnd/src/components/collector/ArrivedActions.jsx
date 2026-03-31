import React, { useState } from 'react';

const ArrivedActions = ({ job, onComplete }) => {
  const [weights, setWeights] = useState({});
  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Trạng thái lưu ảnh xem trước

  // Lấy danh sách loại rác từ job để hiển thị ô nhập cân nặng
  const wasteTypes = (() => {
    if (Array.isArray(job?.wasteItems) && job.wasteItems.length > 0) return job.wasteItems;
    if (job?.wasteTypeName) {
      return job.wasteTypeName.split(",").map((name, index) => ({
        wasteTypeId: index + 1,
        wasteTypeName: name.trim()
      })).filter(item => item.wasteTypeName);
    }
    return [];
  })();

  // Xử lý khi người dùng chọn ảnh
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setLocalFile(file);
      // Đọc file để tạo URL xem trước
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLocalFile(null);
      setPreviewUrl(null);
    }
  };

  // Cập nhật state khi nhập cân nặng
  const handleWeightChange = (wasteTypeId, value) => {
    setWeights(prev => ({
      ...prev,
      [wasteTypeId]: value
    }));
  };

  // Xử lý khi bấm nút Confirm
  const handleConfirm = () => {
    // Chuyển object weights thành mảng để gửi lên API
    const weightsArray = Object.keys(weights).map(id => ({
      wasteTypeId: Number(id),
      weight: Number(weights[id]) || 0
    }));

    onComplete(localFile, weightsArray);
  };

  return (
    <div className="settings-card active-dispatch-section mb-4">
      <div className="card-header-simple">
        <h3>Complete Collection</h3>
        <p className="text-gray">Update actual weight, add after photo and finish the job.</p>
      </div>

      {/* Khu vực nhập cân nặng thực tế */}
      <div className="mb-4">
        <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>Actual Waste Weight</h4>
        {wasteTypes.map((waste) => (
          <div key={waste.wasteTypeId} className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ marginBottom: '6px', display: 'block' }}>{waste.wasteTypeName || waste.name}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="0"
                step="0.1"
                className="form-input"
                placeholder="0.0"
                value={weights[waste.wasteTypeId] || ''}
                onChange={(e) => handleWeightChange(waste.wasteTypeId, e.target.value)}
              />
              <span className="text-gray" style={{ fontWeight: '600' }}>kg</span>
            </div>
          </div>
        ))}
      </div>

      {/* Khu vực chọn ảnh After Photo */}
      <div className="btn-file-wrapper mb-4">
        <input
          type="file"
          id="afterPhotoInput"
          className="file-upload-input"
          onChange={handleFileSelect}
          accept="image/*"
        />
        <label htmlFor="afterPhotoInput" className="file-upload-label">
          <span className="icon-image">📷</span>
          {localFile ? localFile.name : "Choose after photo"}
        </label>
      </div>

      {/* Khu vực hiển thị ảnh xem trước */}
      {previewUrl && (
        <div className="image-preview-container mb-4">
          <img src={previewUrl} alt="After collection preview" className="image-preview" />
        </div>
      )}

      {/* Nút xác nhận hoàn thành */}
      <button className="btn-start-trip" onClick={handleConfirm}>
         Confirm Completion
      </button>
    </div>
  );
};

export default ArrivedActions;