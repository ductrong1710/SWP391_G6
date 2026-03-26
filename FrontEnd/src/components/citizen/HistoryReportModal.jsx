import React, { useEffect, useState } from "react";
import { buildFileUrl } from "../../services/api";
import feedbackService from "../../services/feedbackService";

const HistoryReportModal = ({
  report,
  wasteTypes,
  isEditing,
  editForm,
  setEditForm,
  canModify,
  submitting,
  onEdit,
  onCancelReport,
  onSave,
  onDiscard,
  onClose,
}) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    if (report?.reportId) {
      loadFeedbacks();
    }
  }, [report?.reportId]);

  const loadFeedbacks = async () => {
    try {
      const data = await feedbackService.getFeedbacksByReport(report.reportId);
      setFeedbacks(data);
    } catch {
      setFeedbacks([]);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSendingFeedback(true);
    setFeedbackSuccess("");
    setFeedbackError("");
    try {
      await feedbackService.createFeedback(report.reportId, feedbackText.trim(), feedbackImage);
      setFeedbackText("");
      setFeedbackImage(null);
      setFeedbackSuccess("Feedback submitted successfully!");
      await loadFeedbacks();
      setTimeout(() => setFeedbackSuccess(""), 3000);
    } catch (err) {
      setFeedbackError(err.response?.data?.message || "Failed to send feedback");
    } finally {
      setSendingFeedback(false);
    }
  };

  if (!report) {
    return null;
  }

  const statusColor = {
    Pending: "#f59e0b",
    Resolved: "#10b981",
    Rejected: "#ef4444",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          padding: 25,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 15, color: "#1f2937" }}>
          Report Details #{report.reportId}
        </h2>

        {report.imageUrl && (
          <img
            src={buildFileUrl(report.imageUrl)}
            alt="Report"
            style={{
              width: "100%",
              maxHeight: 300,
              objectFit: "cover",
              borderRadius: 6,
              marginBottom: 15,
            }}
          />
        )}

        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: 15,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {isEditing ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ display: "block", marginBottom: 8 }}>
                  Waste Type:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {wasteTypes.map((type) => (
                    <label
                      key={type.wasteTypeId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: 999,
                        backgroundColor: "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.wasteTypeIds.includes(type.wasteTypeId)}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            wasteTypeIds: event.target.checked
                              ? [...prev.wasteTypeIds, type.wasteTypeId]
                              : prev.wasteTypeIds.filter(
                                  (id) => id !== type.wasteTypeId
                                ),
                          }))
                        }
                      />
                      {type.name}
                    </label>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <strong>Latitude</strong>
                  <input
                    type="number"
                    step="any"
                    value={editForm.latitude}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        latitude: event.target.value,
                      }))
                    }
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <strong>Longitude</strong>
                  <input
                    type="number"
                    step="any"
                    value={editForm.longitude}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        longitude: event.target.value,
                      }))
                    }
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <strong>Description</strong>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    resize: "vertical",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <strong>Replace Image</strong>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      image: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
            </>
          ) : (
            <>
              <p style={{ margin: "8px 0", fontSize: 14 }}>
                <strong>Waste Type:</strong>{" "}
                {report.wasteTypeNames?.join(", ") || "N/A"}
              </p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>
                <strong>Location:</strong> {report.latitude}, {report.longitude}
              </p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>
                <strong>Created:</strong>{" "}
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : "Unknown time"}
              </p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>
                <strong>Description:</strong> {report.description || "No description"}
              </p>
            </>
          )}
          <p style={{ margin: "12px 0 0 0", fontWeight: "bold" }}>
            <strong>Status:</strong> {report.status}
          </p>
        </div>

        {/* ── Feedback Section ── */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            padding: 16,
            borderRadius: 8,
            marginBottom: 15,
            border: "1px solid #bbf7d0",
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#166534" }}>
            💬 Feedback
          </h4>

          {/* Previous feedbacks */}
          {feedbacks.length > 0 ? (
            <div style={{ marginBottom: 12, maxHeight: 200, overflowY: "auto" }}>
              {feedbacks.map((fb) => (
                <div
                  key={fb.feedbackId}
                  style={{
                    backgroundColor: "#fff",
                    padding: "10px 12px",
                    borderRadius: 6,
                    marginBottom: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                      {fb.userName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontWeight: 600,
                        background: `${statusColor[fb.status] || "#94a3b8"}20`,
                        color: statusColor[fb.status] || "#64748b",
                      }}
                    >
                      {fb.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>
                    {fb.content}
                  </div>
                  {fb.imageUrl && (
                    <img
                      src={buildFileUrl(fb.imageUrl)}
                      alt="Evidence"
                      style={{
                        width: "100%",
                        maxHeight: 150,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginTop: 6,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  )}
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
                  </div>
                  {/* Resolution note from admin */}
                  {fb.resolutionNote && (fb.status === "Resolved" || fb.status === "Rejected") && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "8px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: 1.5,
                        background: fb.status === "Resolved" ? "#ecfdf5" : "#fef2f2",
                        border: `1px solid ${fb.status === "Resolved" ? "#a7f3d0" : "#fecaca"}`,
                        color: fb.status === "Resolved" ? "#065f46" : "#991b1b",
                      }}
                    >
                      <strong>{fb.status === "Resolved" ? "✅" : "❌"} Admin:</strong> {fb.resolutionNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              No feedback yet. Send your feedback below.
            </div>
          )}

          {feedbackSuccess && (
            <div style={{ fontSize: 13, color: "#059669", marginBottom: 8 }}>
              ✅ {feedbackSuccess}
            </div>
          )}
          {feedbackError && (
            <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 8 }}>
              ❌ {feedbackError}
            </div>
          )}

          {/* Send new feedback */}
          {(report.status === "Collected" || report.status === "Completed") ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              rows={2}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Write your feedback about this report..."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 13,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#475569",
                  background: "#fff",
                }}
              >
                📷 Attach Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  style={{ display: "none" }}
                  onChange={(e) => setFeedbackImage(e.target.files?.[0] ?? null)}
                />
              </label>
              {feedbackImage && (
                <span style={{ fontSize: 12, color: "#059669" }}>
                  ✅ {feedbackImage.name}
                  <button
                    onClick={() => setFeedbackImage(null)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={handleSendFeedback}
                disabled={sendingFeedback || !feedbackText.trim()}
                style={{
                  marginLeft: "auto",
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: sendingFeedback ? "#94a3b8" : "#10b981",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: sendingFeedback ? "not-allowed" : "pointer",
                  fontSize: 13,
                }}
              >
                {sendingFeedback ? "..." : "Send"}
              </button>
            </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", marginTop: 12, textAlign: "center", padding: "10px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              Complaints can only be submitted after the collector marks this report as Collected or Completed.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {canModify && !isEditing && (
            <>
              <button
                onClick={onEdit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Edit
              </button>
              <button
                onClick={onCancelReport}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel Report
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button
                onClick={onSave}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Save Changes
              </button>
              <button
                onClick={onDiscard}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Discard
              </button>
            </>
          )}

          {!canModify && (
            <div
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              This report can only be edited or cancelled while its status is Pending.
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryReportModal;
