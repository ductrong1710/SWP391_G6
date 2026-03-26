import React from "react";
import { buildFileUrl } from "../../services/api";

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
  if (!report) {
    return null;
  }

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
