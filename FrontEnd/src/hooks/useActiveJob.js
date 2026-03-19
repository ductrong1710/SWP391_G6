import { useCallback, useEffect, useRef, useState } from "react";
import assignmentService from "../services/assignmentService";
import collectionService from "../services/collectionService";
import {
  buildArrivalFormData,
  buildCompletionFormData,
  buildIssueFormData,
} from "../utils/collectorJob";

const useActiveJob = () => {
  const [job, setJob] = useState(null);
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
      if (!mountedRef.current) {
        return;
      }

      setJob(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch {
      if (!mountedRef.current) {
        return;
      }

      setJob(null);
      setError("Unable to load assignment.");
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
    async (assignmentId, issueDescription, photo) => {
      await collectionService.reportIssue(
        assignmentId,
        buildIssueFormData(issueDescription, photo)
      );
      await fetchMyAssignments(true);
    },
    [fetchMyAssignments]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchMyAssignments();
    const interval = window.setInterval(() => fetchMyAssignments(), 10000);

    return () => {
      window.clearInterval(interval);
      mountedRef.current = false;
    };
  }, [fetchMyAssignments]);

  return {
    job,
    loading,
    error,
    setError,
    startTrip,
    markArrived,
    completeJob,
    declineJob,
    reportIssue,
  };
};

export default useActiveJob;
