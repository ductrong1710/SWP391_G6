export const DEFAULT_REPORT_FORM = {
  wasteTypeIds: [],
  latitude: null,
  longitude: null,
  description: "",
};

export const DEFAULT_REPORT_CENTER = [10.7769, 106.7009];

export const validateReportImage = (file) => {
  if (!file) {
    return { valid: false, message: "❌ Please select an image" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, message: "❌ File size exceeds 10MB" };
  }

  if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
    return {
      valid: false,
      message: "❌ Only PNG, JPG, JPEG image files are supported",
    };
  }

  return { valid: true, message: "" };
};

export const toggleWasteTypeId = (wasteTypeIds, wasteTypeId, checked) => {
  if (checked) {
    return [...wasteTypeIds, wasteTypeId];
  }

  return wasteTypeIds.filter((id) => id !== wasteTypeId);
};

export const clampCoordinates = (latitude, longitude) => ({
  latitude: Math.max(-90, Math.min(90, Number(latitude))),
  longitude: Math.max(-180, Math.min(180, Number(longitude))),
});

export const buildReportPayload = ({ selectedFile, formData }) => {
  const { latitude, longitude } = clampCoordinates(
    formData.latitude,
    formData.longitude
  );

  return {
    image: selectedFile,
    latitude,
    longitude,
    description: formData.description || "",
    wasteTypeIds: formData.wasteTypeIds,
  };
};

export const validateReportForm = ({ selectedFile, formData }) => {
  const fileValidation = validateReportImage(selectedFile);
  if (!fileValidation.valid) {
    return fileValidation.message;
  }

  if (!formData.wasteTypeIds.length) {
    return "❌ Please select at least one waste type";
  }

  if (!formData.latitude || !formData.longitude) {
    return "❌ Please select a location on the map";
  }

  return "";
};

export const extractAddressSearchResult = (results) => {
  if (!Array.isArray(results) || !results.length) {
    return null;
  }

  const firstResult = results[0];

  return {
    latitude: Number.parseFloat(firstResult.lat),
    longitude: Number.parseFloat(firstResult.lon),
    displayName: firstResult.display_name,
  };
};

export const formatReportSubmitError = (error) => {
  let errorMessage = "Server error";

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") {
      errorMessage = data;
    } else if (data.message) {
      errorMessage = data.message;
    } else if (data.title) {
      errorMessage = data.title;
    }
  }

  return `❌ ${errorMessage}`;
};
