import { useEffect, useState } from 'react';
import { providerApi } from '../../api/index.js';

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await providerApi.pendingRequests();
      setRequests(data.requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (id, action) => {
    setActionLoading(id);
    try {
      await providerApi.updateRequest(id, { action });
      setRequests((prev) => prev.filter((request) => request._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update request.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Fetching booking requests…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Booking requests</h2>
          <p>Review incoming appointments and notify customers instantly.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      {requests.length === 0 ? (
        <div className="page-state">
          <div className="page-state__icon">🎉</div>
          <h3>No pending requests</h3>
          <p>Enjoy the calm—new bookings will appear here immediately.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => {
            const start = new Date(request.start);
            return (
              <article key={request._id} className="card request-card">
                <header>
                  <h3>{request.service?.name}</h3>
                  <span className="badge">{request.customer?.firstName}</span>
                </header>
                <p>
                  {start.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="request-card__contact">{request.customer?.email}</p>
                <footer>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={actionLoading === request._id}
                    onClick={() => handleDecision(request._id, 'approve')}
                  >
                    {actionLoading === request._id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    className="primary-ghost"
                    disabled={actionLoading === request._id}
                    onClick={() => handleDecision(request._id, 'decline')}
                  >
                    Decline
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;

