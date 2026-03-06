const FILE_BASE_URL = "http://localhost:5021";

// ===== TIME =====
export const getTimeAgo = (dateString) => {
  if (!dateString) return "N/A";
  const diffSec = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
};

// ===== AI SCORE =====
export const calculateAIScore = (report) => {
  const seed =
    Number(report?.id || 0) * 13 + Number(report?.wasteTypeId || 0) * 7;
  return 65 + (seed % 31);
};

export const getUrgencyBadge = (score) => {
  if (score >= 85) return { label: "URGENT", color: "#ef4444" };
  if (score >= 75) return { label: "HIGH", color: "#f59e0b" };
  return { label: "NORMAL", color: "#10b981" };
};

// ===== IMAGE =====
export const toAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  return `${FILE_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// ===== STATUS =====
const STATUS_MAP = {
  pending: "Pending",
  "chờ duyệt": "Pending",
  "cho duyet": "Pending",
  accepted: "Accepted",
  accept: "Accepted",
  approved: "Accepted",
  rejected: "Rejected",
  reject: "Rejected",
  duplicate: "Duplicate",
  assigned: "Assigned",
  "đã phân công": "Assigned",
  inprogress: "InProgress",
  in_progress: "InProgress",
  "đang thực hiện": "InProgress",
  completed: "Completed",
  "hoàn thành": "Completed",
};

export const normalizeStatus = (status) => {
  const key = String(status || "")
    .trim()
    .toLowerCase();
  return STATUS_MAP[key] || status || "Pending";
};

// ===== NORMALIZE REPORT =====
export const normalizeReport = (r) => ({
  id: r.reportId ?? r.id ?? r.wasteReportId ?? r.requestId,
  userId: r.submittedBy ?? r.userId ?? r.user_id ?? r.createdBy ?? null,
  wasteTypeId: r.wasteTypeId ?? r.waste_type_id ?? null,
  latitude: Number(r.latitude ?? r.lat ?? 0),
  longitude: Number(r.longitude ?? r.lng ?? 0),
  description: r.description ?? r.note ?? "",
  status: normalizeStatus(r.status),
  imagePath: toAbsoluteImageUrl(r.imageUri ?? r.imagePath ?? r.image_path),
  createdAt:
    r.createdAt ?? r.created_at ?? r.createdDate ?? new Date().toISOString(),
  user: {
    userId:
      r.submittedBy ?? r.user?.userId ?? r.user?.user_id ?? r.userId ?? null,
    username:
      r.submittedByName ??
      r.user?.username ??
      r.userName ??
      r.username ??
      "Unknown",
    email: r.user?.email ?? r.email ?? "N/A",
  },
  wasteType: {
    wasteTypeId:
      r.wasteTypeId ?? r.wasteType?.wasteTypeId ?? r.waste_type_id ?? null,
    name: r.wasteTypeName ?? r.wasteType?.name ?? r.typeName ?? "Unknown",
  },
});

// ===== EXTRACT ARRAY =====
export const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.reports)) return data.reports;
  if (Array.isArray(data?.$values)) return data.$values;
  return [];
};

// ===== COLLECTOR HELPERS =====
export const getCollectorId = (c) => c.userId ?? c.UserId ?? c.id ?? c.user_id;

export const getCollectorName = (c) =>
  c.fullName ??
  c.FullName ??
  c.full_name ??
  c.userName ??
  c.username ??
  `User #${getCollectorId(c)}`;

export const getCollectorEmail = (c) => c.email ?? c.Email ?? "";

export const getCollectorPhone = (c) => c.phone ?? c.Phone ?? "";

// ===== CONSTANTS =====
export const DEFAULT_CENTER = [10.7769, 106.7009];

export const FILTER_STATUSES = [
  "Pending",
  "Accepted",
  "Assigned",
  "InProgress",
  "Completed",
  "Rejected",
  "All",
];
