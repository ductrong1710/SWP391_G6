import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";

const JOB_STATUS = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "OnTheWay",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

const getStatusMeta = (status) => {
  switch (status) {
    case JOB_STATUS.ASSIGNED:
      return { label: "Assigned", className: "badge-info", icon: "📋" };
    case JOB_STATUS.ON_THE_WAY:
      return { label: "On the way", className: "badge-primary", icon: "🚚" };
    case JOB_STATUS.ARRIVED:
      return { label: "Arrived", className: "badge-warning", icon: "📍" };
    case JOB_STATUS.COMPLETED:
      return { label: "Completed", className: "badge-completed", icon: "✅" };
    case JOB_STATUS.DECLINED:
      return { label: "Declined", className: "badge-danger", icon: "✕" };
    default:
      return { label: status || "Unknown", className: "badge-neutral", icon: "•" };
  }
};

const useActiveJob = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  const fetchMyAssignments = async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchRef.current && now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    try {
      const { data } = await api.get("/assignments/my-assignments");
      if (!mountedRef.current) return;
      setJob(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch (err) {
      if (!mountedRef.current) return;
      setJob(null);
      setError("Unable to load assignment.");
      setTimeout(() => setError(""), 3000);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const startTrip = useCallback(async (assignmentId) => {
    await api.put(`/collections/${assignmentId}/start`, {});
    await fetchMyAssignments(true);
  }, []);

  const markArrived = useCallback(async (assignmentId, beforePhoto) => {
    const form = new FormData();
    if (beforePhoto) {
      form.append("BeforeImage", beforePhoto, beforePhoto.name);
    }

    await api.put(`/collections/${assignmentId}/arrived`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchMyAssignments(true);
  }, []);

  const completeJob = useCallback(async (assignmentId, afterPhoto, weightsArray) => {
    const form = new FormData();

    if (afterPhoto) {
      form.append("AfterImage", afterPhoto, afterPhoto.name);
    }

    weightsArray.forEach((item, index) => {
      form.append(`ActualWeights[${index}].WasteTypeId`, String(item.wasteTypeId));
      form.append(`ActualWeights[${index}].Weight`, String(item.weight));
    });

    form.append("Note", "Thu gom thành công");

    await api.put(`/collections/${assignmentId}/complete`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchMyAssignments(true);
  }, []);

  const declineJob = useCallback(async (assignmentId, reason) => {
    await api.put(`/collections/${assignmentId}/decline`, { reason });
    await fetchMyAssignments(true);
  }, []);

  const reportIssue = useCallback(async (assignmentId, issueDescription, photo) => {
    const form = new FormData();
    form.append("IssueDescription", issueDescription);
    if (photo) form.append("Photo", photo);

    await api.put(`/collections/${assignmentId}/report-issue`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchMyAssignments(true);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchMyAssignments();
    const interval = setInterval(() => fetchMyAssignments(), 10000);

    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
  }, []);

  return {
    job,
    loading,
    error,
    setError,
    startTrip,
    markArrived,
    completeJob,
    declineJob,
    reportIssue,
  };
};

const AssignedActions = ({ onStart, onDecline }) => {
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Next Action</h3>
        <p className="text-gray">Start the trip or decline this assignment with a reason.</p>
      </div>

      {showDecline ? (
        <>
          <div className="form-group">
            <label>Decline Reason</label>
            <textarea
              className="form-input"
              placeholder="Enter decline reason..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="collector-action-grid">
            <button className="btn-danger-soft" onClick={() => onDecline(declineReason)}>
              Confirm Decline
            </button>
            <button className="btn-outline-map" onClick={() => setShowDecline(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="collector-action-grid">
          <button className="btn-start-trip" onClick={onStart}>
            🚗 Start Trip
          </button>
          <button className="btn-danger-soft" onClick={() => setShowDecline(true)}>
            ✗ Decline
          </button>
        </div>
      )}
    </div>
  );
};

const OnTheWayActions = ({ onArrived }) => {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    setBeforePhoto(e.target.files[0] ?? null);
  };

  const handleArrived = () => {
    const file = fileRef.current?.files[0] ?? beforePhoto;
    onArrived(file);
  };

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Arrival Confirmation</h3>
        <p className="text-gray">Upload the before photo and mark that you have arrived.</p>
      </div>

      <div className="collector-upload-box">
        <label className="collector-upload-label">
          <span className="collector-upload-title">📷 Photo before collection</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="collector-file-input"
          />
          <span className="collector-upload-hint">
            {beforePhoto ? `✓ ${beforePhoto.name}` : "Choose an image from your device"}
          </span>
        </label>
      </div>

      <button className="btn-start-trip" onClick={handleArrived}>
        📍 Mark Arrived
      </button>
    </div>
  );
};

const ArrivedActions = ({ job, onComplete }) => {
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [weights, setWeights] = useState({});
  const fileRef = useRef(null);
  const [wasteTypesList, setWasteTypesList] = useState([]);

  useEffect(() => {
    const loadWasteTypes = async () => {
      try {
        const { data } = await api.get("/waste-types");

        if (data && job?.wasteTypeName) {
          const names = job.wasteTypeName.split(",").map((n) => n.trim().toLowerCase());

          const matchedTypes = data.filter((t) =>
            names.includes((t.name || "").trim().toLowerCase())
          );

          if (matchedTypes.length > 0) {
            setWasteTypesList(
              matchedTypes.map((t) => ({
                wasteTypeId: t.wasteTypeId ?? t.id ?? t.WasteTypeId,
                name: t.name,
              }))
            );
          } else {
            setWasteTypesList([
              {
                wasteTypeId: 1,
                name: job.wasteTypeName || "General Waste",
              },
            ]);
          }
        } else {
          setWasteTypesList([{ wasteTypeId: 1, name: "General Waste" }]);
        }
      } catch (e) {
        setWasteTypesList([
          {
            wasteTypeId: 1,
            name: job?.wasteTypeName || "General Waste",
          },
        ]);
      }
    };

    loadWasteTypes();
  }, [job]);

  const handleWeightChange = (typeId, value) => {
    setWeights((prev) => ({
      ...prev,
      [typeId]: value,
    }));
  };

  const handleComplete = () => {
    if (!afterPhoto) {
      alert("Vui lòng chụp ảnh sau khi đã thu dọn (After Image).");
      return;
    }

    const weightsArray = [];
    let hasValidWeight = false;

    wasteTypesList.forEach((type) => {
      const rawValue = weights[type.wasteTypeId];
      const normalized = String(rawValue ?? "").replace(",", ".").trim();
      const weightVal = Number(normalized);

      if (!Number.isNaN(weightVal) && weightVal > 0) {
        hasValidWeight = true;
        weightsArray.push({
          wasteTypeId: Number(type.wasteTypeId),
          weight: weightVal,
        });
      }
    });

    if (!hasValidWeight) {
      alert("Vui lòng nhập khối lượng (kg) hợp lệ cho ít nhất một loại rác để tính điểm thưởng!");
      return;
    }

    onComplete(afterPhoto, weightsArray);
  };

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Complete Collection</h3>
        <p className="text-gray">Update actual weight, add after photo and finish the job.</p>
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
                  value={weights[type.wasteTypeId] !== undefined ? weights[type.wasteTypeId] : ""}
                  onChange={(e) => handleWeightChange(type.wasteTypeId, e.target.value)}
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
            capture="environment"
            onChange={(e) => setAfterPhoto(e.target.files[0] ?? null)}
            className="collector-file-input"
          />
          <span className="collector-upload-hint">
            {afterPhoto ? `✓ ${afterPhoto.name}` : "Capture or upload photo after cleanup"}
          </span>
        </label>
      </div>

      <button className="btn-start-trip" onClick={handleComplete}>
        ✅ Confirm Completion
      </button>
    </div>
  );
};

const ActionBar = ({ job, onStart, onArrived, onComplete, onDecline }) => {
  const status = job?.status;

  if (status === JOB_STATUS.ASSIGNED) {
    return <AssignedActions onStart={onStart} onDecline={onDecline} />;
  }

  if (status === JOB_STATUS.ON_THE_WAY) {
    return <OnTheWayActions onArrived={onArrived} />;
  }

  if (status === JOB_STATUS.ARRIVED) {
    return <ArrivedActions job={job} onComplete={onComplete} />;
  }

  return null;
};

const StatusToggle = ({ isOnline, onToggle }) => (
  <div className="status-toggle">
    <span className={`status-label ${isOnline ? "text-green" : "text-gray"}`}>
      {isOnline ? "Online" : "Offline"}
    </span>
    <label className="switch">
      <input type="checkbox" checked={isOnline} onChange={onToggle} />
      <span className="slider round" />
    </label>
  </div>
);

const JobSummaryCards = ({ job }) => {
  const statusMeta = getStatusMeta(job?.status);

  return (
    <div className="stats-summary-grid">
      <div className="summary-card">
        <div className="summary-val">{job?.estimatedWeight ?? 0} kg</div>
        <div className="summary-label">Estimated Weight</div>
      </div>
      <div className="summary-card">
        <div className="summary-val" style={{ fontSize: 18 }}>
          {statusMeta.icon} {statusMeta.label}
        </div>
        <div className="summary-label">Current Status</div>
      </div>
    </div>
  );
};

const JobInfoCard = ({ job }) => {
  const statusMeta = getStatusMeta(job?.status);

  return (
    <div className="settings-card fade-in">
      <div className="hc-header">
        <div className="hc-left">
          <strong>Job #{job.assignmentId}</strong>
          <span className={`collector-badge ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>
        <div className="hc-right">
          <span className="badge-waste">{job.wasteTypeName || "Waste"}</span>
        </div>
      </div>

      <div className="collector-detail-grid">
        <div className="collector-detail-card">
          <div className="collector-detail-label">Citizen</div>
          <div className="collector-detail-value">{job.citizenName ?? "Unknown"}</div>
        </div>
        <div className="collector-detail-card">
          <div className="collector-detail-label">Phone</div>
          <div className="collector-detail-value">{job.citizenPhone ?? "Not available"}</div>
        </div>
      </div>

      <div className="hc-row">
        <span className="icon-gray">📍</span>
        <span className="text-gray">{job.description ?? job.address ?? "No address"}</span>
      </div>

      <div className="job-stats-grid collector-stats-grid">
        <div className="stat-box">
          <div className="label">Waste Type</div>
          <div className="val">{job.wasteTypeName ?? "Unknown"}</div>
        </div>
        <div className="stat-box">
          <div className="label">Estimated Weight</div>
          <div className="val">{job.estimatedWeight ?? "N/A"} kg</div>
        </div>
      </div>

      <div className="note-box">
        <div className="note-title">📄 Customer Note</div>
        <div className="note-content">{job.note ?? "No notes"}</div>
      </div>
    </div>
  );
};

const ErrorBanner = ({ message, onClose }) => (
  <div className="error-banner">
    {message}
    <button onClick={onClose} className="alert-close">
      ✕
    </button>
  </div>
);

const EmptyState = () => (
  <div className="settings-card empty-state-card fade-in">
    <div className="empty-icon">📭</div>
    <p className="empty-title">No active job assigned</p>
    <p className="text-sm text-gray">You will be notified when a new job is assigned.</p>
  </div>
);

const LoadingState = () => (
  <div className="settings-card empty-state-card">
    <div className="empty-icon">⏳</div>
    <p className="empty-title">Loading active job...</p>
    <p className="text-sm text-gray">Please wait a moment.</p>
  </div>
);

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(true);
  const {
    job,
    loading,
    error,
    setError,
    startTrip,
    markArrived,
    completeJob,
    declineJob,
  } = useActiveJob();

  const withErrorHandler = useCallback(
    (fn) => async (...args) => {
      try {
        await fn(...args);
      } catch (err) {
        console.error("Action error:", err?.response?.data);
        setError(err.response?.data?.message || "An error occurred.");
      }
    },
    [setError]
  );

  if (loading) {
    return (
      <div className="col-page-container fade-in">
        <div className="col-page-header">
          <div>
            <h2>Active Job</h2>
            <p className="text-gray">Current collection assignment</p>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="col-page-container fade-in">
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="col-page-header">
        <div>
          <h2>Active Job</h2>
          <p className="text-gray">Current collection assignment</p>
        </div>
        <StatusToggle isOnline={isOnline} onToggle={() => setIsOnline((prev) => !prev)} />
      </div>

      {!job ? (
        <EmptyState />
      ) : (
        <>
          <JobSummaryCards job={job} />
          <JobInfoCard job={job} />

          <ActionBar
            job={job}
            onStart={withErrorHandler(() => startTrip(job.assignmentId))}
            onArrived={withErrorHandler((photo) => markArrived(job.assignmentId, photo))}
            onComplete={withErrorHandler((photo, weightsArray) =>
              completeJob(job.assignmentId, photo, weightsArray)
            )}
            onDecline={withErrorHandler((reason) => declineJob(job.assignmentId, reason))}
          />
        </>
      )}
    </div>
  );
};

export default ActiveJob;