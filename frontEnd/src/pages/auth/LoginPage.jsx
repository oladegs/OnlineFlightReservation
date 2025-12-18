import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, status, error, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectMap = {
        customer: '/customer/services',
        provider: '/provider/availability',
        support: '/support',
        owner: '/owner/analytics',
      };
      navigate(redirectMap[user?.role] || '/customer/services', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setLocalError('Email and password are required.');
      return;
    }
    try {
      await login(form);
    } catch {
      // handled via context state
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <div className="auth-logo">A</div>
          <div>
            <h1>Welcome to Appointly</h1>
            <p>Orchestrate bookings, insights, and support from one elegant portal.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@appointly.app"
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {(localError || error) && <p className="form-error">{localError || error}</p>}

          <button type="submit" className="primary-button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create a customer account</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;

