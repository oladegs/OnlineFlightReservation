import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { appointmentApi } from '../../api/index.js';

const ConfirmationPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const loadAppointment = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await appointmentApi.get(appointmentId);
      setAppointment(data.appointment);
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load appointment.');
      setStatus('error');
    }
  }, [appointmentId]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleConfirm = async () => {
    try {
      const { data } = await appointmentApi.confirm(appointmentId);
      setAppointment(data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to confirm appointment.');
    }
  };

  const handleCancel = async () => {
    try {
      const { data } = await appointmentApi.cancel(appointmentId);
      setAppointment(data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel appointment.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Finalizing your booking…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-state">
        <div className="page-state__icon">⚠️</div>
        <h1>We hit a snag</h1>
        <p>{error}</p>
        <button type="button" className="primary-button" onClick={() => navigate('/customer/services')}>
          Browse services
        </button>
      </div>
    );
  }

  const start = new Date(appointment.start);
  const end = new Date(appointment.end);

  return (
    <div className="page">
      <section className="confirmation card">
        <h2>Appointment confirmed! 🎉</h2>
        <p>
          We emailed a receipt and calendar invite. You can manage this appointment anytime from
          your dashboard.
        </p>

        {error && <p className="form-error">{error}</p>}

        <dl className="confirmation__grid">
          <div>
            <dt>Service</dt>
            <dd>{appointment.service?.name}</dd>
          </div>
          <div>
            <dt>Provider</dt>
            <dd>
              {appointment.provider?.firstName} {appointment.provider?.lastName}
            </dd>
          </div>
          <div>
            <dt>Date & time</dt>
            <dd>
              {start.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              — {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} to{' '}
              {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>
              {appointment.payment?.status === 'paid' ? 'Paid' : 'Pending'} • $
              {appointment.payment?.amount?.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className={`status-chip status-${appointment.status}`}>{appointment.status}</dd>
          </div>
        </dl>

        <footer className="confirmation__actions">
          <button type="button" className="primary-button" onClick={handleConfirm}>
            Send final confirmation
          </button>
          <button type="button" className="primary-ghost" onClick={handleCancel}>
            Cancel appointment
          </button>
          <Link to="/customer/appointments" className="secondary-link">
            Manage or reschedule
          </Link>
        </footer>
      </section>
    </div>
  );
};

export default ConfirmationPage;

