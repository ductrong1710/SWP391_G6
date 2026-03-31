import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import useDispatchData from "../../hooks/useDispatchData";
import { buildFileUrl } from "../../services/api";
import {
  DISPATCH_FILTERS,
  getDispatchItemAgeLabel,
  getDispatchMapCenter,
} from "../../utils/dispatch";
import "./Dispatch.css";

const DEFAULT_CENTER = [10.7769, 106.7009];

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Dispatch = () => {
  const {
    selectedItem,
    setSelectedItem,
    loading,
    actionLoading,
    error,
    success,
    filterStatus,
    setFilterStatus,
    collectors,
    selectedCollectorMap,
    setSelectedCollectorMap,
    filteredItems,
    statusCounts,
    fetchData,
    handleReportAction,
    handleAssignCollector,
  } = useDispatchData();

  const mapCenter = getDispatchMapCenter(selectedItem, DEFAULT_CENTER);

  return (
    <div className="dispatch-container">
      <div className="dispatch-header">
        <div>
          <h1>Dispatch Console</h1>
          <p>Manage pending reports and real collection requests</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={() => fetchData(false)}
            disabled={loading || actionLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {DISPATCH_FILTERS.map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
            disabled={loading || actionLoading}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="dispatch-content">
          <div className="requests-panel">
            <h2 className="panel-title">
              Queue <span className="count">{filteredItems.length}</span>
            </h2>

            {!filteredItems.length ? (
              <div className="empty-state">
                <p>No items available in this status.</p>
              </div>
            ) : (
              <div className="requests-list">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className={`request-card ${
                      selectedItem?.kind === item.kind && selectedItem?.id === item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="request-header">
                      <div className="user-info">
                        <div className="user-avatar">{item.kind === "report" ? "R" : "C"}</div>
                        <div>
                          <div className="user-name">
                            {item.kind === "report"
                              ? item.submittedByName || `Citizen #${item.reportId}`
                              : `Request #${item.requestId}`}
                          </div>
                          <div className="report-location">
                            {item.latitude?.toFixed?.(4)}, {item.longitude?.toFixed?.(4)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-item">{item.wasteTypeName || "Waste"}</div>
                      <div className="detail-item">
                        {getDispatchItemAgeLabel(item.createdAt)}
                      </div>
                      <div className="detail-item">
                        <span className={`status-tag status-${String(item.status).toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {item.kind === "report" && item.status === "Pending" && (
                      <div
                        className="request-actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          className="btn-accept"
                          disabled={actionLoading}
                          onClick={() => handleReportAction(item.reportId, "accept")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actionLoading}
                          onClick={() => handleReportAction(item.reportId, "reject")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="right-panel">
            <div className="map-panel">
              <h2 className="panel-title">Location Map</h2>
              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`}
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", borderRadius: 8 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selectedItem && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>
                        {selectedItem.kind === "report"
                          ? `Report #${selectedItem.reportId}`
                          : `Request #${selectedItem.requestId}`}
                      </strong>
                      <br />
                      {selectedItem.wasteTypeName}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {selectedItem && (
              <div className="details-panel">
                <h2>Details</h2>
                <div className="details-grid">
                  <div className="detail-section">
                    <label>Report ID:</label>
                    <p className="detail-value">#{selectedItem.reportId}</p>
                  </div>
                  {selectedItem.requestId && (
                    <div className="detail-section">
                      <label>Request ID:</label>
                      <p className="detail-value">#{selectedItem.requestId}</p>
                    </div>
                  )}
                  <div className="detail-section">
                    <label>Status:</label>
                    <p className={`detail-value status-${String(selectedItem.status).toLowerCase()}`}>
                      {selectedItem.status}
                    </p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Waste Type:</label>
                    <p className="detail-value">{selectedItem.wasteTypeName || "Waste"}</p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Description:</label>
                    <p className="detail-value">
                      {selectedItem.description || "No description"}
                    </p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Image:</label>
                    {selectedItem.imageUrl ? (
                      <img
                        src={buildFileUrl(selectedItem.imageUrl)}
                        alt="waste"
                        className="detail-image"
                      />
                    ) : (
                      <p className="detail-value text-gray">No image available</p>
                    )}
                  </div>
                </div>

                {selectedItem.kind === "request" && selectedItem.status === "Accepted" && (
                  <div
                    className="assignment-box"
                    style={{
                      marginTop: 20,
                      padding: 15,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: 10,
                        fontSize: 16,
                        color: "#1e293b",
                      }}
                    >
                      Assign Collector
                    </h3>
                    <div style={{ display: "flex", gap: 10 }}>
                      <select
                        style={{
                          flex: 1,
                          padding: 10,
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: 14,
                        }}
                        value={selectedCollectorMap[selectedItem.requestId] || ""}
                        onChange={(event) =>
                          setSelectedCollectorMap((prev) => ({
                            ...prev,
                            [selectedItem.requestId]: Number(event.target.value),
                          }))
                        }
                      >
                        <option value="">-- Select a collector to assign --</option>
                        {collectors.map((collector) => (
                          <option key={collector.userId} value={collector.userId}>
                            {collector.fullName} - {collector.email}
                          </option>
                        ))}
                      </select>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: "bold",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                        }}
                        disabled={
                          actionLoading || !selectedCollectorMap[selectedItem.requestId]
                        }
                        onClick={() => handleAssignCollector(selectedItem.requestId)}
                      >
                        Assign Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
