import React, { useCallback, useState } from "react";
import ArrivedActions from "../../components/collector/ArrivedActions";
import AssignedActions from "../../components/collector/AssignedActions";
import OnTheWayActions from "../../components/collector/OnTheWayActions";
import useActiveJob from "../../hooks/useActiveJob";
import { getStatusMeta, JOB_STATUS } from "../../utils/collectorJob";

const ActionBar = ({ job, onStart, onArrived, onComplete, onDecline }) => {
  if (job?.status === JOB_STATUS.ASSIGNED) {
    return <AssignedActions onStart={onStart} onDecline={onDecline} />;
  }

  if (job?.status === JOB_STATUS.ON_THE_WAY) {
    return <OnTheWayActions onArrived={onArrived} />;
  }

  if (job?.status === JOB_STATUS.ARRIVED) {
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
          <span className={`collector-badge ${statusMeta.className}`}>
            {statusMeta.label}
          </span>
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
          <div className="collector-detail-value">
            {job.citizenPhone ?? "Not available"}
          </div>
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
