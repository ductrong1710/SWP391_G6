import React from "react";
import { buildFileUrl } from "../../services/api";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return { color: "#fef3c7", textColor: "#92400e", text: "Pending" };
    case "Accepted":
      return { color: "#d1fae5", textColor: "#065f46", text: "Accepted" };
    case "Assigned":
    case "OnTheWay":
    case "Arrived":
      return { color: "#dbeafe", textColor: "#1d4ed8", text: status };
    case "Collected":
    case "Completed":
      return { color: "#dcfce7", textColor: "#166534", text: "Completed" };
    case "Rejected":
      return { color: "#fee2e2", textColor: "#991b1b", text: "Rejected" };
    case "Cancelled":
      return { color: "#e5e7eb", textColor: "#4b5563", text: "Cancelled" };
    default:
      return { color: "#f3f4f6", textColor: "#6b7280", text: status };
  }
};

const HistoryReportCard = ({ report, onClick }) => {
  const badge = getStatusBadge(report.status);
  const wasteTypeLabel = report.wasteTypeNames?.length
    ? report.wasteTypeNames.join(", ")
    : "N/A";

  return (
    <div
      onClick={() => onClick(report)}
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr auto",
        gap: 15,
        padding: 15,
        backgroundColor: "white",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        cursor: "pointer",
      }}
    >
      {report.imageUrl ? (
        <img
          src={buildFileUrl(report.imageUrl)}
          alt="Report"
          style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6 }}
        />
      ) : (
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 6,
            backgroundColor: "#f3f4f6",
          }}
        />
      )}

      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, color: "#1f2937" }}>
          #{report.reportId} - {wasteTypeLabel}
        </h3>
        <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>
          Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
        </p>
        <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>
          {report.createdAt
            ? new Date(report.createdAt).toLocaleString()
            : "Unknown time"}
        </p>
        {report.description && (
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: 12,
              color: "#999",
              fontStyle: "italic",
            }}
          >
            {report.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          backgroundColor: badge.color,
          color: badge.textColor,
          borderRadius: 20,
          fontWeight: "bold",
          whiteSpace: "nowrap",
          fontSize: 13,
        }}
      >
        {badge.text}
      </div>
    </div>
  );
};

export default HistoryReportCard;
