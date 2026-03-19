export const JOB_STATUS = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "OnTheWay",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

export const getStatusMeta = (status) => {
  switch (status) {
    case JOB_STATUS.ASSIGNED:
      return { label: "Assigned", className: "badge-info", icon: "📋" };
    case JOB_STATUS.ON_THE_WAY:
      return { label: "On the way", className: "badge-primary", icon: "🚚" };
    case JOB_STATUS.ARRIVED:
      return { label: "Arrived", className: "badge-warning", icon: "📍" };
    case JOB_STATUS.COMPLETED:
      return { label: "Completed", className: "badge-completed", icon: "✅" };
    case JOB_STATUS.DECLINED:
      return { label: "Declined", className: "badge-danger", icon: "✕" };
    default:
      return { label: status || "Unknown", className: "badge-neutral", icon: "•" };
  }
};

export const resolveWasteTypesForJob = (job, wasteTypes) => {
  const jobTypeIds = Array.isArray(job?.wasteTypeIds) ? job.wasteTypeIds : [];

  if (Array.isArray(wasteTypes) && wasteTypes.length && jobTypeIds.length) {
    const matchedTypes = wasteTypes.filter((type) =>
      jobTypeIds.includes(type.wasteTypeId)
    );

    if (matchedTypes.length) {
      return matchedTypes.map((type) => ({
        wasteTypeId: type.wasteTypeId,
        name: type.name,
      }));
    }
  }

  if (Array.isArray(wasteTypes) && wasteTypes.length && job?.wasteTypeName) {
    const names = job.wasteTypeName
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    const matchedTypes = wasteTypes.filter((type) =>
      names.includes((type.name || "").trim().toLowerCase())
    );

    if (matchedTypes.length) {
      return matchedTypes.map((type) => ({
        wasteTypeId: type.wasteTypeId,
        name: type.name,
      }));
    }
  }

  return [
    {
      wasteTypeId: 1,
      name: job?.wasteTypeName || "General Waste",
    },
  ];
};

export const buildArrivalFormData = (beforePhoto) => {
  const formData = new FormData();

  if (beforePhoto) {
    formData.append("BeforeImage", beforePhoto, beforePhoto.name);
  }

  return formData;
};

export const buildCompletionFormData = (afterPhoto, weightsArray) => {
  const formData = new FormData();

  if (afterPhoto) {
    formData.append("AfterImage", afterPhoto, afterPhoto.name);
  }

  weightsArray.forEach((item, index) => {
    formData.append(`ActualWeights[${index}].WasteTypeId`, String(item.wasteTypeId));
    formData.append(`ActualWeights[${index}].Weight`, String(item.weight));
  });

  formData.append("Note", "Thu gom thành công");

  return formData;
};

export const buildIssueFormData = (issueDescription, photo) => {
  const formData = new FormData();
  formData.append("IssueDescription", issueDescription);

  if (photo) {
    formData.append("Photo", photo);
  }

  return formData;
};

export const normalizeCompletionWeights = (weightsByType, wasteTypesList) => {
  const weightsArray = [];

  wasteTypesList.forEach((type) => {
    const rawValue = weightsByType[type.wasteTypeId];
    const normalized = String(rawValue ?? "").replace(",", ".").trim();
    const weightValue = Number(normalized);

    if (!Number.isNaN(weightValue) && weightValue > 0) {
      weightsArray.push({
        wasteTypeId: Number(type.wasteTypeId),
        weight: weightValue,
      });
    }
  });

  return weightsArray;
};
