import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import DrinkCard from '../components/DrinkCard';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import { Coffee, Search } from 'lucide-react';

export default function Drinks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Show 9 per page for a nice 3x3 layout grid
  
  const [pagination, setPagination] = useState({
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDrinks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/drinks?page=${page}&limit=${limit}`);
      setDrinks(response.data.drinks);
      setPagination({
        totalPages: response.data.total_pages,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
      });
    } catch (err) {
      setError('Could not retrieve menu drinks. Please check if backend server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, [page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  // Client-side filtering on current page items for rich UX
  const filteredDrinks = drinks.filter((drink) =>
    drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drink.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Sip & <span className="gradient-text">Savor</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Discover our curated collection of artisan coffee, fine teas, and handcrafted signature drinks.
        </p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer} className="glass-panel">
        <Search size={18} color="var(--text-muted)" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Filter drinks on this page..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={fetchDrinks} />}

      {/* Loading Skeletons */}
      {loading && (
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel skeleton-card" style={styles.skeletonCard}>
              <div className="skeleton" style={styles.skeletonImage}></div>
              <div style={styles.skeletonBody}>
                <div style={styles.skeletonRow}>
                  <div className="skeleton" style={styles.skeletonTitle}></div>
                  <div className="skeleton" style={styles.skeletonPrice}></div>
                </div>
                <div className="skeleton" style={styles.skeletonText1}></div>
                <div className="skeleton" style={styles.skeletonText2}></div>
                <div className="skeleton" style={styles.skeletonButton}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loaded Content */}
      {!loading && !error && (
        <>
          {filteredDrinks.length === 0 ? (
            <div style={styles.emptyState} className="glass-panel">
              <Coffee size={48} color="var(--text-muted)" />
              <h3>No Drinks Found</h3>
              <p>Try resetting your search query or navigating to another page.</p>
              {searchQuery && (
                <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredDrinks.map((drink) => (
                <DrinkCard key={drink.id} drink={drink} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 1rem 2rem 1rem',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    letterSpacing: '-0.04em',
    marginBottom: '0.75rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.25rem',
    maxWidth: '500px',
    margin: '0 auto 2.5rem auto',
    gap: '0.75rem',
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
    gap: '1rem',
    maxWidth: '450px',
    margin: '0 auto',
  },
  skeletonCard: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '350px',
  },
  skeletonImage: {
    height: '140px',
    width: '100%',
  },
  skeletonBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.75rem',
  },
  skeletonRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    height: '20px',
    width: '60%',
  },
  skeletonPrice: {
    height: '20px',
    width: '20%',
  },
  skeletonText1: {
    height: '14px',
    width: '100%',
    marginTop: '0.5rem',
  },
  skeletonText2: {
    height: '14px',
    width: '80%',
  },
  skeletonButton: {
    height: '36px',
    width: '100%',
    marginTop: 'auto',
  },
};
