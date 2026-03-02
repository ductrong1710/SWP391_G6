import React, { useState, useEffect, useRef } from 'react';
import assignmentService from '../../services/assignmentService';

const ActiveJob = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);

  const fetchMyAssignments = async () => {
    // Skip nếu fetch vừa xong trong 1 giây
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      const data = await assignmentService.getMyAssignments();
      
      console.log("Assignments from API:", data);
      
      if (mountedRef.current) {
        // Lọc chỉ những assignments có status Assigned (chưa start)
        const assignedJobs = Array.isArray(data) 
          ? data.filter(a => a.status === 'Assigned' || a.status === 'Pending')
          : [];

        setJobs(assignedJobs);
        setError('');

        // Auto-select first job nếu chưa có job nào được chọn
        if (assignedJobs.length > 0) {
          if (!selectedJobId) {
            setSelectedJobId(assignedJobs[0].assignmentId);
            setJob(assignedJobs[0]);
          } else {
            // Keep previously selected job nếu nó vẫn tồn tại
            const existing = assignedJobs.find(j => j.assignmentId === selectedJobId);
            if (existing) {
              setJob(existing);
            } else {
              setSelectedJobId(assignedJobs[0].assignmentId);
              setJob(assignedJobs[0]);
            }
          }
        } else {
          setJob(null);
          setSelectedJobId(null);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetch assignments error:", error);
      if (mountedRef.current) {
        setJobs([]);
        setJob(null);
        setError(error.response?.data?.message || 'Không thể tải danh sách công việc');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMyAssignments();
    
    // Auto-refresh mỗi 10 giây để check job mới
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

  const handleStart = async () => {
    if (!job) return;

    try {
      setActionLoading(true);
      setError('');

      await assignmentService.startCollection(job.assignmentId);

      console.log("Collection started successfully");
      
      // Refresh assignments after starting
      if (mountedRef.current) {
        await fetchMyAssignments();
      }

    } catch (error) {
      console.error("Start error:", error);
      setError(error.response?.data?.message || "Không thể bắt đầu công việc. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectJob = (selectedJob) => {
    setSelectedJobId(selectedJob.assignmentId);
    setJob(selectedJob);
  };

  const handleDeclineJob = async () => {
    if (!job) return;

    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (!reason) return;

    try {
      setActionLoading(true);
      setError('');

      await assignmentService.declineAssignment(job.assignmentId, reason);
      
      console.log("Job declined successfully");
      await fetchMyAssignments();

    } catch (error) {
      console.error("Decline error:", error);
      setError(error.response?.data?.message || "Không thể từ chối công việc. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="col-active-job">
        <div className="loading-container">
          <h3>⏳ Đang tải công việc...</h3>
        </div>
      </div>
    );
  }

  if (!job && jobs.length === 0) {
    return (
      <div className="col-active-job">
        <div className="empty-state">
          <p className="empty-icon">🎉</p>
          <p className="empty-title">Không có công việc mới</p>
          <p className="text-gray">Hãy chờ enterprise phân công công việc cho bạn</p>
          <p className="text-sm text-gray">Tự động kiểm tra mỗi 10 giây...</p>
        </div>
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
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Danh sách các job pending */}
      {jobs.length > 1 && (
        <div className="jobs-list-container">
          <div className="jobs-list-header">
            <h3>📋 Pending Jobs ({jobs.length})</h3>
          </div>
          <div className="jobs-list">
            {jobs.map((assignedJob) => (
              <div
                key={assignedJob.assignmentId}
                className={`job-list-item ${selectedJobId === assignedJob.assignmentId ? 'selected' : ''}`}
                onClick={() => handleSelectJob(assignedJob)}
              >
                <div className="job-item-type">📦 {assignedJob.wasteTypeName || 'Unknown'}</div>
                <div className="job-item-address">📍 {assignedJob.description || assignedJob.address || 'No address'}</div>
                <span className="job-item-status">{assignedJob.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Card */}
      {job && (
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
              <div className="val">{job.estimatedWeight || 'N/A'} kg</div>
            </div>
            <div className="stat-box">
              <div className="label">Location Lat</div>
              <div className="val">{job.latitude ? job.latitude.toFixed(4) : 'N/A'}</div>
            </div>
            <div className="stat-box">
              <div className="label">Location Lon</div>
              <div className="val">{job.longitude ? job.longitude.toFixed(4) : 'N/A'}</div>
            </div>
          </div>

          <div className="note-box">
            <div className="note-title">📄 Customer Note</div>
            <div className="note-content">{job.note || job.description || 'No additional notes'}</div>
          </div>

          <button 
            className="btn-outline-map"
            onClick={() => {
              if (job.latitude && job.longitude) {
                window.open(
                  `https://maps.google.com/?q=${job.latitude},${job.longitude}`,
                  '_blank'
                );
              }
            }}
          >
            🗺️ Open in Maps
          </button>
        </div>
      )}

      {/* Bottom Action Button */}
      <div className="bottom-action-bar">
        <button 
          className="btn-start-trip" 
          onClick={handleStart}
          disabled={actionLoading || !job}
        >
          {actionLoading ? '⏳ Starting...' : '🚀 Start Trip'}
        </button>
        <button 
          className="btn-decline-trip"
          onClick={handleDeclineJob}
          disabled={actionLoading || !job}
        >
          {actionLoading ? '⏳ Processing...' : '✖️ Decline'}
        </button>
      </div>
    </div>
  );
};

export default ActiveJob;