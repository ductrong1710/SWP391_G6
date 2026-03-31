import { useCallback, useEffect, useMemo, useState } from "react";
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
        if (!mergedItems.length) {
          return null;
        }

        if (!prev) {
          return mergedItems[0];
        }

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
      try {
        setActionLoading(true);

        if (action === "accept") {
          await wasteReportService.acceptReport(reportId);
          setSuccess(`Accepted report #${reportId}.`);
        } else {
          await wasteReportService.rejectReport(reportId);
          setSuccess(`Rejected report #${reportId}.`);
        }

        await fetchData(true);
      } catch (actionError) {
        setError(
          actionError.response?.data?.message || "Unable to update report status."
        );
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
        setError("Please select a collector before assigning.");
        return;
      }

      try {
        setActionLoading(true);
        await assignmentService.assignCollector({ requestId, collectorId });
        setSuccess(`Assigned collector to request #${requestId}.`);
        await fetchData(true);
      } catch (assignError) {
        setError(assignError.response?.data?.message || "Assignment failed.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData, selectedCollectorMap]
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
  };
};

export default useDispatchData;
