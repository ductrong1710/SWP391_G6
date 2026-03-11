import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";

const JOB_STATUS = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "OnTheWay",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
const useActiveJob = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  const fetchMyAssignments = async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchRef.current && now - lastFetchRef.current < 1000)
      return;
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
    console.log("markArrived called:", { assignmentId, beforePhoto });

    const form = new FormData();
    if (beforePhoto) {
      // ✅ CHANGED: 'BeforePhoto' to 'BeforeImage'
      form.append("BeforeImage", beforePhoto, beforePhoto.name);
      console.log(
        "FormData BeforeImage:",
        beforePhoto.name,
        beforePhoto.size,
        "bytes"
      );
    } else {
      console.warn("⚠️ beforePhoto is null/undefined!");
    }

    for (let [key, val] of form.entries()) {
      console.log("FormData entry:", key, val);
    }

    await api.put(`/collections/${assignmentId}/arrived`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchMyAssignments(true);
  }, []);

  const completeJob = useCallback(
    async (assignmentId, afterPhoto, actualWeight) => {
      const form = new FormData();
      // ✅ CHANGED: 'AfterPhoto' to 'AfterImage'
      if (afterPhoto) form.append("AfterImage", afterPhoto, afterPhoto.name);
      if (actualWeight) form.append("ActualWeight", actualWeight);
      await api.put(`/collections/${assignmentId}/complete`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchMyAssignments(true);
    },
    []
  );

  const declineJob = useCallback(async (assignmentId, reason) => {
    await api.put(`/collections/${assignmentId}/decline`, { reason });
    await fetchMyAssignments(true);
  }, []);

  const reportIssue = useCallback(
    async (assignmentId, issueDescription, photo) => {
      const form = new FormData();
      form.append("IssueDescription", issueDescription);
      if (photo) form.append("Photo", photo);
      await api.put(`/collections/${assignmentId}/report-issue`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchMyAssignments(true);
    },
    []
  );

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

// ─── Tách riêng từng ActionBar theo status ────────────────────────────────────

// ✅ Fix: Tách riêng component, state photo không bị reset khi status thay đổi
const AssignedActions = ({ onStart, onDecline }) => {
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  return (
    <div className="bottom-action-bar">
      {showDecline ? (
        <div>
          <textarea
            className="form-input"
            placeholder="Enter decline reason..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            style={{ marginBottom: 8, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-decline-trip"
              onClick={() => onDecline(declineReason)}
            >
              Confirm Decline
            </button>
            <button
              className="btn-outline-map"
              onClick={() => setShowDecline(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-start-trip" onClick={onStart}>
            🚗 Start Trip
          </button>
          <button
            className="btn-decline-trip"
            onClick={() => setShowDecline(true)}
          >
            ✗ Decline
          </button>
        </div>
      )}
    </div>
  );
};

const OnTheWayActions = ({ onArrived }) => {
  // ✅ Fix: state nằm trong component riêng, không bị ảnh hưởng bởi re-render của parent
  const [beforePhoto, setBeforePhoto] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file?.name, file?.size);
    setBeforePhoto(file ?? null);
  };

  const handleArrived = () => {
    // ✅ Đọc file trực tiếp từ input ref (đảm bảo luôn lấy đúng file)
    const file = fileRef.current?.files[0] ?? beforePhoto;
    console.log("Submitting with file:", file?.name);
    onArrived(file);
  };

  return (
    <div className="bottom-action-bar">
      <label
        className="form-group"
        style={{ display: "block", marginBottom: 8 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          📷 Photo before collection{" "}
          {beforePhoto && (
            <span style={{ color: "#10b981" }}>✓ {beforePhoto.name}</span>
          )}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "block", marginTop: 4 }}
        />
      </label>
      <button
        className="btn-start-trip"
        onClick={handleArrived}
        // ✅ Bỏ disabled để debug, sau đó có thể bật lại: disabled={!beforePhoto}
      >
        📍 Mark Arrived
      </button>
    </div>
  );
};

const ArrivedActions = ({ onComplete }) => {
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [actualWeight, setActualWeight] = useState("");
  const fileRef = useRef(null);

  const handleComplete = () => {
    const file = fileRef.current?.files[0] ?? afterPhoto;
    onComplete(file, actualWeight);
  };

  return (
    <div className="bottom-action-bar">
      <div className="form-group" style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          ⚖️ Actual weight (kg)
        </label>
        <input
          type="number"
          className="form-input"
          value={actualWeight}
          onChange={(e) => setActualWeight(e.target.value)}
          placeholder="Enter kg..."
          style={{ marginTop: 4 }}
        />
      </div>
      <label
        className="form-group"
        style={{ display: "block", marginBottom: 8 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          📷 Photo after collection{" "}
          {afterPhoto && (
            <span style={{ color: "#10b981" }}>✓ {afterPhoto.name}</span>
          )}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setAfterPhoto(e.target.files[0] ?? null)}
          style={{ display: "block", marginTop: 4 }}
        />
      </label>
      <button
        className="btn-start-trip"
        onClick={handleComplete}
        disabled={!actualWeight}
      >
        ✅ Complete Collection
      </button>
    </div>
  );
};

// ✅ Fix: ActionBar chỉ render đúng component theo status
const ActionBar = ({
  job,
  onStart,
  onArrived,
  onComplete,
  onDecline,
  onReportIssue,
}) => {
  const status = job?.status;

  if (status === JOB_STATUS.ASSIGNED)
    return <AssignedActions onStart={onStart} onDecline={onDecline} />;
  if (status === JOB_STATUS.ON_THE_WAY)
    return <OnTheWayActions onArrived={onArrived} />;
  if (status === JOB_STATUS.ARRIVED)
    return <ArrivedActions onComplete={onComplete} />;

  return null;
};

// ─── Sub Components ───────────────────────────────────────────────────────────
const StatusToggle = ({ isOnline, onToggle }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      backgroundColor: isOnline ? "#f0fdf4" : "#f9fafb",
      border: `2px solid ${isOnline ? "#10b981" : "#d1d5db"}`,
      borderRadius: "50px",
      padding: "8px 16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      userSelect: "none",
    }}
    onClick={onToggle}
  >
    {/* Đèn tròn nhấp nháy */}
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: isOnline ? "#10b981" : "#9ca3af",
        boxShadow: isOnline ? "0 0 0 3px rgba(16,185,129,0.3)" : "none",
        animation: isOnline ? "pulse 2s infinite" : "none",
      }}
    />

    {/* Text */}
    <span
      style={{
        fontWeight: "700",
        fontSize: "14px",
        color: isOnline ? "#059669" : "#6b7280",
        minWidth: "50px",
      }}
    >
      {isOnline ? "Online" : "Offline"}
    </span>

    {/* Toggle switch */}
    <div
      style={{
        position: "relative",
        width: "44px",
        height: "24px",
        backgroundColor: isOnline ? "#10b981" : "#d1d5db",
        borderRadius: "12px",
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: isOnline ? "23px" : "3px",
          width: "18px",
          height: "18px",
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.3s ease",
        }}
      />
    </div>

    {/* Thêm animation pulse */}
    <style>{`
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
        70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
        100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
      }
    `}</style>
  </div>
);

const JobStats = ({ job }) => (
  <div className="job-stats-grid">
    {[
      { label: "Waste Type", value: job.wasteTypeName ?? "Unknown" },
      { label: "Est. Weight", value: `${job.estimatedWeight ?? "N/A"} kg` },
      { label: "Status", value: job.status ?? "Unknown" },
    ].map(({ label, value }) => (
      <div className="stat-box" key={label}>
        <div className="label">{label}</div>
        <div className="val">{value}</div>
      </div>
    ))}
  </div>
);

const ErrorBanner = ({ message, onClose }) => (
  <div className="error-banner">
    {message}
    <button onClick={onClose} className="alert-close">
      ✕
    </button>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">📭</div>
    <p className="empty-title">No active job assigned</p>
    <p className="text-sm text-gray">
      You will be notified when a new job is assigned.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
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
    reportIssue,
  } = useActiveJob();

  // ✅ useCallback để tránh tạo function mới mỗi render → tránh re-render ActionBar
  const withErrorHandler = useCallback(
    (fn) =>
      async (...args) => {
        try {
          await fn(...args);
        } catch (err) {
          console.error("Action error:", err?.response?.data);
          setError(err.response?.data?.message || "An error occurred.");
        }
      },
    [setError]
  );

  if (loading)
    return (
      <div className="loading-container">
        <h3>Loading...</h3>
      </div>
    );

  return (
    <div className="col-active-job fade-in">
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="col-page-header">
        <div>
          <h2>Active Job</h2>
          <p className="text-gray">Current collection assignment</p>
        </div>
        <StatusToggle
          isOnline={isOnline}
          onToggle={() => setIsOnline((prev) => !prev)}
        />
      </div>

      {!job ? (
        <EmptyState />
      ) : (
        <div className="job-card">
          <div className="job-header">
            <h3>Job #{job.assignmentId}</h3>
            <span className="badge-assigned">{job.status ?? "Unknown"}</span>
          </div>

          <div className="customer-info">
            <div className="info-row">
              <span className="icon-marker">📍</span>
              <div>
                <strong>{job.citizenName ?? "Unknown"}</strong>
                <div className="text-gray text-sm">
                  {job.description ?? job.address ?? "No address"}
                </div>
              </div>
            </div>
            {job.citizenPhone && (
              <div className="info-row mt-2">
                <span className="icon-phone">📞</span>
                <div className="text-green font-bold">{job.citizenPhone}</div>
              </div>
            )}
          </div>

          <JobStats job={job} />

          <div className="note-box">
            <div className="note-title">📄 Customer Note</div>
            <div className="note-content">{job.note ?? "No notes"}</div>
          </div>

          <ActionBar
            job={job}
            onStart={withErrorHandler(() => startTrip(job.assignmentId))}
            onArrived={withErrorHandler((photo) =>
              markArrived(job.assignmentId, photo)
            )}
            onComplete={withErrorHandler((photo, weight) =>
              completeJob(job.assignmentId, photo, weight)
            )}
            onDecline={withErrorHandler((reason) =>
              declineJob(job.assignmentId, reason)
            )}
            onReportIssue={withErrorHandler((desc, photo) =>
              reportIssue(job.assignmentId, desc, photo)
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ActiveJob;
