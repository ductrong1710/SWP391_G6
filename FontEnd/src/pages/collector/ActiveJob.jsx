import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchMyAssignments();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchMyAssignments();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyAssignments = async () => {
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5021/api/assignments/my-assignments',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (mountedRef.current) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setJob(response.data[0]);
        } else {
          setJob(null);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch assignments error:', err);
      if (mountedRef.current) {
        setJob(null);
        setLoading(false);
        setError('Không thể tải nhiệm vụ.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleStart = async () => {
    if (!job || !job.assignmentId) {
      alert('No assignment to start.');
      return;
    }
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:5021/api/collections/${job.assignmentId}/start`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      // Refresh assignments after starting
      if (mountedRef.current) {
        fetchMyAssignments();
      }
    } catch (err) {
      console.error('Start error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to start trip');
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
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')} className="alert-close">✕</button>
          </div>
        )}
        <h3>No active job assigned</h3>
      </div>
    );
  }

  return (
    <div className="col-active-job fade-in">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}

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
            <span className="slider round" />
          </label>
        </div>
      </div>

      {/* Job Card */}
      <div className="job-card">
        <div className="job-header">
          <h3>Job #{job.assignmentId}</h3>
          <span className="badge-assigned">{job.status || 'Unknown'}</span>
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
            <div className="val">{job.estimatedWeight ?? 'N/A'} kg</div>
          </div>
          <div className="stat-box">
            <div className="label">Distance</div>
            <div className="val">{job.distance ?? 'N/A'}</div>
          </div>
          <div className="stat-box">
            <div className="label">ETA</div>
            <div className="val">{job.eta ?? 'N/A'}</div>
          </div>
        </div>

        <div className="note-box">
          <div className="note-title">📄 Customer Note</div>
          <div className="note-content">{job.note ?? 'No notes'}</div>
        </div>

        {/* Bottom Action Button */}
        <div className="bottom-action-bar">
          <button className="btn-start-trip" onClick={handleStart}>
            Start Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveJob;