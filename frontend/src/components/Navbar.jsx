import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Coffee, LogOut, User as UserIcon, ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav} className="glass-panel">
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo} onClick={() => setIsOpen(false)}>
          <Coffee size={24} color="var(--accent-primary)" />
          <span className="gradient-text" style={styles.logoText}>Sip & Savor</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.desktopNav}>
          <Link to="/" style={isActive('/') ? styles.activeLink : styles.link}>Menu</Link>
          
          {user ? (
            <>
              <Link to="/orders" style={isActive('/orders') ? styles.activeLink : styles.link}>
                <ShoppingBag size={16} /> Orders
              </Link>
              <Link to="/profile" style={isActive('/profile') ? styles.activeLink : styles.link}>
                <UserIcon size={16} /> Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={isActive('/admin') ? styles.activeLink : styles.link}>
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={styles.logoutBtn}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={isActive('/login') ? styles.activeLink : styles.link}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={styles.signUpBtn}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button style={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div style={styles.mobileMenu} className="glass-panel">
          <Link to="/" style={isActive('/') ? styles.activeMobileLink : styles.mobileLink} onClick={() => setIsOpen(false)}>Menu</Link>
          {user ? (
            <>
              <Link to="/orders" style={isActive('/orders') ? styles.activeMobileLink : styles.mobileLink} onClick={() => setIsOpen(false)}>Orders</Link>
              <Link to="/profile" style={isActive('/profile') ? styles.activeMobileLink : styles.mobileLink} onClick={() => setIsOpen(false)}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={isActive('/admin') ? styles.activeMobileLink : styles.mobileLink} onClick={() => setIsOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={styles.mobileLogoutBtn}>
                <LogOut size={16} /> Logout ({user.username})
              </button>
            </>
          ) : (
            <div style={styles.mobileAuthGroup}>
              <Link to="/login" style={styles.mobileLink} onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={styles.mobileSignUpBtn} onClick={() => setIsOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0.75rem 1.5rem',
    borderRadius: '0px 0px var(--radius-md) var(--radius-md)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  desktopNav: {
    display: 'none',
    alignItems: 'center',
    gap: '1.5rem',
    // We override display in media queries or handle via responsiveness hooks
    '@media (min-width: 769px)': {
      display: 'flex',
    },
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'var(--transition-fast)',
  },
  activeLink: {
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  signUpBtn: {
    padding: '0.5rem 1.2rem',
    fontSize: '0.85rem',
  },
  mobileToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'block',
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderTop: 'var(--glass-border)',
    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
  },
  mobileLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.5rem 0',
  },
  activeMobileLink: {
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    padding: '0.5rem 0',
  },
  mobileLogoutBtn: {
    width: '100%',
    marginTop: '0.5rem',
  },
  mobileAuthGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mobileSignUpBtn: {
    width: '100%',
  },
};

// Add raw CSS to show/hide elements on responsive breakpoints
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @media (min-width: 769px) {
      nav div:nth-child(2) { display: flex !important; }
      nav button:nth-child(3) { display: none !important; }
    }
    @media (max-width: 768px) {
      nav div:nth-child(2) { display: none !important; }
      nav button:nth-child(3) { display: block !important; }
    }
  `;
  document.head.appendChild(styleTag);
}
