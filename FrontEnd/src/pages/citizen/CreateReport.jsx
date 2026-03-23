import React from "react";
import ReportMap from "../../components/citizen/ReportMap";
import WasteTypeSelector from "../../components/citizen/WasteTypeSelector";
import useCreateReportForm from "../../hooks/useCreateReportForm";
import "./CitizenReport.css";
const CreateReport = () => {
  const {
    fileInputRef,
    wasteTypes,
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
  } = useCreateReportForm();

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h2
          style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "28px" }}
        >
          📝 Create Waste Report
        </h2>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
          Take a photo &amp; select a location on the map
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}>
              📷 Upload Waste Photo
            </h3>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: "pointer",
                position: "relative",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                transition: "all 0.3s",
                marginBottom: "15px",
              }}
            >
              {previewUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    padding: "10px",
                  }}
                >
                  <img
                    src={previewUrl}
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      clearFile();
                    }}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                    📁 Drag &amp; drop an image here or click to select
                  </p>
                  <small style={{ color: "#666" }}>
                    Supported: PNG, JPG, JPEG (Max 10MB)
                  </small>
                </>
              )}

              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <WasteTypeSelector
              wasteTypes={wasteTypes}
              selectedWasteTypeIds={formData.wasteTypeIds}
              onChange={handleCheckboxChange}
            />

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Detailed Description
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Add detailed information about the waste (optional)..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <ReportMap
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchAddress={handleSearchAddress}
              isSearching={isSearching}
              markerPosition={markerPosition}
              onPickLocation={updateCoordinates}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onGetCurrentLocation={handleGetCurrentLocation}
              loadingLocation={loadingLocation}
            />
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "5px",
                marginBottom: "10px",
                borderLeft: "4px solid #ef4444",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderRadius: "5px",
                marginBottom: "10px",
                borderLeft: "4px solid #10b981",
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading ? "⏳ Submitting report..." : "✓ Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReport;
