import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { appointmentApi, availabilityApi } from '../../api/index.js';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const MyAppointments = () => {
  const location = useLocation();
  const highlightId = location.state?.highlight;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rescheduleOptions, setRescheduleOptions] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentApi.list();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter((appointment) => appointment.status === statusFilter);
  }, [appointments, statusFilter]);

  const handleConfirm = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await appointmentApi.confirm(id);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id ? data.appointment : appointment,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to confirm appointment.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await appointmentApi.cancel(id);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id ? data.appointment : appointment,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel appointment.');
    } finally {
      setActionLoading(null);
    }
  };

  const openReschedule = async (appointment) => {
    if (rescheduleOptions[appointment._id]) return;
    try {
      const { data } = await availabilityApi.list({
        serviceId: appointment.service._id,
        providerId: appointment.provider._id,
      });
      setRescheduleOptions((prev) => ({ ...prev, [appointment._id]: data.slots }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch alternative slots.');
    }
  };

  const handleReschedule = async (appointmentId, slotId) => {
    setActionLoading(appointmentId);
    try {
      const { data } = await appointmentApi.reschedule(appointmentId, { newSlotId: slotId });
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === appointmentId ? data.appointment : appointment,
        ),
      );
      setRescheduleOptions((prev) => ({ ...prev, [appointmentId]: undefined }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reschedule appointment.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Loading your upcoming schedule…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>My appointments</h2>
          <p>Confirm bookings, request changes, or review your past visits.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="chip-select"
        >
          {statusFilters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      {error && <p className="form-error">{error}</p>}

      <div className="appointments-grid">
        {filteredAppointments.map((appointment) => {
          const start = new Date(appointment.start);
          const end = new Date(appointment.end);
          const highlight = appointment._id === highlightId;
          const options = rescheduleOptions[appointment._id] || [];
          const canModify = ['pending', 'confirmed'].includes(appointment.status);

          return (
            <article
              key={appointment._id}
              className={`appointment-card card ${highlight ? 'is-highlighted' : ''}`}
            >
              <header>
                <h3>{appointment.service?.name}</h3>
                <span className={`status-chip status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </header>
              <p className="appointment-card__time">
                {start.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} -{' '}
                {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p className="appointment-card__provider">
                With {appointment.provider?.firstName} {appointment.provider?.lastName}
              </p>
              {appointment.notes && <p className="appointment-card__notes">“{appointment.notes}”</p>}
              <footer className="appointment-card__actions">
                {canModify && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={actionLoading === appointment._id}
                      onClick={() => handleConfirm(appointment._id)}
                    >
                      {actionLoading === appointment._id ? 'Updating…' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      className="primary-ghost"
                      disabled={actionLoading === appointment._id}
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="secondary-link"
                      onClick={() => openReschedule(appointment)}
                    >
                      Reschedule
                    </button>
                  </>
                )}
              </footer>

              {options.length > 0 && (
                <div className="reschedule-options">
                  <p>Select a new time:</p>
                  <div className="slot-grid">
                    {options.map((slot) => (
                      <button
                        type="button"
                        key={slot._id}
                        className="slot-card"
                        onClick={() => handleReschedule(appointment._id, slot._id)}
                      >
                        <span>
                          {new Date(slot.start).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <strong>
                          {new Date(slot.start).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </strong>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;


