import { getTimeAgo } from "./helpers";

export const DISPATCH_FILTERS = [
  "Pending",
  "Accepted",
  "Assigned",
  "OnTheWay",
  "Arrived",
  "Completed",
  "Rejected",
  "All",
];

export const mapCollectionRequestStatus = (request) => {
  if (request.assignmentStatus) {
    return request.assignmentStatus;
  }

  if (request.status === "Pending") {
    return "Accepted";
  }

  return request.status || "Unknown";
};

export const buildDispatchItems = ({ pendingReports, collectionRequests }) => {
  const pendingItems = pendingReports
    .filter((report) => report.status === "Pending")
    .map((report) => ({
      kind: "report",
      id: report.reportId,
      reportId: report.reportId,
      requestId: null,
      status: report.status,
      wasteTypeName: report.wasteTypeNames.join(", "),
      description: report.description,
      latitude: report.latitude,
      longitude: report.longitude,
      createdAt: report.createdAt,
      imageUrl: report.imageUrl,
      submittedByName: report.submittedByName,
    }));

  const requestItems = collectionRequests.map((request) => ({
    kind: "request",
    id: request.requestId,
    reportId: request.reportId,
    requestId: request.requestId,
    currentAssignmentId: request.currentAssignmentId,
    status: mapCollectionRequestStatus(request),
    wasteTypeName: request.wasteTypeName,
    description: request.reportDescription,
    latitude: request.latitude,
    longitude: request.longitude,
    createdAt: request.reportCreatedAt || request.createdAt,
    imageUrl: request.reportImageUrl,
    submittedByName: request.enterpriseName,
    assignedCollectorName: request.assignedCollectorName,
  }));

  return [...pendingItems, ...requestItems].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

export const filterDispatchItems = (items, filterStatus) => {
  if (filterStatus === "All") {
    return items;
  }

  return items.filter((item) => item.status === filterStatus);
};

export const countDispatchStatuses = (items) => {
  const counts = { All: items.length };

  items.forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
  });

  return counts;
};

export const getDispatchMapCenter = (selectedItem, defaultCenter) => {
  if (!selectedItem || (!selectedItem.latitude && !selectedItem.longitude)) {
    return defaultCenter;
  }

  return [selectedItem.latitude, selectedItem.longitude];
};

export const getDispatchItemAgeLabel = (createdAt) => getTimeAgo(createdAt);
