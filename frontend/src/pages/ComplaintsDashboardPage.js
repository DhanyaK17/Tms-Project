import React, { useEffect, useState, useContext } from "react";
import { complaintService, userService, FILE_BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./ComplaintsDashboardPage.css";

const ComplaintsDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignTarget, setAssignTarget] = useState({ complaintId: null, assignee: "" });
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const [compRes, statRes] = await Promise.all([
          complaintService.getAll(),
          complaintService.getStats()
        ]);
        setComplaints(compRes.data || []);
        setStats(statRes.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
      } catch (err) {
        setError("Network failure: Unable to retrieve global ticker.");
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      userService.getAll()
        .then((res) => setUsers(res.data || []))
        .catch((err) => console.error("Failed to fetch users", err));
    }
  }, [user]);

  const refresh = async () => {
    try {
      const [res, s] = await Promise.all([
        complaintService.getAll(),
        complaintService.getStats()
      ]);
      setComplaints(res.data || []);
      setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget.assignee) return;
    try {
      await complaintService.assign(assignTarget.complaintId, assignTarget.assignee);
      setAssignTarget({ complaintId: null, assignee: "" });
      refresh();
    } catch (err) {
      setError("Assignment rejected by server.");
    }
  };



  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "tag-pending";
      case "Assigned": return "tag-assigned";
      case "In-Progress": return "tag-progress";
      case "Onhold": return "tag-onhold";
      case "Completed": return "tag-completed";
      default: return "";
    }
  };

  if (listLoading) return <div className="loading">Accessing Global Repository...</div>;

  return (
    <div className="complaints-dashboard animated-bg">
      <div className="dashboard-rail">
        <header className="dashboard-hero">
          <h1>Global Oversight</h1>
          <p className="info-label">Centralized complaint management dashboard</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="admin-stats-grid">
          <div className="admin-stat-card" style={{ "--stat-color": "var(--primary)" }}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">System Load</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#FF7070" }}>
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Awaiting Triage</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#FFA6A6" }}>
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">In Field View</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#FFEDC7" }}>
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Resolved Units</span>
          </div>
        </section>

        {selectedComplaint && (
          <section className="complaint-details-glass">
            <div className="details-header">
              <h2>Ticket Inspection</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="close-details-btn"
              >✕</button>
            </div>

            <div className="details-info-grid">
              <div className="info-box">
                <span className="info-label">Location Control</span>
                <span className="info-content">
                  {selectedComplaint.blockName} • {selectedComplaint.roomNumber}
                </span>
              </div>
              <div className="info-box">
                <span className="info-label">Category</span>
                <span className="info-content">{selectedComplaint.complaintType}</span>
              </div>
              <div className="info-box">
                <span className="info-label">Current Status</span>
                <div>
                  <span className={`status-tag ${getStatusClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              <div className="info-box">
                <span className="info-label">Submission Date</span>
                <span className="info-content">
                  {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="info-box">
                <span className="info-label">Originator</span>
                <span className="info-content">
                  {selectedComplaint.createdBy?.username || "Anonymous"}
                </span>
              </div>
              <div className="info-box">
                <span className="info-label">Assigned Technician</span>
                <span className="info-content">
                  {selectedComplaint.assignedTo?.username || "Unassigned"}
                </span>
              </div>

              <div className="info-box" style={{ gridColumn: "1 / -1" }}>
                <span className="info-label">Service Remarks</span>
                <p className="info-content" style={{ fontWeight: 400, opacity: 0.8 }}>
                  {selectedComplaint.remarks || "No remarks provided."}
                </p>
              </div>

              {selectedComplaint.attachment && (
                <div className="info-box" style={{ gridColumn: "1 / -1" }}>
                  <span className="info-label">Evidentiary Attachment</span>
                  <a
                    href={`${FILE_BASE_URL}${selectedComplaint.attachment.startsWith('/') ? '' : '/'}${selectedComplaint.attachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="reset-filter-btn"
                    style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}
                  >
                    View Document ↗
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="admin-table-container">
          <div className="table-header-row">
            <h3>Live Ticker Output</h3>
            <button onClick={refresh} className="reset-filter-btn">Manual Sync ⟳</button>
          </div>

          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Designation</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Originator</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const isAssigned = c.assignedTo && String(c.assignedTo._id || c.assignedTo) === String(user?.id || user?._id);
                  return (
                    <tr key={c._id} onClick={() => viewComplaintDetails(c)} style={{ cursor: 'pointer' }}>
                      <td style={{ opacity: 0.7 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{c.blockName}</strong> • {c.roomNumber}
                      </td>
                      <td>{c.complaintType}</td>
                      <td>
                        <span className={`status-tag ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.createdBy?.username || "Anonymous"}</td>
                      <td>
                        <div className="action-btn-group">
                          {user?.role === "SuperAdmin" && !c.assignedTo && (
                            assignTarget.complaintId === c._id ? (
                              <div className="assign-mini-form" onClick={(e) => e.stopPropagation()}>
                                <select
                                  className="mini-select"
                                  value={assignTarget.assignee}
                                  onChange={(e) => setAssignTarget({ ...assignTarget, assignee: e.target.value })}
                                >
                                  <option value="">User</option>
                                  {users?.filter(u => u.role !== 'SuperAdmin').map(u => (
                                    <option key={u._id} value={u._id}>{u.username}</option>
                                  ))}
                                </select>
                                <button onClick={handleAssignSubmit} className="admin-action-btn btn-assign">✓</button>
                                <button onClick={() => setAssignTarget({ complaintId: null, assignee: "" })} className="admin-action-btn">✕</button>
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); setAssignTarget({ complaintId: c._id, assignee: "" }); }} className="admin-action-btn btn-assign">Assign</button>
                            )
                          )}

                          {(isAssigned || user?.role === "SuperAdmin") && c.status !== "Completed" && (
                            <>
                              {c.status !== "In-Progress" && (
                                <button onClick={(e) => { e.stopPropagation(); complaintService.updateStatus(c._id, "In-Progress").then(refresh); }} className="admin-action-btn" style={{ background: 'var(--primary)', color: '#000', marginRight: '0.4rem' }}>Work It</button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); complaintService.updateStatus(c._id, "Completed").then(refresh); }} className="admin-action-btn btn-done">Finish</button>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); viewComplaintDetails(c); }} className="admin-action-btn" style={{ background: 'rgba(255,255,255,0.1)' }}>Details</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintsDashboardPage;
