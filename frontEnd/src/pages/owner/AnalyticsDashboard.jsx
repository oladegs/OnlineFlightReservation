import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsApi } from '../../api/index.js';

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [customerActivity, setCustomerActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: overviewData }, { data: topData }, { data: revenueData }, { data: customers }] =
        await Promise.all([
          analyticsApi.overview(),
          analyticsApi.topServices({ limit: 5 }),
          analyticsApi.revenue({ period: 'weekly' }),
          analyticsApi.customers(),
        ]);
      setOverview(overviewData);
      setTopServices(topData.topServices);
      setRevenueTrend(revenueData.revenue);
      setCustomerActivity(customers.customers);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Processing performance metrics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state">
        <div className="page-state__icon">⚠️</div>
        <h1>Analytics unavailable</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page analytics-page">
      <header className="page__header">
        <div>
          <h2>Business intelligence</h2>
          <p>Monitor revenue, booking velocity, and customer loyalty in real time.</p>
        </div>
      </header>

      <section className="analytics-grid">
        <article className="card stat-card">
          <h3>Revenue (30 days)</h3>
          <p className="stat-card__value">${overview.revenue.totalRevenue.toFixed(2)}</p>
          <span className="stat-card__hint">
            Paid: ${overview.revenue.totalPaid.toFixed(2)}
          </span>
        </article>

        <article className="card stat-card">
          <h3>Bookings in pipeline</h3>
          <p className="stat-card__value">{overview.bookingsTrend.reduce((sum, day) => sum + day.count, 0)}</p>
          <span className="stat-card__hint">Last 30 days</span>
        </article>

        <article className="card stat-card">
          <h3>New customers</h3>
          <p className="stat-card__value">{overview.newCustomers}</p>
          <span className="stat-card__hint">Unique clients in 30 days</span>
        </article>
      </section>

      <section className="card chart-card">
        <header>
          <h3>Weekly revenue</h3>
        </header>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.08)" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="totalRevenue"
              stroke="#2563EB"
              fillOpacity={1}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="analytics-grid">
        <article className="card chart-card">
          <header>
            <h3>Top services by bookings</h3>
          </header>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topServices}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.08)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#F97316" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card">
          <header>
            <h3>Customer loyalty</h3>
          </header>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={customerActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.08)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;


