import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Hash, ReceiptText } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/orders');
      setOrders(response.data.orders);
    } catch (err) {
      setError('Could not retrieve your orders. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loader fullPage />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <ShoppingBag size={24} color="var(--accent-primary)" />
          <h1 style={styles.title}>Your Order History</h1>
        </div>
        <p style={styles.subtitle}>Review your past orders and configured beverages.</p>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div style={styles.emptyState} className="glass-panel">
          <div style={styles.emptyIconContainer}>
            <ShoppingBag size={32} color="var(--text-muted)" />
          </div>
          <h3 style={styles.emptyTitle}>No Orders Placed</h3>
          <p style={styles.emptySubtitle}>
            Your order queue is currently empty. Head over to our beverage menu to place your first order!
          </p>
          <Link to="/" className="btn btn-primary" style={styles.exploreBtn}>
            Explore Menu
          </Link>
        </div>
      ) : (
        /* Order List Panel */
        <div className="glass-panel" style={styles.panel}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}><span style={styles.thContent}><Hash size={13} /> Order ID</span></th>
                  <th style={styles.th}>Beverage Name</th>
                  <th style={styles.th} style={{ ...styles.th, textAlign: 'center' }}>Quantity</th>
                  <th style={styles.th} style={{ ...styles.th, textAlign: 'right' }}><span style={styles.thContentRight}><ReceiptText size={13} /> Total Amount</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.orderIdBadge}>#{order.order_id}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={styles.drinkName}>{order.drink}</strong>
                    </td>
                    <td style={styles.td} style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.quantityBadge}>{order.quantity}</span>
                    </td>
                    <td style={styles.td} style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={styles.totalPrice}>${parseFloat(order.total).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '1.5rem auto 3rem auto',
    width: '100%',
  },
  header: {
    marginBottom: '2rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  emptyState: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '460px',
    margin: '3rem auto',
  },
  emptyIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  emptySubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  exploreBtn: {
    marginTop: '0.5rem',
    padding: '0.65rem 1.5rem',
    fontSize: '0.9rem',
  },
  panel: {
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
    background: 'linear-gradient(to right, hsla(250, 84%, 67%, 0.02), transparent)',
  },
  th: {
    padding: '1rem 1.25rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  thContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  thContentRight: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    justifyContent: 'flex-end',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--hover-overlay)',
    },
  },
  td: {
    padding: '1.1rem 1.25rem',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  orderIdBadge: {
    fontFamily: 'monospace',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  drinkName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  quantityBadge: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
  totalPrice: {
    fontWeight: '700',
    fontSize: '0.95rem',
    color: 'var(--accent-primary)',
  },
};

// Injection of table row hover behaviors
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    table tbody tr:hover {
      background-color: var(--hover-overlay) !important;
    }
  `;
  document.head.appendChild(styleTag);
}
