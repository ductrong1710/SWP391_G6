import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import assignmentService from "../services/assignmentService";
import userService from "../services/userService";
import wasteReportService from "../services/wasteReportService";
import {
  buildDispatchItems,
  countDispatchStatuses,
  filterDispatchItems,
} from "../utils/dispatch";

const useDispatchData = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [collectors, setCollectors] = useState([]);
  const [selectedCollectorMap, setSelectedCollectorMap] = useState({});

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }

    setError("");

    try {
      const [pendingReports, collectionRequests, collectorData] = await Promise.all([
        wasteReportService.getAllReports(),
        assignmentService.getCollectionRequests(),
        userService.getCollectors(),
      ]);

      const mergedItems = buildDispatchItems({
        pendingReports,
        collectionRequests,
      });

      setItems(mergedItems);
      setCollectors(collectorData);
      setSelectedItem((prev) => {
        if (!mergedItems.length) return null;
        if (!prev) return mergedItems[0];

        return (
          mergedItems.find(
            (item) => item.kind === prev.kind && item.id === prev.id
          ) || mergedItems[0]
        );
      });
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Unable to load dispatch data.");
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(
    () => filterDispatchItems(items, filterStatus),
    [filterStatus, items]
  );

  const statusCounts = useMemo(() => countDispatchStatuses(items), [items]);

  const handleReportAction = useCallback(
    async (reportId, action) => {
      if (!reportId) {
        const message = "Invalid report id.";
        setError(message);
        toast.error(message);
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        const latest = await wasteReportService.getReportById(reportId);
        const latestStatus = String(latest?.status || "").trim().toLowerCase();

        if (latestStatus !== "pending") {
          const message = `Report #${reportId} is ${latest?.status || "Unknown"}, not Pending.`;
          setError(message);
          toast.error(message);
          await fetchData(true);
          return;
        }

        if (action === "accept") {
          await wasteReportService.acceptReport(reportId);
          const message = `Accepted report #${reportId}.`;
          setSuccess(message);
          toast.success(message);
        } else {
          await wasteReportService.rejectReport(reportId);
          const message = `Rejected report #${reportId}.`;
          setSuccess(message);
          toast.success(message);
        }

        await fetchData(true);
      } catch (actionError) {
        const message =
          actionError.response?.data?.message || "Unable to update report status.";
        setError(message);
        toast.error(message);
        await fetchData(true);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData]
  );

  const handleAssignCollector = useCallback(
    async (requestId) => {
      const collectorId = selectedCollectorMap[requestId];

      if (!collectorId) {
        const message = "Please select a collector before assigning.";
        setError(message);
        toast.error(message);
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        await assignmentService.assignCollector({ requestId, collectorId });

        const message = `Assigned collector to request #${requestId}.`;
        setSuccess(message);
        toast.success(message);

        await fetchData(true);
      } catch (assignError) {
        const message =
          assignError.response?.data?.message || "Assignment failed.";
        setError(message);
        toast.error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData, selectedCollectorMap]
  );

  const handleEnterpriseCancel = useCallback(
    async (reportId) => {
      if (!window.confirm("Are you sure you want to cancel this report?")) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        await wasteReportService.cancelByEnterprise(reportId);

        const message = `Cancelled report #${reportId}.`;
        setSuccess(message);
        toast.success(message);

        await fetchData(true);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to cancel report.";
        setError(message);
        toast.error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData]
  );

  return {
    selectedItem,
    setSelectedItem,
    loading,
    actionLoading,
    error,
    setError,
    success,
    setSuccess,
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
    handleEnterpriseCancel,
  };
};

export default useDispatchData;
