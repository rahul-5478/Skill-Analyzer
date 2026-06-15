import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Radar, LogOut, History, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  if (location.pathname === '/') return <LandingNav isAuthenticated={isAuthenticated} navigate={navigate} />;

  return (
    <nav style={navStyle}>
      <div style={navInner}>
        <Link to="/dashboard" style={logoStyle}>
          <Radar size={22} color="#3b82f6" />
          <span>Skill<span className="grad-text">Scan</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={linkStyle(location.pathname === '/dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/history" style={linkStyle(location.pathname === '/history')}>
                <History size={16} /> History
              </Link>
              <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
              <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>Hi, {user?.name?.split(' ')[0]}</span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 14px' }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function LandingNav({ isAuthenticated, navigate }) {
  return (
    <nav style={navStyle}>
      <div style={navInner}>
        <Link to="/" style={logoStyle}>
          <Radar size={22} color="#3b82f6" />
          <span>Skill<span className="grad-text">Scan</span> AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {isAuthenticated ? (
            <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-accent">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)',
};

const navInner = {
  maxWidth: 1200, margin: '0 auto', padding: '14px 24px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const logoStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
  color: 'var(--text)', textDecoration: 'none',
};

const linkStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: 6,
  fontSize: 14, fontWeight: 500, textDecoration: 'none',
  color: active ? 'var(--primary)' : 'var(--text-dim)',
  padding: '6px 10px', borderRadius: 8,
  background: active ? 'var(--primary-glow)' : 'transparent',
});
