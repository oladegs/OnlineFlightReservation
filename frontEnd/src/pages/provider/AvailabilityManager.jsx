import { useCallback, useEffect, useMemo, useState } from 'react';
import { providerApi, serviceApi } from '../../api/index.js';
import useAuth from '../../hooks/useAuth.js';

const AvailabilityManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    service: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: serviceData }, { data: profileData }] = await Promise.all([
        serviceApi.list({ provider: user.id }),
        providerApi.profile(user.id),
      ]);
      setServices(serviceData.services);
      setAvailability(profileData.availability);
      if (serviceData.services.length > 0) {
        setForm((prev) => ({ ...prev, service: serviceData.services[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load availability.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedService = useMemo(
    () => services.find((service) => service._id === form.service),
    [services, form.service],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSlot = async (event) => {
    event.preventDefault();
    if (!form.service || !form.date || !form.time || !selectedService) {
      setError('Please choose a service, date, and time.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const start = new Date(`${form.date}T${form.time}`);
      const end = new Date(start.getTime() + selectedService.durationMinutes * 60000);
      const { data } = await providerApi.addAvailability([
        {
          service: form.service,
          start,
          end,
        },
      ]);
      setAvailability((prev) => [...prev, ...data.slots]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSlot = async (slotId) => {
    setSaving(true);
    setError(null);
    try {
      await providerApi.removeAvailability(slotId);
      setAvailability((prev) => prev.filter((slot) => slot._id !== slotId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove slot.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Loading your planner…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Availability planner</h2>
          <p>Build your weekly schedule so customers can book you at the right times.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <form className="card availability-form" onSubmit={handleCreateSlot}>
        <h3>Add an availability slot</h3>
        <label>
          Service
          <select name="service" value={form.service} onChange={handleChange}>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} • {service.durationMinutes} mins
              </option>
            ))}
          </select>
        </label>
        <div className="availability-form__grid">
          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </label>
          <label>
            Start time
            <input type="time" name="time" value={form.time} onChange={handleChange} />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? 'Saving…' : 'Add slot'}
        </button>
      </form>

      <section className="card availability-list">
        <h3>Upcoming availability</h3>
        {availability.length === 0 ? (
          <p>No future slots yet.</p>
        ) : (
          <ul>
            {availability
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map((slot) => (
                <li key={slot._id} className="availability-list__item">
                  <div>
                    <strong>{slot.service?.name}</strong>
                    <span>
                      {new Date(slot.start).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' • '}
                      {new Date(slot.start).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="availability-list__meta">
                    <span className={`status-chip status-${slot.status}`}>{slot.status}</span>
                    {slot.status !== 'booked' && (
                      <button
                        type="button"
                        className="secondary-link"
                        onClick={() => handleRemoveSlot(slot._id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AvailabilityManager;

