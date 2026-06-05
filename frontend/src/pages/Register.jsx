import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { UserPlus, KeyRound, User as UserIcon, Shield } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.register(username, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <UserPlus size={28} color="var(--accent-primary)" />
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Sign up to browse drinks, configure orders, and track history.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <span style={styles.labelSpan}>
                <UserIcon size={14} /> Username
              </span>
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <span style={styles.labelSpan}>
                <KeyRound size={14} /> Password
              </span>
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              <span style={styles.labelSpan}>
                <KeyRound size={14} /> Confirm Password
              </span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>


          <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading || success}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerLink}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem 2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    boxShadow: 'var(--shadow-sm)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  labelSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  roleGroup: {
    display: 'flex',
    gap: '1rem',
  },
  roleBtn: {
    flex: 1,
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    justifyContent: 'center',
  },
  roleHelp: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
    justifyContent: 'center',
  },
  footerLink: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    fontWeight: '700',
  },
};
