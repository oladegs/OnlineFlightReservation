import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { supportApi } from '../../api/index.js';
import useAuth from '../../hooks/useAuth.js';

const issueTypes = [
  { value: 'payment', label: 'Payment' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'technical', label: 'Technical' },
  { value: 'general', label: 'General' },
];

const statusOptions = ['open', 'in_progress', 'resolved', 'closed'];

const SupportDesk = ({ focus = 'search' }) => {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    issueType: 'general',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    try {
      const { data } = await supportApi.listTickets();
      setTickets(data.tickets);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tickets.');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (focus === 'tickets' && tickets.length > 0) {
      document.getElementById('ticket-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [focus, tickets.length]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await supportApi.searchBooking({ appointmentId: searchId });
      setBooking(data.appointment);
    } catch (err) {
      setBooking(null);
      setError(err.response?.data?.message || 'Booking not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketChange = (event) => {
    const { name, value } = event.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      setError('Subject and description are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...ticketForm,
        appointment: booking?._id || undefined,
      };
      const { data } = await supportApi.createTicket(payload);
      setTickets((prev) => [data.ticket, ...prev]);
      setTicketForm({ subject: '', description: '', issueType: 'general' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (id, updates) => {
    try {
      const { data } = await supportApi.updateTicket(id, updates);
      setTickets((prev) => prev.map((ticket) => (ticket._id === id ? data.ticket : ticket)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update ticket.');
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Support desk</h2>
          <p>Resolve booking issues quickly with full visibility into schedules and tickets.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <div className="support-grid">
        <section className="card support-search">
          <h3>Lookup booking</h3>
          <form onSubmit={handleSearch}>
            <label>
              Appointment ID
              <input
                value={searchId}
                onChange={(event) => setSearchId(event.target.value)}
                placeholder="e.g. 6730c..."
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {booking && (
            <div className="support-booking card">
              <h4>Booking found</h4>
              <p>
                {booking.service?.name} with {booking.provider?.firstName}{' '}
                {booking.provider?.lastName}
              </p>
              <p>
                {new Date(booking.start).toLocaleString()} • {booking.status}
              </p>
              <p>Customer: {booking.customer?.firstName} {booking.customer?.lastName}</p>
            </div>
          )}
        </section>

        <section className="card support-ticket">
          <h3>Open a ticket</h3>
          <form onSubmit={handleCreateTicket}>
            <label>
              Subject
              <input
                name="subject"
                value={ticketForm.subject}
                onChange={handleTicketChange}
                placeholder="Payment error refund"
              />
            </label>
            <label>
              Issue type
              <select name="issueType" value={ticketForm.issueType} onChange={handleTicketChange}>
                {issueTypes.map((issue) => (
                  <option key={issue.value} value={issue.value}>
                    {issue.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="4"
                value={ticketForm.description}
                onChange={handleTicketChange}
                placeholder="Include helpful context to resolve quickly."
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              Submit ticket
            </button>
          </form>
        </section>
      </div>

      <section className="card ticket-list" id="ticket-list">
        <header>
          <h3>Active tickets</h3>
          <span className="badge">{tickets.length}</span>
        </header>
        <div className="ticket-list__grid">
          {tickets.map((ticket) => (
            <article key={ticket._id} className="ticket-card">
              <header>
                <div>
                  <h4>{ticket.subject}</h4>
                  <p>#{ticket.ticketNumber}</p>
                </div>
                <select
                  value={ticket.status}
                  onChange={(event) =>
                    handleUpdateTicket(ticket._id, { status: event.target.value })
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </header>
              <p>{ticket.description}</p>
              <footer>
                <small>
                  Created {new Date(ticket.createdAt).toLocaleDateString()} • Assigned to{' '}
                  {ticket.assignedTo
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : 'Unassigned'}
                </small>
                <button
                  type="button"
                  className="secondary-link"
                  onClick={() =>
                    handleUpdateTicket(ticket._id, {
                      note: `Follow-up by ${user.firstName}`,
                    })
                  }
                >
                  Log follow-up
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

SupportDesk.propTypes = {
  focus: PropTypes.string,
};

export default SupportDesk;

