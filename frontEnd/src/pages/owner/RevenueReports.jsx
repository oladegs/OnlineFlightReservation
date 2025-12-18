import { useState } from 'react';
import { reportApi } from '../../api/index.js';

const RevenueReports = () => {
  const [period, setPeriod] = useState('monthly');
  const [format, setFormat] = useState('json');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = { period, format };
      const response = await reportApi.revenue(params);
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `revenue-${period}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        setReport(response.data.report);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Revenue reports</h2>
          <p>Export commission-ready summaries by day, week, or month.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <form className="card report-form" onSubmit={handleGenerate}>
        <div className="report-form__grid">
          <label>
            Period
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            Format
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="json">View in app</option>
              <option value="csv">Download CSV</option>
            </select>
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Generating…' : 'Generate report'}
        </button>
      </form>

      {format === 'json' && report.length > 0 && (
        <section className="card owner-table">
          <h3>Report preview</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Provider</th>
                <th>Customer</th>
                <th>Start</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item) => (
                <tr key={item._id}>
                  <td>{item.service?.name}</td>
                  <td>
                    {item.provider?.firstName} {item.provider?.lastName}
                  </td>
                  <td>
                    {item.customer?.firstName} {item.customer?.lastName}
                  </td>
                  <td>{new Date(item.start).toLocaleDateString()}</td>
                  <td>${item.payment?.amount?.toFixed(2)}</td>
                  <td>{item.payment?.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default RevenueReports;


