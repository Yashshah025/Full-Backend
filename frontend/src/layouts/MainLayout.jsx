import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} Sip & Savor Inc. Crafted for API and System Design learning.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    padding: '2rem 1.5rem',
    textAlign: 'center',
    borderTop: '1px solid var(--border-color)',
    marginTop: 'auto',
    backgroundColor: 'var(--bg-secondary)',
  },
  footerText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
};
