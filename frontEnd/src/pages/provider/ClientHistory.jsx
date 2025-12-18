import { useEffect, useMemo, useState } from 'react';
import { providerApi } from '../../api/index.js';

const ClientHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await providerApi.clientHistory();
      setHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load client history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!search) return history;
    return history.filter((entry) => {
      const haystack = `${entry.customer?.firstName ?? ''} ${entry.customer?.lastName ?? ''} ${entry.service?.name ?? ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [history, search]);

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Gathering client insights…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Client history</h2>
          <p>See every visit, feedback, and note to personalize future experiences.</p>
        </div>
        <input
          type="search"
          placeholder="Search by client or service"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="chip-input"
        />
      </header>

      {error && <p className="form-error">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((entry) => (
            <tr key={entry._id}>
              <td>
                <strong>
                  {entry.customer?.firstName} {entry.customer?.lastName}
                </strong>
              </td>
              <td>{entry.service?.name}</td>
              <td>
                {new Date(entry.start).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td>
                <span className={`status-chip status-${entry.status}`}>{entry.status}</span>
              </td>
              <td>{entry.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientHistory;


