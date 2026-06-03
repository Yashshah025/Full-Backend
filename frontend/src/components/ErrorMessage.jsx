import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={styles.container} className="glass-panel">
      <AlertTriangle size={36} color="var(--color-error)" />
      <h3 style={styles.title}>Error Encountered</h3>
      <p style={styles.message}>{message || 'We could not complete your request. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary" style={styles.button}>
          Try Again
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '420px',
    margin: '3rem auto',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '0.5rem',
  },
  message: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  button: {
    marginTop: '0.75rem',
    width: '100%',
  },
};
