import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchMyAssignments();
    
    // Auto-refresh mỗi 10 giây (thay vì 5s) để giảm tải server
    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchMyAssignments();
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
  }, []);

  const fetchMyAssignments = async () => {
    // Skip nếu fetch vừa xong trong 1 giây
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5021/api/assignments/my-assignments",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log("Assignments:", response.data);
      
      if (mountedRef.current) {
        if (response.data && response.data.length > 0) {
          setJob(response.data[0]);
        } else {
          setJob(null);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetch assignments error:", error);
      if (mountedRef.current) {
        setJob(null);
        setLoading(false);
      }
    }
  };

  const handleStart = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5021/api/collections/${job.assignmentId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Start response:", response.data);
      
      // Refresh assignments after starting
      if (mountedRef.current) {
        fetchMyAssignments();
      }

    } catch (error) {
      console.error("Start error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to start trip");
    }
  };

  if (loading) {
    return (
      <div className="col-active-job">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="col-active-job">
        <h3>No active job assigned</h3>
      </div>
    );
  }

  return (
    <div className="col-active-job fade-in">
      {/* Page Header with Toggle */}
      <div className="col-page-header">
        <div>
          <h2>Active Job</h2>
          <p className="text-gray">Current collection assignment</p>
        </div>
        <div className="status-toggle">
          <span className={`status-label ${isOnline ? 'text-green' : 'text-gray'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <label className="switch">
            <input type="checkbox" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Job Card */}
      <div className="job-card">
        <div className="job-header">
          <h3>Job #{job.assignmentId}</h3>
          <span className="badge-assigned">{job.status}</span>
        </div>

        <div className="customer-info">
          <div className="info-row">
            <span className="icon-marker">📍</span>
            <div>
              <strong>{job.citizenName || 'Unknown'}</strong>
              <div className="text-gray text-sm">{job.description || job.address || 'No address'}</div>
            </div>
          </div>
          {job.citizenPhone && (
            <div className="info-row mt-2">
              <span className="icon-phone">📞</span>
              <div className="text-green font-bold">{job.citizenPhone}</div>
            </div>
          )}
        </div>

        <div className="job-stats-grid">
          <div className="stat-box">
            <div className="label">Waste Type</div>
            <div className="val">{job.wasteTypeName || 'Unknown'}</div>
          </div>
          <div className="stat-box">
            <div className="label">Est. Weight</div>
            <div className="val">{job.estimatedWeight} kg</div>
          </div>
          <div className="stat-box">
            <div className="label">Distance</div>
            <div className="val">2.3 km</div>
          </div>
          <div className="stat-box">
            <div className="label">ETA</div>
            <div className="val">8 mins</div>
          </div>
        </div>

        <div className="note-box">
          <div className="note-title">📄 Customer Note</div>
          <div className="note-content">{job.note}</div>
        </div>

        <button className="btn-outline-map">🚀 Open in Maps</button>
      </div>

      {/* Bottom Action Button */}
      <div className="bottom-action-bar">
        <button className="btn-start-trip" onClick={handleStart}>
          Start Trip
        </button>
      </div>
    </div>
  );
};

export default ActiveJob;