import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Coffee, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function DrinkDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [drink, setDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Order Configuration State
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const fetchDrinkDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/drinks/${id}`);
      setDrink(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('The selected drink does not exist on our menu.');
      } else {
        setError('Failed to retrieve drink details. Server may be offline.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinkDetails();
  }, [id]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBuying(true);
    setBuyError('');
    setBuySuccess(false);

    try {
      // POST /buy/<drink_id>
      const response = await API.post(`/buy/${id}`, { quantity });
      setPlacedOrder(response.data);
      setBuySuccess(true);
      setQuantity(1); // Reset counter
    } catch (err) {
      setBuyError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDrinkDetails} />;
  if (!drink) return <ErrorMessage message="Drink details not found." />;

  const totalPrice = drink.price * quantity;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        <ArrowLeft size={16} /> Back to Menu
      </Link>

      <div style={styles.grid}>
        {/* Visual Element */}
        <div style={styles.visualContainer} className="glass-panel">
          <div style={styles.visualRing}>
            <Coffee size={80} color="var(--accent-primary)" />
          </div>
        </div>

        {/* Configuration Panel */}
        <div style={styles.configContainer} className="glass-panel">
          <span style={styles.tag}>Beverage Details</span>
          <h1 style={styles.name}>{drink.name}</h1>
          <p style={styles.price}>${drink.price.toFixed(2)} <span style={styles.unit}>per cup</span></p>
          <p style={styles.description}>{drink.description}</p>

          <hr style={styles.divider} />

          {buySuccess && placedOrder && (
            <div className="alert alert-success" style={styles.successAlert}>
              <CheckCircle2 size={18} />
              <div>
                <strong>Order Confirmed!</strong> Placed order for {placedOrder.quantity}x {placedOrder.drink} (Total: ${placedOrder.total.toFixed(2)}).
                <div style={styles.successLinks}>
                  <Link to="/orders" style={styles.alertLink}>View Order History</Link>
                </div>
              </div>
            </div>
          )}

          {buyError && <div className="alert alert-error">{buyError}</div>}

          {user ? (
            <div style={styles.orderSection}>
              {/* Quantity Counter */}
              <div style={styles.counterRow}>
                <span style={styles.counterLabel}>Quantity:</span>
                <div style={styles.counter}>
                  <button onClick={handleDecrement} style={styles.counterBtn} disabled={buying}>
                    <Minus size={16} />
                  </button>
                  <span style={styles.counterValue}>{quantity}</span>
                  <button onClick={handleIncrement} style={styles.counterBtn} disabled={buying}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div style={styles.totalRow}>
                <span>Subtotal:</span>
                <span style={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePurchase}
                className="btn btn-primary"
                style={styles.purchaseBtn}
                disabled={buying}
              >
                <ShoppingBag size={18} />
                {buying ? 'Processing Payment...' : 'Confirm Purchase'}
              </button>
            </div>
          ) : (
            <div style={styles.loginPrompt} className="glass-panel">
              <p>You need to be logged in to configure and place orders.</p>
              <Link to="/login" className="btn btn-primary" style={styles.loginBtn}>
                Sign In to Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '1.5rem auto 3rem auto',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    transition: 'var(--transition-fast)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2.5rem',
  },
  visualContainer: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, hsla(250, 84%, 67%, 0.05), hsla(270, 80%, 60%, 0.05))',
  },
  visualRing: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  configContainer: {
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  tag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
  },
  name: {
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '1.25rem',
  },
  unit: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  description: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
  },
  orderSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  counterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  counter: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.25rem',
  },
  counterBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--border-color)',
    },
  },
  counterValue: {
    width: '40px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '1rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
  },
  totalPrice: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--accent-primary)',
  },
  purchaseBtn: {
    width: '100%',
    padding: '0.9rem',
    fontSize: '0.95rem',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  loginPrompt: {
    padding: '1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  loginBtn: {
    width: '100%',
    justifyContent: 'center',
  },
  successAlert: {
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  successLinks: {
    marginTop: '0.5rem',
  },
  alertLink: {
    color: 'inherit',
    fontWeight: '700',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
};
