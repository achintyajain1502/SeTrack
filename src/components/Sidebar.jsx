import React from 'react';
import { NAV, USERS } from '../data';

export default function Sidebar({ role, user: signedInUser, currentPage, onNavigate, onLogout }) {
  const user = signedInUser || USERS[role];
  const navItems = NAV[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div>
          <div className="logo-text">⬡ SeTrack</div>
          <div className="logo-sub">Goal Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item${currentPage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill" onClick={onLogout} title="Logout">
          <div
            className="user-avatar"
            style={{ background: user.color + '33', color: user.color }}
          >
            {user.initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>↩</div>
        </div>
      </div>
    </aside>
  );
}
