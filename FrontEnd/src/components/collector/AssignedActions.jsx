import React, { useState } from "react";

const AssignedActions = ({ onStart, onDecline }) => {
  const [declineReason, setDeclineReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  return (
    <div className="settings-card action-card fade-in">
      <div className="card-header-simple">
        <h3>Next Action</h3>
        <p className="text-gray">
          Start the trip or decline this assignment with a reason.
        </p>
      </div>

      {showDecline ? (
        <>
          <div className="form-group">
            <label>Decline Reason</label>
            <textarea
              className="form-input"
              placeholder="Enter decline reason..."
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              rows={4}
            />
          </div>

          <div className="collector-action-grid">
            <button
              className="btn-danger-soft"
              onClick={() => onDecline(declineReason)}
            >
              Confirm Decline
            </button>
            <button
              className="btn-outline-map"
              onClick={() => setShowDecline(false)}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="collector-action-grid">
          <button className="btn-start-trip" onClick={onStart}>
            🚗 Start Trip
          </button>
          <button
            className="btn-danger-soft"
            onClick={() => setShowDecline(true)}
          >
            ✕ Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignedActions;
