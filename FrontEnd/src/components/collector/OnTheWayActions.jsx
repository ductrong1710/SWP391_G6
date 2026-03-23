import React, { useRef, useState } from "react";

const OnTheWayActions = ({ onArrived }) => {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const fileRef = useRef(null);

  const handleArrived = () => {
    const file = fileRef.current?.files?.[0] ?? beforePhoto;
    onArrived(file);
  };

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Arrival Confirmation</h3>
        <p className="text-gray">
          Upload the before photo and mark that you have arrived.
        </p>
      </div>

      <div className="collector-upload-box">
        <label className="collector-upload-label">
          <span className="collector-upload-title">📷 Photo before collection</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(event) => setBeforePhoto(event.target.files?.[0] ?? null)}
            className="collector-file-input"
          />
          <span className="collector-upload-hint">
            {beforePhoto
              ? `✓ ${beforePhoto.name}`
              : "Choose an image from your device"}
          </span>
        </label>
      </div>

      <button className="btn-start-trip" onClick={handleArrived}>
        📍 Mark Arrived
      </button>
    </div>
  );
};

export default OnTheWayActions;
