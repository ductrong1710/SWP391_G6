import React, { useEffect, useRef, useState } from "react";
import wasteReportService from "../../services/wasteReportService";
import {
  normalizeCompletionWeights,
  resolveWasteTypesForJob,
} from "../../utils/collectorJob";

const ArrivedActions = ({ job, onComplete }) => {
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [weights, setWeights] = useState({});
  const [wasteTypesList, setWasteTypesList] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const loadWasteTypes = async () => {
      try {
        const data = await wasteReportService.getWasteTypes();
        setWasteTypesList(resolveWasteTypesForJob(job, data));
      } catch {
        setWasteTypesList(resolveWasteTypesForJob(job, []));
      }
    };

    loadWasteTypes();
  }, [job]);

  const handleComplete = () => {
    if (!afterPhoto) {
      window.alert("Vui lòng chụp ảnh sau khi đã thu dọn (After Image).");
      return;
    }

    const weightsArray = normalizeCompletionWeights(weights, wasteTypesList);

    if (!weightsArray.length) {
      window.alert(
        "Vui lòng nhập khối lượng (kg) hợp lệ cho ít nhất một loại rác để tính điểm thưởng!"
      );
      return;
    }

    onComplete(afterPhoto, weightsArray);
  };

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Complete Collection</h3>
        <p className="text-gray">
          Update actual weight, add after photo and finish the job.
        </p>
      </div>

      <div className="form-group">
        <label>Actual Waste Weight</label>
        <div className="collector-weight-list">
          {wasteTypesList.map((type) => (
            <div key={type.wasteTypeId} className="collector-weight-item">
              <div className="collector-weight-meta">
                <span className="collector-weight-name">{type.name}</span>
              </div>

              <div className="collector-weight-input-wrap">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input collector-weight-input"
                  value={weights[type.wasteTypeId] ?? ""}
                  onChange={(event) =>
                    setWeights((prev) => ({
                      ...prev,
                      [type.wasteTypeId]: event.target.value,
                    }))
                  }
                  placeholder="0.0"
                />
                <span className="collector-weight-unit">kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="collector-upload-box">
        <label className="collector-upload-label">
          <span className="collector-upload-title">📷 After Photo</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(event) => setAfterPhoto(event.target.files?.[0] ?? null)}
            className="collector-file-input"
          />
          <span className="collector-upload-hint">
            {afterPhoto
              ? `✓ ${afterPhoto.name}`
              : "Capture or upload photo after cleanup"}
          </span>
        </label>
      </div>

      <button className="btn-start-trip" onClick={handleComplete}>
        ✅ Confirm Completion
      </button>
    </div>
  );
};

export default ArrivedActions;
