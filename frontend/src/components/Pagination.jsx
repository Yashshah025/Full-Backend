import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, hasPrev, hasNext, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="btn btn-secondary"
        style={styles.button}
      >
        <ChevronLeft size={18} />
        <span>Prev</span>
      </button>
      
      <span style={styles.text}>
        Page <strong style={styles.bold}>{page}</strong> of <strong style={styles.bold}>{totalPages}</strong>
      </span>
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="btn btn-secondary"
        style={styles.button}
      >
        <span>Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '2.5rem',
    width: '100%',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  text: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  bold: {
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
};
