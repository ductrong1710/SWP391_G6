import React, { useEffect, useMemo, useState } from "react";
import assignmentService from "../../services/assignmentService";

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US");
};

const formatLocation = (job) => {
  const hasLat = typeof job?.latitude === "number" && !Number.isNaN(job.latitude);
  const hasLng = typeof job?.longitude === "number" && !Number.isNaN(job.longitude);

  if (hasLat && hasLng && job.latitude !== 0 && job.longitude !== 0) {
    return `${job.latitude}, ${job.longitude}`;
  }

  return job?.description || "No location available";
};

const TaskHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      try {
        const data = await assignmentService.getMyAssignments();
        if (!mounted) return;

        const completedJobs = data
          .filter((job) => job.status === "Completed")
          .sort((a, b) => new Date(b.completedAt ?? 0) - new Date(a.completedAt ?? 0));

        setHistoryData(completedJobs);
        setSelectedAssignmentId(completedJobs[0]?.assignmentId ?? null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, []);

  const completedCount = historyData.length;

  const totalCollectedWeight = useMemo(
    () => historyData.reduce((sum, item) => sum + Number(item.totalCollectedWeight || 0), 0),
    [historyData]
  );

  const latestCompleted = useMemo(
    () => historyData[0] ?? null,
    [historyData]
  );

  const selectedJob = useMemo(
    () =>
      historyData.find((item) => item.assignmentId === selectedAssignmentId) ||
      historyData[0] ||
      null,
    [historyData, selectedAssignmentId]
  );

  if (loading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }

  return (
    <div className="col-page-container fade-in">
      <div className="col-page-header">
        <div>
          <h2>Task History</h2>
          <p className="text-gray">Your completed collection jobs</p>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="summary-card">
          <div className="summary-val">{completedCount}</div>
          <div className="summary-label">Jobs Completed</div>
        </div>

        <div className="summary-card">
          <div className="summary-val">{totalCollectedWeight.toFixed(1)} kg</div>
          <div className="summary-label">Total Waste Collected</div>
        </div>

        <div className="summary-card">
          <div className="summary-val">
            {latestCompleted?.completedAt
              ? new Date(latestCompleted.completedAt).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="summary-label">Latest Completion</div>
        </div>
      </div>

      {historyData.length === 0 ? (
        <p className="text-center text-gray mt-4">No completed tasks yet.</p>
      ) : (
        <div className="active-dispatch-layout">
          <div className="active-dispatch-list-panel">
            <h2 className="active-dispatch-panel-title">
              Completed Jobs <span className="count">{historyData.length}</span>
            </h2>

            <div className="active-dispatch-list">
              {historyData.map((item) => (
                <div
                  key={item.assignmentId}
                  className={`active-dispatch-item ${
                    selectedJob?.assignmentId === item.assignmentId ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAssignmentId(item.assignmentId)}
                >
                  <div className="active-dispatch-item-header">
                    <div className="active-dispatch-avatar">C</div>

                    <div className="active-dispatch-item-main">
                      <div className="active-dispatch-item-title">
                        Job #{item.assignmentId}
                      </div>
                      <div className="active-dispatch-item-subtitle">
                        {item.citizenName || "Citizen"}
                      </div>
                    </div>

                    <span className="badge-verified">
                      <span className="icon-check">✔</span> Completed
                    </span>
                  </div>

                  <div className="active-dispatch-item-meta">
                    <div>{item.wasteTypeName || "Waste"}</div>
                    <div>{formatDateTime(item.completedAt)}</div>
                    <div>{Number(item.totalCollectedWeight || 0).toFixed(1)} kg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="active-dispatch-details-panel">
            {selectedJob && (
              <>
                <div className="active-dispatch-detail-hero">
                  <div>
                    <div className="active-dispatch-eyebrow">Completed Assignment</div>
                    <div className="active-dispatch-title-row">
                      <h2>Job #{selectedJob.assignmentId}</h2>
                      <span className="badge-verified">
                        <span className="icon-check">✔</span> Completed
                      </span>
                    </div>
                    <p className="text-gray">
                      Request #{selectedJob.requestId} • Report #{selectedJob.reportId}
                    </p>
                  </div>

                  <div className="hc-right">
                    <span className="badge-waste">{selectedJob.wasteTypeName || "Waste"}</span>
                  </div>
                </div>

                <div className="details-grid active-dispatch-details-grid">
                  <div className="detail-section">
                    <label>Citizen</label>
                    <p className="detail-value">{selectedJob.citizenName || "N/A"}</p>
                  </div>
                  <div className="detail-section">
                    <label>Citizen Phone</label>
                    <p className="detail-value">{selectedJob.citizenPhone || "N/A"}</p>
                  </div>
                  <div className="detail-section">
                    <label>Completed At</label>
                    <p className="detail-value">{formatDateTime(selectedJob.completedAt)}</p>
                  </div>
                  <div className="detail-section">
                    <label>Total Weight</label>
                    <p className="detail-value">
                      {Number(selectedJob.totalCollectedWeight || 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Waste Type</label>
                    <p className="detail-value">{selectedJob.wasteTypeName || "Waste"}</p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Location</label>
                    <p className="detail-value">{formatLocation(selectedJob)}</p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Collected Breakdown</label>
                    <p className="detail-value">
                      {selectedJob.collectedWasteSummary || "No collected waste details"}
                    </p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Completion Note</label>
                    <p className="detail-value">
                      {selectedJob.completionNote || "No completion note"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
