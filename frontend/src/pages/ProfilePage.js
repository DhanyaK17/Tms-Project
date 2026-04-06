import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { complaintService } from "../services/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("general");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      complaintService.getStats()
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to fetch stats", err));
    }
  }, [user]);

  // General Tab State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password Tab State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifs: user?.preferences?.emailNotifs ?? true,
    smsNotifs: user?.preferences?.smsNotifs ?? false,
    darkMode: user?.preferences?.darkMode ?? true,
  });

  const [notifications, setNotifications] = useState({
    ticketUpdates: user?.notifications?.ticketUpdates ?? true,
    mentions: user?.notifications?.mentions ?? true,
    weeklyReports: user?.notifications?.weeklyReports ?? false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const handleGeneralChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handlePreferenceToggle = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    try {
      await updateProfile({ preferences: newPrefs });
      setSuccess("Preferences updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save preferences.");
    }
  };

  const handleNotificationToggle = async (key) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    try {
      await updateProfile({ notifications: newNotifs });
      setSuccess("Notification settings updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save notifications.");
    }
  };

  const handleGeneralSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError("New passwords do not match");
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    clearMessages();
    setIsEditing(false);
  };

  const renderGeneralTab = () => (
    <div className="tab-pane active fade-in">
      <div className="details-header-row">
        <h3 className="details-heading">Account Details</h3>
      </div>

      {isEditing ? (
        <form className="profile-edit-form" onSubmit={handleGeneralSave}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleGeneralChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleGeneralChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleGeneralChange}
              required
            />
          </div>

          {user.department && (
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input disabled"
                value={user.department.name || "N/A"}
                disabled
              />
            </div>
          )}

          {user.programme && (
            <div className="form-group">
              <label className="form-label">Programme</label>
              <input
                type="text"
                className="form-input disabled"
                value={user.programme.name || "N/A"}
                disabled
              />
            </div>
          )}

          <div className="profile-actions edit-mode-actions">
            <button type="button" className="cyber-cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="cyber-save-btn">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-icon">✉️</span>
              <div className="detail-info">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email || "Not Provided"}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📞</span>
              <div className="detail-info">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{user.phone || "Not Provided"}</span>
              </div>
            </div>

            {user.department && (
              <div className="detail-item">
                <span className="detail-icon">🏢</span>
                <div className="detail-info">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">
                    {user.department.name || "N/A"}
                  </span>
                </div>
              </div>
            )}

            {user.programme && (
              <div className="detail-item">
                <span className="detail-icon">📚</span>
                <div className="detail-info">
                  <span className="detail-label">Programme</span>
                  <span className="detail-value">
                    {user.programme.name || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {stats && (
            <>
              <h4 style={{ marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--prof-text-primary)', fontSize: '1.1rem' }}>Ticket Overview</h4>
              <div className="details-grid">
                <div className="detail-item" style={{ background: 'rgba(149, 83, 255, 0.15)', borderColor: 'rgba(149, 83, 255, 0.3)' }}>
                  <span className="detail-icon" style={{ background: 'transparent', border: 'none', fontSize: '2rem' }}>📋</span>
                  <div className="detail-info">
                    <span className="detail-label">Total Assigned</span>
                    <span className="detail-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--prof-accent)' }}>{stats.total}</span>
                  </div>
                </div>
                <div className="detail-item" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                  <span className="detail-icon" style={{ background: 'transparent', border: 'none', fontSize: '2rem' }}>⚙️</span>
                  <div className="detail-info">
                    <span className="detail-label">Working On</span>
                    <span className="detail-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{stats.inProgress || 0}</span>
                  </div>
                </div>
                <div className="detail-item" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <span className="detail-icon" style={{ background: 'transparent', border: 'none', fontSize: '2rem' }}>⏳</span>
                  <div className="detail-info">
                    <span className="detail-label">Pending / Onhold</span>
                    <span className="detail-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fca5a5' }}>{stats.pending}</span>
                  </div>
                </div>
                <div className="detail-item" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <span className="detail-icon" style={{ background: 'transparent', border: 'none', fontSize: '2rem' }}>✅</span>
                  <div className="detail-info">
                    <span className="detail-label">Resolved</span>
                    <span className="detail-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--prof-success)' }}>{stats.closed}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="profile-actions" style={{ marginTop: '2.5rem' }}>
            <button className="cyber-edit-btn" onClick={() => setIsEditing(true)}>
              <span className="edit-icon">✏️</span> Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="tab-pane active fade-in">
      <div className="details-header-row">
        <h3 className="details-heading">Security & Password</h3>
      </div>
      <form className="profile-edit-form" onSubmit={handlePasswordSave}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            className="form-input"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="form-input"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div className="profile-actions align-start mt-4">
          <button type="submit" className="cyber-save-btn">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="tab-pane active fade-in">
      <div className="details-header-row">
        <h3 className="details-heading">App Preferences</h3>
      </div>

      <div className="preferences-list">
        <div className="preference-item">
          <div className="pref-info">
            <h4>Email Notifications</h4>
            <p>Receive ticket updates and system alerts directly via email.</p>
          </div>
          <label className="cyber-switch">
            <input
              type="checkbox"
              checked={preferences.emailNotifs}
              onChange={() => handlePreferenceToggle('emailNotifs')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="pref-info">
            <h4>SMS Alerts</h4>
            <p>Get instant text messages for critical priorities.</p>
          </div>
          <label className="cyber-switch">
            <input
              type="checkbox"
              checked={preferences.smsNotifs}
              onChange={() => handlePreferenceToggle('smsNotifs')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="pref-info">
            <h4>Dark Mode Appearance</h4>
            <p>Use a dark aesthetic across the TMS application.</p>
          </div>
          <label className="cyber-switch">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={() => handlePreferenceToggle('darkMode')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-pane active fade-in">
      <div className="details-header-row">
        <h3 className="details-heading">Notification Preferences</h3>
      </div>
      <div className="preferences-list">
        <div className="preference-item">
          <div className="pref-info">
            <h4>Ticket Updates</h4>
            <p>Get notified when a ticket assigned to you is updated.</p>
          </div>
          <label className="cyber-switch">
            <input type="checkbox" checked={notifications.ticketUpdates} onChange={() => handleNotificationToggle('ticketUpdates')} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="preference-item">
          <div className="pref-info">
            <h4>Mentions & Comments</h4>
            <p>Receive an alert when someone mentions you in a thread.</p>
          </div>
          <label className="cyber-switch">
            <input type="checkbox" checked={notifications.mentions} onChange={() => handleNotificationToggle('mentions')} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="preference-item">
          <div className="pref-info">
            <h4>Weekly Reports</h4>
            <p>Receive a summary of your performance and resolved tickets.</p>
          </div>
          <label className="cyber-switch">
            <input type="checkbox" checked={notifications.weeklyReports} onChange={() => handleNotificationToggle('weeklyReports')} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );


  return (
    <div className="profile-page-container">
      <div className="profile-header-mesh"></div>
      <div className="profile-content-wrapper">
        <div className="profile-glass-card advanced-layout">

          <div className="profile-sidebar">
            <div className="profile-avatar-section mini">
              <div className="avatar-ring">
                <div className="avatar-circle">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <h2 className="profile-name">{user.username || "User"}</h2>
              <div className="profile-role-badge">{user.role || "Role"}</div>
            </div>

            <nav className="profile-nav-tabs">
              <button
                className={`profile-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => switchTab('general')}
              >
                <span className="tab-icon">👤</span> General
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => switchTab('security')}
              >
                <span className="tab-icon">🔒</span> Security
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => switchTab('preferences')}
              >
                <span className="tab-icon">⚙️</span> Preferences
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => switchTab('notifications')}
              >
                <span className="tab-icon">🔔</span> Notifications
              </button>
            </nav>
          </div>

          <div className="profile-main-area">
            {error && <div className="profile-alert profile-alert-error">{error}</div>}
            {success && <div className="profile-alert profile-alert-success">{success}</div>}

            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
