import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight } from 'lucide-react';

export default function DrinkCard({ drink }) {
  return (
    <div className="glass-panel drink-card" style={styles.card}>
      <div style={styles.imageContainer}>
        <div style={styles.imageBackground}>
          <Coffee size={36} color="var(--accent-primary)" />
        </div>
      </div>
      
      <div style={styles.body}>
        <div style={styles.header}>
          <h3 style={styles.title}>{drink.name}</h3>
          <span style={styles.price}>${parseFloat(drink.price).toFixed(2)}</span>
        </div>
        <p style={styles.description}>{drink.description}</p>
        
        <Link to={`/drinks/${drink.id}`} className="btn btn-secondary" style={styles.button}>
          Configure Order <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    transition: 'var(--transition-smooth)',
  },
  imageContainer: {
    height: '140px',
    background: 'linear-gradient(to bottom, hsla(250, 84%, 67%, 0.05), transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  imageBackground: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  price: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--accent-primary)',
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    marginTop: 'auto',
  },
};

// Add responsive hovers to document stylesheets if applicable
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    .drink-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-primary) !important;
      box-shadow: var(--shadow-lg) !important;
    }
  `;
  document.head.appendChild(styleTag);
}
