import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import assignmentService from "../services/assignmentService";
import collectionService from "../services/collectionService";
import {
  buildArrivalFormData,
  buildCompletionFormData,
  buildIssueFormData,
} from "../utils/collectorJob";

const VISIBLE_STATUSES = [
  "Assigned",
  "OnTheWay",
  "Arrived",
  "ReportedIssue",
  "Failed",
];

const STATUS_PRIORITY = {
  OnTheWay: 1,
  Arrived: 2,
  ReportedIssue: 3,
  Failed: 4,
  Assigned: 5,
  Completed: 6,
  Declined: 7,
  Cancelled: 8,
};

const sortAssignments = (items) =>
  [...items].sort((a, b) => {
    const statusDiff =
      (STATUS_PRIORITY[a.status] ?? 999) - (STATUS_PRIORITY[b.status] ?? 999);

    if (statusDiff !== 0) return statusDiff;

    return new Date(b.assignedAt ?? 0) - new Date(a.assignedAt ?? 0);
  });

const useActiveJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  const fetchMyAssignments = useCallback(async (force = false) => {
    const now = Date.now();

    if (!force && lastFetchRef.current && now - lastFetchRef.current < 1000) {
      return;
    }

    lastFetchRef.current = now;

    try {
      const data = await assignmentService.getMyAssignments();

      if (!mountedRef.current) return;

      const visibleJobs = Array.isArray(data)
        ? sortAssignments(data).filter((item) => VISIBLE_STATUSES.includes(item.status))
        : [];

      setJobs(visibleJobs);
    } catch (err) {
      if (!mountedRef.current) return;

      setJobs([]);
      setError(err?.response?.data?.message || "Unable to load assignments.");

      window.setTimeout(() => {
        if (mountedRef.current) {
          setError("");
        }
      }, 3000);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const startTrip = useCallback(
    async (assignmentId) => {
      await collectionService.startCollection(assignmentId);
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  const markArrived = useCallback(
    async (assignmentId, beforePhoto) => {
      await collectionService.arrivedAtLocation(
        assignmentId,
        buildArrivalFormData(beforePhoto)
      );
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  const completeJob = useCallback(
    async (assignmentId, afterPhoto, weightsArray) => {
      await collectionService.completeCollection(
        assignmentId,
        buildCompletionFormData(afterPhoto, weightsArray)
      );
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  const declineJob = useCallback(
    async (assignmentId, reason) => {
      await collectionService.declineAssignment(assignmentId, { reason });
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  const reportIssue = useCallback(
    async (assignmentId, issueType, description, proofImage) => {
      await collectionService.reportIssue(
        assignmentId,
        buildIssueFormData(issueType, description, proofImage)
      );
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchMyAssignments();

    const interval = window.setInterval(() => {
      fetchMyAssignments();
    }, 10000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, [fetchMyAssignments]);

  const currentJob = useMemo(() => {
    return (
      jobs.find((item) => item.status === "OnTheWay" || item.status === "Arrived") ||
      jobs.find((item) => item.status === "ReportedIssue" || item.status === "Failed") ||
      jobs.find((item) => item.status === "Assigned") ||
      null
    );
  }, [jobs]);

  return {
    jobs,
    currentJob,
    loading,
    error,
    setError,
    refreshAssignments: fetchMyAssignments,
    startTrip,
    markArrived,
    completeJob,
    declineJob,
    reportIssue,
  };
};

export default useActiveJob;