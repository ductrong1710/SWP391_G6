import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import ArrivedActions from "../../components/collector/ArrivedActions";
import AssignedActions from "../../components/collector/AssignedActions";
import OnTheWayActions from "../../components/collector/OnTheWayActions";
import useActiveJob from "../../hooks/useActiveJob";
import {
  COLLECTION_ISSUE_TYPES,
  getStatusMeta,
  JOB_STATUS,
} from "../../utils/collectorJob";
import userService from "../../services/userService";
import authService from "../../services/authService";

const DEFAULT_CENTER = [10.7769, 106.7009];

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US");
};

const formatLocation = (job) => {
  const hasLat =
    typeof job?.latitude === "number" && !Number.isNaN(job.latitude);
  const hasLng =
    typeof job?.longitude === "number" && !Number.isNaN(job.longitude);

  if (hasLat && hasLng && job.latitude !== 0 && job.longitude !== 0) {
    return `${job.latitude}, ${job.longitude}`;
  }

  return "No location available";
};

const getWasteTypeList = (job) => {
  if (Array.isArray(job?.wasteItems) && job.wasteItems.length > 0) {
    return job.wasteItems;
  }

  if (job?.wasteTypeName) {
    return job.wasteTypeName
      .split(",")
      .map((name, index) => ({
        wasteTypeId: index + 1,
        wasteTypeName: name.trim(),
      }))
      .filter((item) => item.wasteTypeName);
  }

  return [];
};

const getJobMapCenter = (job) => {
  const lat = Number(job?.latitude);
  const lng = Number(job?.longitude);

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }

  return DEFAULT_CENTER;
};

const shouldShowEvidence = (status) =>
  [
    JOB_STATUS.ON_THE_WAY,
    JOB_STATUS.ARRIVED,
    JOB_STATUS.REPORTED_ISSUE,
    JOB_STATUS.FAILED,
    JOB_STATUS.COMPLETED,
  ].includes(status);

const ErrorBanner = ({ message, onClose }) => (
  <div className="error-banner">
    {message}
    <button onClick={onClose} className="alert-close">
      x
    </button>
  </div>
);

const LoadingState = () => (
  <div className="settings-card empty-state-card active-dispatch-empty">
    <div className="empty-icon">...</div>
    <p className="empty-title">Loading active jobs...</p>
    <p className="text-sm text-gray">Please wait a moment.</p>
  </div>
);

const EmptyState = () => (
  <div className="settings-card empty-state-card active-dispatch-empty fade-in">
    <div className="empty-icon">-</div>
    <p className="empty-title">No active assignments</p>
    <p className="text-sm text-gray">
      Assigned and in-progress jobs will appear here.
    </p>
  </div>
);

const StatusToggle = ({ isOnline, onToggle }) => (
  <div className="status-toggle status-toggle-compact">
    <div className="status-toggle-info">
      <span className="status-toggle-title">Collector Status</span>
      <span className={`status-toggle-badge ${isOnline ? "online" : "offline"}`}>
        <span className="status-dot" />
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>

    <label className="status-switch" aria-label="Toggle collector availability">
      <input type="checkbox" checked={isOnline} onChange={onToggle} />
      <span className="status-switch-slider" />
    </label>
  </div>
);

const ActionBar = ({
  job,
  onStart,
  onArrived,
  onComplete,
  onDecline,
  onReportIssue,
}) => {
  if (job?.status === JOB_STATUS.ASSIGNED) {
    return (
      <div className="bottom-action-bar">
        <button className="btn-start-trip" onClick={onStart}>
          Start Trip
        </button>

        <button className="btn-decline-trip" onClick={onDecline}>
          Decline Assignment
        </button>
      </div>
    );
  }

  if (job?.status === JOB_STATUS.ON_THE_WAY) {
    return (
      <>
        <OnTheWayActions onArrived={onArrived} />
        <div
          className="settings-card action-card fade-in"
          style={{ marginTop: 16 }}
        >
          <div className="card-header-simple">
            <h3>Issue Handling</h3>
            <p className="text-gray">
              Report a problem so the enterprise can review and reassign if
              needed.
            </p>
          </div>
          <button className="btn-danger-soft" onClick={onReportIssue}>
            Report Issue
          </button>
        </div>
      </>
    );
  }

  if (job?.status === JOB_STATUS.ARRIVED) {
    return (
      <>
        <ArrivedActions job={job} onComplete={onComplete} />
        <div
          className="settings-card action-card fade-in"
          style={{ marginTop: 16 }}
        >
          <div className="card-header-simple">
            <h3>Issue Handling</h3>
            <p className="text-gray">
              If this pickup cannot be completed, send the issue back for
              reassignment.
            </p>
          </div>
          <button className="btn-danger-soft" onClick={onReportIssue}>
            Report Issue
          </button>
        </div>
      </>
    );
  }

  if (
    job?.status === JOB_STATUS.REPORTED_ISSUE ||
    job?.status === JOB_STATUS.FAILED
  ) {
    return (
      <div className="settings-card action-card fade-in">
        <div className="card-header-simple">
          <h3>Awaiting Enterprise Action</h3>
          <p className="text-gray">
            This job has been flagged with an issue. Please wait for update or
            reassignment.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const JobListItem = ({ job, selected, onSelect }) => {
  const statusMeta = getStatusMeta(job?.status);

  return (
    <div
      className={`active-dispatch-item ${selected ? "selected" : ""}`}
      onClick={() => onSelect(job)}
    >
      <div className="active-dispatch-item-header">
        <div className="active-dispatch-avatar">
          {job?.status === JOB_STATUS.ON_THE_WAY ||
          job?.status === JOB_STATUS.ARRIVED
            ? "A"
            : "J"}
        </div>

        <div className="active-dispatch-item-main">
          <div className="active-dispatch-item-title">
            Job #{job.assignmentId}
          </div>
          <div className="active-dispatch-item-subtitle">
            {job.wasteTypeName || "Waste"}
          </div>
        </div>

        <span className={`collector-badge ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="active-dispatch-item-meta">
        <div>{job.enterpriseName || "Enterprise not available"}</div>
        <div>{formatDateTime(job.assignedAt)}</div>
        <div>{formatLocation(job)}</div>
      </div>
    </div>
  );
};

const JobListPanel = ({ jobs, selectedJob, onSelect }) => (
  <div className="active-dispatch-list-panel">
    <h2 className="active-dispatch-panel-title">
      Job Queue <span className="count">{jobs.length}</span>
    </h2>

    {!jobs.length ? (
      <div className="active-dispatch-inline-empty">
        <p>No jobs available.</p>
      </div>
    ) : (
      <div className="active-dispatch-list">
        {jobs.map((job) => (
          <JobListItem
            key={job.assignmentId}
            job={job}
            selected={selectedJob?.assignmentId === job.assignmentId}
            onSelect={onSelect}
          />
        ))}
      </div>
    )}
  </div>
);

const LocationMapSection = ({ job }) => {
  const mapCenter = getJobMapCenter(job);
  const hasCoordinates =
    Number(job?.latitude) !== 0 &&
    Number(job?.longitude) !== 0 &&
    !Number.isNaN(Number(job?.latitude)) &&
    !Number.isNaN(Number(job?.longitude));

  return (
    <div className="settings-card active-dispatch-section">
      <div className="card-header-simple">
        <h3>Location Map</h3>
        <p className="text-gray">Pickup location for the selected job.</p>
      </div>

      <div className="active-dispatch-map-panel">
        <MapContainer
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", borderRadius: 8 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {hasCoordinates && (
            <Marker position={mapCenter}>
              <Popup>
                <strong>Job #{job.assignmentId}</strong>
                <br />
                {job.wasteTypeName || "Waste"}
                <br />
                {formatLocation(job)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

const DetailHeader = ({ job }) => {
  const statusMeta = getStatusMeta(job?.status);

  return (
    <div className="active-dispatch-detail-hero">
      <div>
        <div className="active-dispatch-eyebrow">Collector Assignment</div>
        <div className="active-dispatch-title-row">
          <h2>Job #{job.assignmentId}</h2>
          <span className={`collector-badge ${statusMeta.className}`}>
            {statusMeta.label}
          </span>
        </div>
        <p className="text-gray">
          Request #{job.requestId} • Report #{job.reportId}
        </p>
      </div>

      <div className="hc-right">
        <span className="badge-waste">{job.wasteTypeName || "Waste"}</span>
      </div>
    </div>
  );
};

const DetailInfoGrid = ({ job }) => (
  <div className="details-grid active-dispatch-details-grid">
    <div className="detail-section">
      <label>Assigned By</label>
      <p className="detail-value">{job.enterpriseName || "N/A"}</p>
    </div>
    <div className="detail-section">
      <label>Enterprise Phone</label>
      <p className="detail-value">{job.enterprisePhone || "N/A"}</p>
    </div>
    <div className="detail-section">
      <label>Pickup Contact</label>
      <p className="detail-value">{job.citizenName || "N/A"}</p>
    </div>
    <div className="detail-section">
      <label>Citizen Phone</label>
      <p className="detail-value">{job.citizenPhone || "N/A"}</p>
    </div>
    <div className="detail-section">
      <label>Assigned At</label>
      <p className="detail-value">{formatDateTime(job.assignedAt)}</p>
    </div>
    <div className="detail-section">
      <label>Report Created</label>
      <p className="detail-value">{formatDateTime(job.reportCreatedAt)}</p>
    </div>
    <div className="detail-section">
      <label>Started At</label>
      <p className="detail-value">{formatDateTime(job.startedAt)}</p>
    </div>
    <div className="detail-section">
      <label>Arrived At</label>
      <p className="detail-value">{formatDateTime(job.arrivedAt)}</p>
    </div>
    <div className="detail-section full-width">
      <label>Location</label>
      <p className="detail-value">{formatLocation(job)}</p>
    </div>
    <div className="detail-section full-width">
      <label>Waste Type</label>
      <p className="detail-value">{job.wasteTypeName || "No data"}</p>
    </div>
    <div className="detail-section full-width">
      <label>Report Description</label>
      <p className="detail-value">{job.description || "No description"}</p>
    </div>
  </div>
);

const WasteTypesSection = ({ job }) => {
  const wasteTypes = getWasteTypeList(job);

  return (
    <div className="settings-card active-dispatch-section">
      <div className="card-header-simple">
        <h3>Waste Details</h3>
        <p className="text-gray">Waste categories attached to this report.</p>
      </div>

      {!wasteTypes.length ? (
        <p className="text-gray">No waste type details available.</p>
      ) : (
        <div className="active-dispatch-chip-grid">
          {wasteTypes.map((item) => (
            <div
              className="active-dispatch-chip"
              key={`${job.assignmentId}-${item.wasteTypeId}`}
            >
              {item.wasteTypeName || item.name || "Unknown"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NotesSection = ({ job }) => {
  const hasCompletionNote = Boolean(job?.completionNote);
  const hasIssueType = Boolean(job?.issueReport);
  const hasIssueReason = Boolean(job?.issueReason);

  return (
    <div className="settings-card active-dispatch-section">
      <div className="card-header-simple">
        <h3>Notes</h3>
        <p className="text-gray">
          Primary request note and additional notes when available.
        </p>
      </div>

      <div className="active-dispatch-note-stack">
        <div className="note-box">
          <div className="note-title">Request Note</div>
          <div className="note-content">{job.note || "No request note"}</div>
        </div>

        {hasIssueType && (
          <div className="note-box">
            <div className="note-title">Issue Type</div>
            <div className="note-content">{job.issueReport}</div>
          </div>
        )}

        {hasIssueReason && (
          <div className="note-box">
            <div className="note-title">Issue Reason</div>
            <div className="note-content">{job.issueReason}</div>
          </div>
        )}

        {hasCompletionNote && (
          <div className="note-box">
            <div className="note-title">Completion Note</div>
            <div className="note-content">{job.completionNote}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const EvidenceSection = ({ job }) => (
  <div className="settings-card active-dispatch-section">
    <div className="card-header-simple">
      <h3>Evidence</h3>
      <p className="text-gray">Collection proof and actual collected result.</p>
    </div>

    <div className="details-grid active-dispatch-details-grid">
      <div className="detail-section">
        <label>Before Photo</label>
        <p className="detail-value">
          {job.beforeImageUrl ? "Available" : "Missing"}
        </p>
      </div>
      <div className="detail-section">
        <label>After Photo</label>
        <p className="detail-value">
          {job.afterImageUrl ? "Available" : "Missing"}
        </p>
      </div>
      <div className="detail-section">
        <label>Issue Image</label>
        <p className="detail-value">
          {job.issueImageUrl ? "Available" : "Missing"}
        </p>
      </div>
      <div className="detail-section">
        <label>Actual Weight</label>
        <p className="detail-value">{job.totalCollectedWeight ?? 0} kg</p>
      </div>
      <div className="detail-section full-width">
        <label>Collected Breakdown</label>
        <p className="detail-value">
          {job.collectedWasteSummary || "Not available"}
        </p>
      </div>
    </div>
  </div>
);

const DetailsPanel = ({
  job,
  onStart,
  onArrived,
  onComplete,
  onDecline,
  onReportIssue,
}) => {
  if (!job) {
    return (
      <div className="settings-card empty-state-card active-dispatch-empty">
        <div className="empty-icon">-</div>
        <p className="empty-title">Select a job</p>
        <p className="text-sm text-gray">
          Choose a job from the left panel to view details.
        </p>
      </div>
    );
  }

  return (
    <div className="active-dispatch-details-panel">
      <LocationMapSection job={job} />
      <div className="details-panel">
        <h2>Details</h2>
        <DetailInfoGrid job={job} />
      </div>

      <WasteTypesSection job={job} />
      <NotesSection job={job} />
      {shouldShowEvidence(job?.status) && <EvidenceSection job={job} />}

      <div className="active-dispatch-actions">
        <ActionBar
          job={job}
          onStart={onStart}
          onArrived={onArrived}
          onComplete={onComplete}
          onDecline={onDecline}
          onReportIssue={onReportIssue}
        />
      </div>
    </div>
  );
};

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(
    authService.getCurrentUser()?.isAvailable ?? true
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const {
    jobs,
    currentJob,
    loading,
    error,
    setError,
    startTrip,
    markArrived,
    completeJob,
    declineJob,
    reportIssue,
  } = useActiveJob();

  useEffect(() => {
    if (!jobs.length) {
      setSelectedAssignmentId(null);
      return;
    }

    if (
      !selectedAssignmentId ||
      !jobs.some((job) => job.assignmentId === selectedAssignmentId)
    ) {
      setSelectedAssignmentId(
        currentJob?.assignmentId ?? jobs[0]?.assignmentId ?? null
      );
    }
  }, [jobs, currentJob, selectedAssignmentId]);

  const selectedJob = useMemo(() => {
    return (
      jobs.find((job) => job.assignmentId === selectedAssignmentId) ||
      currentJob ||
      null
    );
  }, [jobs, selectedAssignmentId, currentJob]);

  const withErrorHandler = useCallback(
    (fn) => async (...args) => {
      try {
        await fn(...args);
      } catch (err) {
        console.error("Action error:", err?.response?.data);
        setError(err?.response?.data?.message || "An error occurred.");
      }
    },
    [setError]
  );

  const handleReportIssue = useCallback(
    (job) =>
      withErrorHandler(async () => {
        const supportedTypes = COLLECTION_ISSUE_TYPES.map(
          (item) => `${item.value} = ${item.label}`
        ).join("\n");

        const issueType = window.prompt(
          `Enter issue type:\n${supportedTypes}`,
          "Other"
        );

        if (!issueType) return;

        const isValidType = COLLECTION_ISSUE_TYPES.some(
          (item) => item.value.toLowerCase() === issueType.trim().toLowerCase()
        );

        if (!isValidType) {
          throw new Error("Invalid issue type.");
        }

        const description = window.prompt("Enter issue description:");
        if (!description) return;

        await reportIssue(
          job.assignmentId,
          issueType.trim(),
          description.trim(),
          null
        );
      }),
    [reportIssue, withErrorHandler]
  );

  const handleToggleAvailability = useCallback(async () => {
    const nextValue = !isOnline;
    setIsOnline(nextValue);

    try {
      const updatedUser = await userService.updateMyAvailability(nextValue);
      authService.updateCurrentUser({
        isAvailable: updatedUser.isAvailable,
        availabilityUpdatedAt: updatedUser.availabilityUpdatedAt,
      });
    } catch (err) {
      setIsOnline((prev) => !prev);
      setError(err?.response?.data?.message || "Unable to update availability.");
    }
  }, [isOnline, setError]);

  if (loading) {
    return (
      <div className="col-page-container fade-in active-dispatch-page">
        <div className="col-page-header">
          <div>
            <h2>Active Job</h2>
            <p className="text-gray">Current active job and queued assignments</p>
          </div>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="col-page-container fade-in active-dispatch-page">
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="col-page-header active-dispatch-header">
        <div>
          <h2>Active Job</h2>
          <p className="text-gray">
            Collector job queue and assignment details
          </p>
        </div>
        <StatusToggle isOnline={isOnline} onToggle={handleToggleAvailability} />
      </div>

      {!jobs.length ? (
        <EmptyState />
      ) : (
        <div className="active-dispatch-layout">
          <JobListPanel
            jobs={jobs}
            selectedJob={selectedJob}
            onSelect={(job) => setSelectedAssignmentId(job.assignmentId)}
          />

          <DetailsPanel
            job={selectedJob}
            onStart={withErrorHandler(() => startTrip(selectedJob.assignmentId))}
            onArrived={withErrorHandler((photo) =>
              markArrived(selectedJob.assignmentId, photo)
            )}
            onComplete={withErrorHandler((photo, weightsArray) =>
              completeJob(selectedJob.assignmentId, photo, weightsArray)
            )}
            onDecline={withErrorHandler((reason) =>
              declineJob(selectedJob.assignmentId, reason)
            )}
            onReportIssue={handleReportIssue(selectedJob)}
          />
        </div>
      )}
    </div>
  );
};

export default ActiveJob;
