import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../../api/index.js';
import ServiceCard from '../../components/cards/ServiceCard.jsx';

const INITIAL_FILTERS = Object.freeze({
  category: '',
  location: '',
  sort: 'highestRated',
});

const sortOptions = [
  { value: 'highestRated', label: 'Highest Rated' },
  { value: 'lowestPrice', label: 'Lowest Price' },
  { value: 'highestPrice', label: 'Premium Services' },
  { value: 'newest', label: 'Newest' },
];

const ServiceExplorer = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).sort(),
    [services],
  );

  const locations = useMemo(
    () => Array.from(new Set(services.map((service) => service.location).filter(Boolean))).sort(),
    [services],
  );

  const fetchServices = useCallback(async ({ search, ...rest }) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...(search ? { search } : {}),
        ...(rest.category ? { category: rest.category } : {}),
        ...(rest.location ? { location: rest.location } : {}),
        ...(rest.sort ? { sort: rest.sort } : {}),
      };
      const { data } = await serviceApi.list(params);
      setServices(data.services);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load services right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices({ search: '', ...INITIAL_FILTERS });
  }, [fetchServices]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchServices({ search: query, ...filters });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, filters, fetchServices]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Book your next appointment</h2>
          <p>
            Discover available services, compare providers, and lock in the perfect time slot.
          </p>
        </div>
        <button
          type="button"
          className="primary-ghost"
          onClick={() => navigate('/customer/appointments')}
        >
          View upcoming appointments
        </button>
      </header>

      <section className="filters">
        <div className="filters__search">
          <input
            type="search"
            placeholder="Search for facial, massage, haircut…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filters__grid">
          <label>
            Category
            <select
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <select
              value={filters.location}
              onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
            >
              <option value="">All</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort
            <select
              value={filters.sort}
              onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <div className="service-grid">
        {loading && (
          <div className="page-state">
            <div className="spinner" />
            <p>Loading premium services for you…</p>
          </div>
        )}
        {!loading && services.length === 0 && (
          <div className="page-state">
            <div className="page-state__icon">🕵🏾‍♀️</div>
            <h3>No services found</h3>
            <p>Try adjusting filters or searching another keyword.</p>
          </div>
        )}
        {!loading &&
          services.map((service) => <ServiceCard key={service._id} service={service} />)}
      </div>
    </div>
  );
};

export default ServiceExplorer;

