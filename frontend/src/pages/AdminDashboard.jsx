import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Edit2, Trash2, Shield, X, HelpCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null); // Null for adding, Drink object for editing
  
  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchDrinks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/drinks?page=${page}&limit=10`);
      setDrinks(response.data.drinks);
      setPagination({
        totalPages: response.data.total_pages,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
      });
    } catch (err) {
      setError('Could not retrieve beverage records for administration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, [page]);

  const handleOpenAddModal = () => {
    setEditingDrink(null);
    setFormData({ name: '', description: '', price: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (drink) => {
    setEditingDrink(drink);
    setFormData({
      name: drink.name,
      description: drink.description,
      price: drink.price.toString(),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDrink(null);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form Submit Handler (Handles both Create and Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, description, price } = formData;

    // Client-side validations
    if (!name.trim() || !description.trim() || !price.trim()) {
      setFormError('All fields are required.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a valid number greater than 0.');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setSuccessMessage('');

    try {
      if (editingDrink) {
        // PATCH /drinks/<id>
        await API.patch(`/drinks/${editingDrink.id}`, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        });
        setSuccessMessage(`Beverage "${name}" updated successfully.`);
      } else {
        // POST /drinks
        await API.post('/drinks', {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        });
        setSuccessMessage(`Beverage "${name}" added to menu successfully.`);
      }
      
      handleCloseModal();
      fetchDrinks();
      
      // Auto-clear success message after 4s
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save beverage. Please check inputs.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteDrink = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      return;
    }

    setSuccessMessage('');
    try {
      // DELETE /drinks/<id>
      await API.delete(`/drinks/${id}`);
      setSuccessMessage(`Beverage "${name}" deleted from menu.`);
      
      // If we deleted the last item on the current page, go back a page
      if (drinks.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchDrinks();
      }
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete beverage.');
    }
  };

  if (loading && drinks.length === 0) return <Loader fullPage />;

  return (
    <div style={styles.container}>
      {/* Header Info */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Shield size={24} color="var(--accent-primary)" />
          <h1 style={styles.title}>Menu Administration</h1>
        </div>
        <p style={styles.subtitle}>Configure drinks prices, descriptions, and additions.</p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Control Actions Row */}
      <div style={styles.actionsRow}>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Beverage
        </button>
      </div>

      {drinks.length === 0 ? (
        <div style={styles.emptyState} className="glass-panel">
          <HelpCircle size={48} color="var(--text-muted)" />
          <h3>No Beverages on Menu</h3>
          <p>Click "Add Beverage" above to start populating the catalog.</p>
        </div>
      ) : (
        /* Management Table */
        <div className="glass-panel" style={styles.panel}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th} style={{ ...styles.th, width: '100px', textAlign: 'right' }}>Price</th>
                  <th style={styles.th} style={{ ...styles.th, width: '150px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drinks.map((drink) => (
                  <tr key={drink.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={styles.drinkName}>{drink.name}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.drinkDesc}>{drink.description}</span>
                    </td>
                    <td style={styles.td} style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: 'var(--accent-primary)' }}>
                      ${drink.price.toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          onClick={() => handleOpenEditModal(drink)}
                          style={styles.actionBtnEdit}
                          title="Edit Drink"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDrink(drink.id, drink.name)}
                          style={styles.actionBtnDelete}
                          title="Delete Drink"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                className="btn btn-secondary"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((prev) => prev - 1)}
                style={styles.pageBtn}
              >
                Prev
              </button>
              <span style={styles.pageText}>
                Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong>
              </span>
              <button
                className="btn btn-secondary"
                disabled={!pagination.hasNext}
                onClick={() => setPage((prev) => prev + 1)}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass-panel">
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingDrink ? 'Modify Beverage' : 'Add New Beverage'}</h2>
              <button style={styles.closeBtn} onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="formName">Beverage Name</label>
                <input
                  type="text"
                  id="formName"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Espresso Romano"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="formPrice">Unit Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="formPrice"
                  name="price"
                  className="form-input"
                  placeholder="e.g. 4.25"
                  value={formData.price}
                  onChange={handleFormChange}
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="formDesc">Product Description</label>
                <textarea
                  id="formDesc"
                  name="description"
                  className="form-input"
                  placeholder="Describe details like roast, ingredients, or size..."
                  value={formData.description}
                  onChange={handleFormChange}
                  disabled={formLoading}
                  style={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  style={styles.modalActionBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                  style={styles.modalActionBtn}
                >
                  {formLoading ? 'Saving...' : editingDrink ? 'Update Drink' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '1.5rem auto 3rem auto',
    width: '100%',
  },
  header: {
    marginBottom: '2rem',
  },
  headerTitleGroup: {
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
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1.5rem',
  },
  panel: {
    overflow: 'hidden',
  },
  emptyState: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
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
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '1rem 1.25rem',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
    color: 'var(--text-primary)',
  },
  drinkName: {
    fontWeight: '700',
  },
  drinkDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4',
  },
  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  actionBtnEdit: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    ':hover': {
      borderColor: 'var(--accent-primary)',
      color: 'var(--accent-primary)',
    },
  },
  actionBtnDelete: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--color-error)',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--color-error-bg)',
      borderColor: 'var(--color-error)',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    borderTop: '1px solid var(--border-color)',
  },
  pageBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  pageText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
    padding: '1rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem 1.75rem',
    position: 'relative',
    animation: 'slideUp 0.2s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    ':hover': {
      color: 'var(--text-primary)',
    },
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.75rem',
  },
  modalActionBtn: {
    flex: 1,
    justifyContent: 'center',
  },
};

// Add standard styles for admin overlays
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    .action-btn-edit-hover:hover {
      border-color: var(--accent-primary) !important;
      color: var(--accent-primary) !important;
      background-color: var(--hover-overlay) !important;
    }
    .action-btn-delete-hover:hover {
      border-color: var(--color-error) !important;
      background-color: var(--color-error-bg) !important;
    }
  `;
  document.head.appendChild(styleTag);
}
