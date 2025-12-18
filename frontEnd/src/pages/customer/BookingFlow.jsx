import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { appointmentApi, availabilityApi, serviceApi } from '../../api/index.js';

const paymentMethods = [
  { value: 'card', label: 'Pay now by card' },
  { value: 'cash', label: 'Pay at appointment' },
  { value: 'invalid', label: 'Simulate payment failure' },
];

const BookingFlow = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      try {
        const { data } = await serviceApi.details(serviceId);
        setService(data.service);
        if (data.service.providers.length > 0) {
          setSelectedProvider(data.service.providers[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load service.');
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [serviceId]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedProvider) return;
      setLoading(true);
      try {
        const { data } = await availabilityApi.list({
          serviceId,
          providerId: selectedProvider,
        });
        setSlots(data.slots);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load availability.');
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [selectedProvider, serviceId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSlot || !selectedProvider) {
      setError('Please choose a provider and time slot.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentApi.create({
        serviceId,
        providerId: selectedProvider,
        slotId: selectedSlot,
        paymentMethod,
        notes,
      });
      navigate(`/customer/confirmation/${data.appointment._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete booking.');
    } finally {
      setLoading(false);
    }
  };

  const providerOptions = service?.providers ?? [];

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Secure your appointment</h2>
          <p>Choose a provider, select an open slot, and confirm your booking in seconds.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      {loading && !service && (
        <div className="page-state">
          <div className="spinner" />
          <p>Preparing booking details…</p>
        </div>
      )}

      {service && (
        <form className="booking-form" onSubmit={handleSubmit}>
          <section className="card booking-form__section">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{service.category}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{service.durationMinutes} minutes</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>${service.price.toFixed(2)}</dd>
              </div>
            </dl>
          </section>

          <section className="card booking-form__section">
            <h3>Select provider</h3>
            <div className="provider-grid">
              {providerOptions.map((provider) => (
                <button
                  type="button"
                  key={provider._id}
                  className={`provider-card ${selectedProvider === provider._id ? 'is-active' : ''}`}
                  onClick={() => setSelectedProvider(provider._id)}
                >
                  <span className="avatar">{provider.firstName?.[0]}</span>
                  <div>
                    <strong>
                      {provider.firstName} {provider.lastName}
                    </strong>
                    <p>{provider.providerProfile?.bio || 'Experienced professional'}</p>
                    <small>{provider.providerProfile?.specialties?.join(' • ')}</small>
                  </div>
                </button>
              ))}
              {providerOptions.length === 0 && (
                <p>No providers currently assigned to this service.</p>
              )}
            </div>
          </section>

          <section className="card booking-form__section">
            <h3>Pick an available time</h3>
            <div className="slot-grid">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot._id}
                  className={`slot-card ${selectedSlot === slot._id ? 'is-active' : ''}`}
                  onClick={() => setSelectedSlot(slot._id)}
                >
                  <span>{new Date(slot.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <strong>{new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
                  <small>{service.durationMinutes} mins • {slot.status}</small>
                </button>
              ))}
            </div>
            {slots.length === 0 && <p>No open slots found. Try a different provider.</p>}
          </section>

          <section className="card booking-form__section">
            <h3>Payment & notes</h3>
            <label>
              Payment method
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notes for provider (optional)
              <textarea
                rows="4"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share important preferences or context for this appointment."
              />
            </label>
          </section>

          <footer className="booking-form__actions">
            <button type="button" className="primary-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Processing…' : 'Confirm appointment'}
            </button>
          </footer>
        </form>
      )}
    </div>
  );
};

export default BookingFlow;


