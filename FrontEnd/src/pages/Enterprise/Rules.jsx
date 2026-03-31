import React, { useState, useEffect } from "react";
import wasteReportService from "../../services/wasteReportService";
import api from "../../services/api"; // Đảm bảo import axios instance của bạn để gọi API thực tế
import "./Rules.css";

const Rules = () => {
  const [dailyLimit, setDailyLimit] = useState(15);
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState([]);
  const [allWasteTypes, setAllWasteTypes] = useState([]);
  const [pointMultipliers, setPointMultipliers] = useState([]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [priorityThreshold, setPriorityThreshold] = useState(80);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newMultiplier, setNewMultiplier] = useState({
    wasteTypeId: "",
    quality: "",
    multiplier: 1.0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      // 1. Lấy danh sách Waste Types thực tế từ backend
      const wasteTypes = await wasteReportService.getWasteTypes();
      setAllWasteTypes(wasteTypes);

      // 2. Lấy cấu hình Rules & Capacity của Enterprise từ backend
      // Lưu ý: Cập nhật URL '/api/Users/enterprise-settings' khớp với Controller của bạn trong .NET
      const response = await api.get("/api/Users/enterprise-settings");
      const data = response.data;

      if (data) {
        setDailyLimit(data.dailyLimit || 15);
        setAcceptedWasteTypes(data.acceptedWasteTypes || []);
        setPointMultipliers(data.pointMultipliers || []);
        setAutoAssign(data.autoAssign !== undefined ? data.autoAssign : true);
        setPriorityThreshold(data.priorityThreshold || 80);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("⚠️ Không thể tải cấu hình từ máy chủ. Đang sử dụng dữ liệu mặc định.");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggleWasteType = (wasteTypeId) => {
    setAcceptedWasteTypes((prev) => {
      if (prev.includes(wasteTypeId)) {
        return prev.filter((id) => id !== wasteTypeId);
      } else {
        return [...prev, wasteTypeId];
      }
    });
  };

  const handleAddMultiplier = () => {
    if (
      !newMultiplier.wasteTypeId ||
      !newMultiplier.quality ||
      !newMultiplier.multiplier
    ) {
      setError("❌ Vui lòng điền đầy đủ các trường yêu cầu");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const wasteType = allWasteTypes.find(
      (wt) => wt.wasteTypeId === parseInt(newMultiplier.wasteTypeId)
    );

    setPointMultipliers((prev) => [
      ...prev,
      {
        wasteTypeId: parseInt(newMultiplier.wasteTypeId),
        wastetype: wasteType, // Giữ nguyên object để render UI
        quality: newMultiplier.quality,
        multiplier: parseFloat(newMultiplier.multiplier),
      },
    ]);

    setNewMultiplier({ wasteTypeId: "", quality: "", multiplier: 1.0 });
    setSuccess("✅ Đã thêm hệ số nhân mới");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveMultiplier = (index) => {
    setPointMultipliers((prev) => prev.filter((_, i) => i !== index));
    setSuccess("✅ Đã xóa hệ số nhân");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError("");

      // Chuẩn bị payload gửi xuống .NET Backend
      const payload = {
        dailyLimit,
        acceptedWasteTypes,
        pointMultipliers,
        autoAssign,
        priorityThreshold,
      };

      // Gọi API thực tế để cập nhật. Thay thế bằng URL thực tế trên Backend của bạn
      await api.put("/api/Users/enterprise-settings", payload);

      setSuccess("✅ Đã lưu cấu hình thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("❌ Không thể lưu cấu hình. Vui lòng thử lại.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="rules-container">
        <div className="rules-header">
          <h1>Capacity & Rules</h1>
          <p>Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rules-container">
      {/* HEADER */}
      <div className="rules-header">
        <div>
          <h1>Capacity & Rules</h1>
          <p>Cấu hình năng lực thu gom và các luật hệ số điểm thưởng</p>
        </div>
        <button
          className="btn-save"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="rules-grid">
        {/* LEFT: CAPACITY SETTINGS */}
        <div className="settings-card">
          <div className="card-icon">📊</div>
          <h3>Cấu hình năng lực (Capacity)</h3>
          <p className="card-description">
            Thiết lập giới hạn thu gom hàng ngày và các tùy chọn của bạn
          </p>

          {/* DAILY LIMIT */}
          <div className="setting-group">
            <label className="setting-label">
              Giới hạn thu gom hàng ngày
              <span className="limit-value">{dailyLimit} tons</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>1 ton</span>
              <span>50 tons</span>
            </div>
          </div>

          {/* ACCEPTED WASTE TYPES */}
          <div className="setting-group">
            <label className="setting-label">Loại rác thải chấp nhận</label>
            <div className="waste-types-grid">
              {allWasteTypes.map((wasteType) => (
                <label key={wasteType.wasteTypeId} className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={acceptedWasteTypes.includes(wasteType.wasteTypeId)}
                    onChange={() =>
                      handleToggleWasteType(wasteType.wasteTypeId)
                    }
                  />
                  <div className="checkbox-content">
                    <span className="waste-icon">
                      {wasteType.name === "Plastic" && "♻️"}
                      {wasteType.name === "Electronics" && "🔌"}
                      {wasteType.name === "Metal" && "🔩"}
                      {wasteType.name === "Paper" && "📄"}
                      {wasteType.name === "Glass" && "🍾"}
                      {wasteType.name === "Organic" && "🌱"}
                    </span>
                    <span className="waste-name">{wasteType.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* AUTO-ASSIGN COLLECTORS */}
          <div className="setting-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">
                Tự động điều phối
                <small>
                  Tự động chỉ định Collector sẵn sàng cho các yêu cầu mới
                </small>
              </span>
            </label>
          </div>

          {/* PRIORITY THRESHOLD */}
          <div className="setting-group">
            <label className="setting-label">
              Ngưỡng điểm ưu tiên duyệt tự động
              <span className="limit-value">{priorityThreshold}+ score</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={priorityThreshold}
              onChange={(e) => setPriorityThreshold(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>0</span>
              <span>100</span>
            </div>
            <p className="setting-hint">
              Các báo cáo có điểm ưu tiên AI vượt qua ngưỡng này sẽ được hệ thống tự động phê duyệt
            </p>
          </div>
        </div>

        {/* RIGHT: POINT MULTIPLIERS */}
        <div className="settings-card">
          <div className="card-icon">➕</div>
          <h3>Hệ số điểm thưởng (Multipliers)</h3>
          <p className="card-description">
            Cấu hình điểm thưởng cộng thêm cho các loại rác và chất lượng khác nhau
          </p>

          {/* EXISTING MULTIPLIERS */}
          <div className="multipliers-list">
            {pointMultipliers.map((multiplier, index) => (
              <div key={index} className="multiplier-item">
                <div className="multiplier-info">
                  <span className="multiplier-type">
                    {multiplier.wastetype?.name}
                  </span>
                  <span className="multiplier-quality">
                    {multiplier.quality}
                  </span>
                </div>
                <div className="multiplier-value-container">
                  <span className="multiplier-value">
                    {multiplier.multiplier}x
                  </span>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveMultiplier(index)}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD NEW MULTIPLIER */}
          <div className="add-multiplier-form">
            <h4>Thêm hệ số mới</h4>
            <div className="form-row">
              <select
                value={newMultiplier.wasteTypeId}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    wasteTypeId: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="">Chọn loại rác</option>
                {allWasteTypes.map((wt) => (
                  <option key={wt.wasteTypeId} value={wt.wasteTypeId}>
                    {wt.name}
                  </option>
                ))}
              </select>

              <select
                value={newMultiplier.quality}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    quality: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="">Chọn chất lượng</option>
                <option value="High">Cao</option>
                <option value="Medium">Trung bình</option>
                <option value="Low">Thấp</option>
                <option value="Clean">Sạch</option>
                <option value="Working">Còn hoạt động</option>
                <option value="Broken">Hư hỏng</option>
              </select>

              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={newMultiplier.multiplier}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    multiplier: e.target.value,
                  })
                }
                className="form-input"
                placeholder="1.0"
              />

              <button className="btn-add" onClick={handleAddMultiplier}>
                ➕ Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>Cách hoạt động của hệ số điểm</h4>
            <p>
              Người dân kiếm được điểm cơ bản cho mỗi lần thu gom. Hệ số nhân sẽ tăng phần thưởng dựa trên loại và chất lượng rác. Ví dụ: Nhựa chất lượng cao nhận 2x điểm.
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">⚙️</div>
          <div className="info-content">
            <h4>Tự động điều phối Collector</h4>
            <p>
              Khi bật, hệ thống sẽ tự động gán collector có sẵn gần nhất cho các yêu cầu mới. Điều này giúp giảm thời gian phản hồi và cải thiện hiệu suất.
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🎯</div>
          <div className="info-content">
            <h4>Ngưỡng tự động duyệt</h4>
            <p>
              Hệ thống AI sẽ đánh giá từng báo cáo. Các báo cáo có độ ưu tiên cao (vượt ngưỡng) sẽ được tự động duyệt để đảm bảo giải quyết nhanh các tình huống khẩn cấp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;