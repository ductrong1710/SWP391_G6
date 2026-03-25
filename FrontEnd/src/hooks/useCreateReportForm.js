import { useEffect, useRef, useState } from "react";
import locationService from "../services/locationService";
import wasteReportService from "../services/wasteReportService";
import {
  buildReportPayload,
  DEFAULT_REPORT_FORM,
  extractAddressSearchResult,
  formatReportSubmitError,
  toggleWasteTypeId,
  validateReportForm,
  validateReportImage,
} from "../utils/reportForm";

const useCreateReportForm = () => {
  const fileInputRef = useRef(null);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_REPORT_FORM);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const data = await wasteReportService.getWasteTypes();
        setWasteTypes(data);
      } catch (fetchError) {
        console.error("Error fetching waste types:", fetchError);
        setError("❌ Unable to load waste type list");
      }
    };

    fetchWasteTypes();
  }, []);

  const updateCoordinates = (latitude, longitude) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    setMarkerPosition({ lat: latitude, lng: longitude });
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      setError("❌ Please enter an address to search");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const results = await locationService.searchAddress(searchQuery);
      const result = extractAddressSearchResult(results);

      if (!result) {
        setError("❌ Address not found. Please try again.");
        return;
      }

      updateCoordinates(result.latitude, result.longitude);
      setSuccess(`✅ Found: ${result.displayName}`);
      window.setTimeout(() => setSuccess(""), 3000);
    } catch (searchError) {
      console.error("Error searching address:", searchError);
      setError("❌ Error searching for address.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    const validation = validateReportImage(file);

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSelectedFile(file);
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("❌ Your browser does not support GPS");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCoordinates(position.coords.latitude, position.coords.longitude);
        setSuccess("✅ Current location obtained");
        window.setTimeout(() => setSuccess(""), 3000);
        setLoadingLocation(false);
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        setError("❌ Unable to get location. Check GPS permissions.");
        setLoadingLocation(false);
      }
    );
  };

  const handleCheckboxChange = (event) => {
    const wasteTypeId = Number.parseInt(event.target.value, 10);

    setFormData((prev) => ({
      ...prev,
      wasteTypeIds: toggleWasteTypeId(
        prev.wasteTypeIds,
        wasteTypeId,
        event.target.checked
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateReportForm({ selectedFile, formData });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
     const payload = buildReportPayload({ selectedFile, formData });
console.log("Submitting payload from hook:", {
  latitude: formData.latitude,
  longitude: formData.longitude,
  description: formData.description,
  wasteTypeIds: formData.wasteTypeIds,
  fileName: selectedFile?.name,
});
await wasteReportService.createReport(payload);


      setSuccess("✅ Report submitted successfully! Redirecting to home...");

      window.setTimeout(() => {
        clearFile();
        setFormData(DEFAULT_REPORT_FORM);
        setMarkerPosition(null);
        setSearchQuery("");
        window.location.href = "/citizen/home";
      }, 2000);
    } catch (submitError) {
  console.error("❌ Error submitting report:", submitError);
  console.error("❌ Backend response status:", submitError?.response?.status);
  console.error("❌ Backend response data:", submitError?.response?.data);
  console.error("❌ Backend response message:", submitError?.response?.data?.message);
  setError(formatReportSubmitError(submitError));
} finally {

      setLoading(false);
    }
  };

  return {
    fileInputRef,
    wasteTypes,
    selectedFile,
    previewUrl,
    formData,
    setFormData,
    markerPosition,
    searchQuery,
    setSearchQuery,
    isSearching,
    loading,
    error,
    success,
    loadingLocation,
    updateCoordinates,
    handleSearchAddress,
    handleFileChange,
    handleDrop,
    handleGetCurrentLocation,
    handleCheckboxChange,
    handleSubmit,
    clearFile,
  };
};

export default useCreateReportForm;
