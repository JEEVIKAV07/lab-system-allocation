import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Batches from './pages/Batches';
import Labs from './pages/Labs';
import Attendance from './pages/Attendance';
import Allocations from './pages/Allocations';

function Sidebar() {
  const navItems = [
    { to: '/', icon: '⬡', label: 'Dashboard' },
  ];
  const mgmt = [
    { to: '/labs', icon: '🔬', label: 'Labs' },
    { to: '/batches', icon: '⊞', label: 'Batches' },
    { to: '/students', icon: '◈', label: 'Students' },
  ];
  const ops = [
    { to: '/allocations', icon: '⟳', label: 'Allocations' },
    { to: '/attendance', icon: '✓', label: 'Attendance' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>LAB<br/>SYSTEM</h1>
        <span>v1.0 · LBAS</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map(i => (
            <NavLink key={i.to} to={i.to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">{i.icon}</span><span>{i.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          {mgmt.map(i => (
            <NavLink key={i.to} to={i.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">{i.icon}</span><span>{i.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">Operations</div>
          {ops.map(i => (
            <NavLink key={i.to} to={i.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="icon">{i.icon}</span><span>{i.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#111827', border: '1px solid #1e2d50', color: '#e2e8f0', fontFamily: 'Syne, sans-serif', fontSize: '13px' }
      }} />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/allocations" element={<Allocations />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
