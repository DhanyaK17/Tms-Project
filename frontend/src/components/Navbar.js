import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-logo">T</div>
          <span className="brand-text">TMS</span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileOpen(true)}
        >
          <span className="hamburger-icon">☰</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <nav
        className={`navbar-container ${isExpanded || isMobileOpen ? "expanded" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
        onMouseEnter={() => { if (window.innerWidth > 768) setIsExpanded(true); }}
        onMouseLeave={() => { if (window.innerWidth > 768) setIsExpanded(false); }}
      >
        {/* Top: Brand */}
        <div className="brand-segment">
          <Link to="/dashboard" className="nav-brand">
            <div className="brand-logo">T</div>
            <span className="brand-text">TMS</span>
          </Link>
          <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>×</button>
        </div>

        {/* Middle: Navigation Links */}
        <div className="main-nav">
          {isAuthenticated ? (
            <div className="nav-rail">
              <Link to="/complaints/new" className={isActive("/complaints/new")}>
                <span className="icon">✏️</span>
                <span className="label">Raise Ticket</span>
              </Link>

              {user?.role !== "SuperAdmin" && (
                <>
                  <Link to="/my-complaints" className={isActive("/my-complaints")}>
                    <span className="icon">📋</span>
                    <span className="label">My Tickets</span>
                  </Link>
                  {user?.role !== "User" && (
                    <Link to="/complaints" className={isActive("/complaints")}>
                      <span className="icon">🔧</span>
                      <span className="label">Assigned Tickets</span>
                    </Link>
                  )}
                </>
              )}

              {user?.role === "SuperAdmin" && (
                <div className="admin-links">
                  <div className="admin-header">Administration</div>
                  <Link to="/departments" className={isActive("/departments")}>
                    <span className="icon">🏢</span>
                    <span className="label">Departments</span>
                  </Link>
                  <Link to="/programmes" className={isActive("/programmes")}>
                    <span className="icon">📚</span>
                    <span className="label">Programmes</span>
                  </Link>
                  <Link to="/blocks" className={isActive("/blocks")}>
                    <span className="icon">🏗️</span>
                    <span className="label">Blocks</span>
                  </Link>
                  <Link to="/rooms" className={isActive("/rooms")}>
                    <span className="icon">🚪</span>
                    <span className="label">Rooms</span>
                  </Link>
                  <Link to="/users" className={isActive("/users")}>
                    <span className="icon">👥</span>
                    <span className="label">Users</span>
                  </Link>
                  <Link to="/roles" className={isActive("/roles")}>
                    <span className="icon">🛡️</span>
                    <span className="label">Roles</span>
                  </Link>
                  <Link to="/complaints" className={isActive("/complaints")}>
                    <span className="icon">🗂️</span>
                    <span className="label">Tickets</span>
                  </Link>
                  <Link to="/reports" className={isActive("/reports")}>
                    <span className="icon">📊</span>
                    <span className="label">Reports</span>
                  </Link>
                </div>
              )}
            </div>

          ) : (
            <Link to="/login" className="nav-link login-only">
              <span className="icon">🔐</span>
              <span className="label">Login</span>
            </Link>
          )}
        </div>

        {/* Right Segment: Profile Pod */}
        {isAuthenticated && (
          <div className="profile-segment">
            <div className="profile-pod">
              <Link to="/profile" className="profile-link-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                <div className="avatar-wrapper">
                  <div className="user-avatar-blob">
                    {user?.username?.charAt(0).toUpperCase()}
                    <div className="status-indicator"></div>
                  </div>
                </div>
                <div className="user-meta">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="cyber-exit-btn"
                title="Logout"
              >
                <span className="exit-icon">⏻</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
