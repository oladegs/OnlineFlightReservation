import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const defaultState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  location: '',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, status, error, isAuthenticated } = useAuth();
  const [form, setForm] = useState(defaultState);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/customer/services', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setLocalError('Please complete the required fields.');
      return;
    }
    try {
      await register(form);
    } catch {
      // handled in context
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <div className="auth-logo">✨</div>
          <div>
            <h1>Create your Appointly account</h1>
            <p>Book appointments, receive instant confirmations, and manage your schedule.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Amina"
              required
            />

            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Banjo"
              required
            />
          </div>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@appointly.app"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />

          <label htmlFor="location">Preferred location</label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Toronto"
          />

          {(localError || error) && <p className="form-error">{localError || error}</p>}

          <button type="submit" className="primary-button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Setting up…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;

