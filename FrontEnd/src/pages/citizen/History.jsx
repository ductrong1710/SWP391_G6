import React, { useEffect, useMemo, useState } from "react";
import HistoryReportCard from "../../components/citizen/HistoryReportCard";
import HistoryReportModal from "../../components/citizen/HistoryReportModal";
import wasteReportService from "../../services/wasteReportService";
import "./History.css"; // Import file CSS vừa tạo
const History = () => {
  const [reports, setReports] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    wasteTypeIds: [],
    latitude: "",
    longitude: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [allReports, wasteTypeList] = await Promise.all([
          wasteReportService.getAllReports(),
          wasteReportService.getWasteTypes(),
        ]);
        setReports(allReports);
        setWasteTypes(wasteTypeList);
      } catch {
        setError("Unable to load report history");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshReports = async () => {
    const allReports = await wasteReportService.getAllReports();
    setReports(allReports);

    if (selectedReport) {
      const updatedSelection = allReports.find(
        (report) => report.reportId === selectedReport.reportId
      );
      setSelectedReport(updatedSelection || null);
      if (!updatedSelection) {
        setShowModal(false);
        setIsEditing(false);
      }
    }
  };

  const canModifyReport = (report) => report?.status === "Pending";

  const openReportModal = (report) => {
    setSelectedReport(report);
    setEditForm({
      wasteTypeIds: report.wasteTypeIds ?? [],
      latitude: report.latitude ?? "",
      longitude: report.longitude ?? "",
      description: report.description ?? "",
      image: null,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const resetEditForm = () => {
    setIsEditing(false);
    setEditForm({
      wasteTypeIds: selectedReport?.wasteTypeIds ?? [],
      latitude: selectedReport?.latitude ?? "",
      longitude: selectedReport?.longitude ?? "",
      description: selectedReport?.description ?? "",
      image: null,
    });
  };

  const filteredReports = useMemo(() => {
    if (filter === "All") {
      return reports;
    }

    return reports.filter((report) => report.status === filter);
  }, [filter, reports]);

  const handleEditSubmit = async () => {
    if (!selectedReport) {
      return;
    }

    if (!canModifyReport(selectedReport)) {
      setError("Only Pending reports can be edited.");
      return;
    }

    if (!editForm.wasteTypeIds.length) {
      setError("Please select at least one waste type.");
      return;
    }

    if (editForm.latitude === "" || editForm.longitude === "") {
      setError("Latitude and longitude are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await wasteReportService.updateReport(selectedReport.reportId, {
        image: editForm.image,
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
        description: editForm.description,
        wasteTypeIds: editForm.wasteTypeIds,
      });

      await refreshReports();
      setIsEditing(false);
      setSuccess(`Report #${selectedReport.reportId} updated successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update this report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReport = async () => {
    if (!selectedReport) {
      return;
    }

    if (!canModifyReport(selectedReport)) {
      setError("Only Pending reports can be cancelled.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await wasteReportService.cancelReport(selectedReport.reportId);
      await refreshReports();
      setShowModal(false);
      setIsEditing(false);
      setSuccess(`Report #${selectedReport.reportId} cancelled successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel this report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>My Report History</h2>
        <p>View the real status of reports you submitted</p>
      </div>

      {success && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {success}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["All", "Pending", "Accepted", "Assigned", "OnTheWay", "Arrived", "Collected", "Rejected"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid #ccc",
                backgroundColor: filter === status ? "#3b82f6" : "white",
                color: filter === status ? "white" : "#333",
                cursor: "pointer",
              }}
            >
              {status}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
          You have no reports in this status.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {filteredReports.map((report) => (
            <HistoryReportCard
              key={report.reportId}
              report={report}
              onClick={openReportModal}
            />
          ))}
        </div>
      )}

      {showModal && selectedReport && (
        <HistoryReportModal
          report={selectedReport}
          wasteTypes={wasteTypes}
          isEditing={isEditing}
          editForm={editForm}
          setEditForm={setEditForm}
          canModify={canModifyReport(selectedReport)}
          submitting={submitting}
          onEdit={() => setIsEditing(true)}
          onCancelReport={handleCancelReport}
          onSave={handleEditSubmit}
          onDiscard={resetEditForm}
          onClose={() => {
            setShowModal(false);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default History;
