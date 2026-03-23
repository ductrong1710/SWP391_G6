import React from "react";

const WasteTypeSelector = ({ wasteTypes, selectedWasteTypeIds, onChange }) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "bold",
          color: "#1f2937",
        }}
      >
        Waste Types * (You can select multiple)
      </label>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#fafafa",
        }}
      >
        {wasteTypes?.length ? (
          wasteTypes.map((type) => (
            <label
              key={type.wasteTypeId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "14px",
                backgroundColor: "white",
                padding: "6px 12px",
                border: "1px solid #ddd",
                borderRadius: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <input
                type="checkbox"
                value={type.wasteTypeId}
                checked={selectedWasteTypeIds.includes(type.wasteTypeId)}
                onChange={onChange}
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
              />
              {type.name}
            </label>
          ))
        ) : (
          <span style={{ color: "#999" }}>Loading list...</span>
        )}
      </div>
    </div>
  );
};

export default WasteTypeSelector;
