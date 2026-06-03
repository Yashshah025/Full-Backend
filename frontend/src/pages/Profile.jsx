import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, Contact, Clock } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Your Account Profile</h1>
        <p style={styles.subtitle}>Manage your session settings and view credentials claims.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel" style={styles.card}>
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>
            <User size={36} color="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={styles.username}>{user.username}</h2>
            <span style={user.role === 'admin' ? styles.adminBadge : styles.customerBadge}>
              {user.role === 'admin' ? <Shield size={12} /> : <Contact size={12} />}
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Username Claim</span>
            <p style={styles.infoValue}>{user.username}</p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>System Role</span>
            <p style={styles.infoValue}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Authentication Mechanism</span>
            <p style={styles.infoValue}>JWT Token (Stateless Claims)</p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Token Lifetimes</span>
            <p style={styles.infoValue}>Access: 15m | Refresh: 7d (Rotated)</p>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.alertPanel}>
          <Clock size={16} color="var(--accent-primary)" />
          <span style={styles.alertText}>
            Your security tokens automatically refresh in the background when making requests.
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '650px',
    margin: '1.5rem auto 3rem auto',
    width: '100%',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  card: {
    padding: '2.5rem 2rem',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  username: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'hsla(250, 84%, 67%, 0.15)',
    border: '1px solid var(--accent-primary)',
    color: 'hsl(250, 84%, 75%)',
  },
  customerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    margin: '1.5rem 0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoValue: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  alertPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(to right, hsla(250, 84%, 67%, 0.05), transparent)',
    border: '1px solid var(--border-color)',
  },
  alertText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
};
