import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  FileText
} from 'lucide-react';
import { logoutUser } from '../../services/api';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Applications', path: '/admin/applications', icon: <FileText size={20} /> },
    { name: 'Brochures', path: '/admin/brochures', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">🛡️</div>
          <h2 className="logo-text">EduAdmin</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/') ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {/* Logout moved to Header Profile Dropdown */}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <Menu size={24} /> : <Menu size={24} />}
          </button>

          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search anything..." />
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            <div className="user-profile" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <div className="avatar">AD</div>
              <span>Admin User</span>
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <h4>Admin User</h4>
                  <span>Super Administrator</span>
                </div>
                <Link to="/admin/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <Settings size={16} />
                  Settings
                </Link>
                <button onClick={handleLogout} className="dropdown-item danger">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
