import { useEffect, useState } from 'react';
import { authApi, serviceApi } from '../../api/index.js';

const emptyService = {
  name: '',
  category: '',
  description: '',
  price: '',
  durationMinutes: 60,
  location: '',
};

const emptyStaff = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'provider',
  phone: '',
  location: '',
};

const ManageData = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [assignment, setAssignment] = useState({ service: '', provider: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: serviceData }, { data: staffData }] = await Promise.all([
        serviceApi.list(),
        authApi.ownerListUsers(),
      ]);
      setServices(serviceData.services);
      setStaff(staffData.users);
      if (serviceData.services.length > 0) {
        setAssignment((prev) => ({ ...prev, service: serviceData.services[0]._id }));
      }
      const firstProvider = staffData.users.find((user) => user.role === 'provider');
      if (firstProvider) {
        setAssignment((prev) => ({ ...prev, provider: firstProvider.id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const providerStaff = staff.filter((member) => member.role === 'provider');

  const handleServiceChange = (event) => {
    const { name, value } = event.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (event) => {
    const { name, value } = event.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateService = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...serviceForm,
        price: Number(serviceForm.price),
        durationMinutes: Number(serviceForm.durationMinutes),
      };
      const { data } = await serviceApi.create(payload);
      setServices((prev) => [data.service, ...prev]);
      setServiceForm(emptyService);
      setAssignment((prev) => ({ ...prev, service: data.service._id }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create service.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveService = async (serviceId) => {
    try {
      await serviceApi.remove(serviceId);
      setServices((prev) => prev.filter((service) => service._id !== serviceId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive service.');
    }
  };

  const handleAssignProvider = async (event) => {
    event.preventDefault();
    if (!assignment.service || !assignment.provider) return;
    setSaving(true);
    setError(null);
    try {
      const service = services.find((item) => item._id === assignment.service);
      const existingProviders = new Set((service?.providers || []).map((p) => p._id || p));
      existingProviders.add(assignment.provider);
      const { data } = await serviceApi.update(assignment.service, {
        providers: Array.from(existingProviders),
      });
      setServices((prev) => prev.map((item) => (item._id === data.service._id ? data.service : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign provider.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async (serviceId, providerId) => {
    setSaving(true);
    setError(null);
    try {
      const service = services.find((item) => item._id === serviceId);
      const remainingProviders = (service?.providers || [])
        .map((p) => p._id || p)
        .filter((id) => id !== providerId);
      const { data } = await serviceApi.update(serviceId, { providers: remainingProviders });
      setServices((prev) => prev.map((item) => (item._id === serviceId ? data.service : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove provider.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await authApi.ownerCreateUser(staffForm);
      setStaff((prev) => [data.user, ...prev]);
      setStaffForm(emptyStaff);
      if (data.user.role === 'provider') {
        setAssignment((prev) => ({ ...prev, provider: data.user.id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create staff account.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Loading management dashboard…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h2>Manage services & team</h2>
          <p>Add new offerings, update staff, and keep your marketplace current.</p>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <div className="owner-grid">
        <form className="card owner-form" onSubmit={handleCreateService}>
          <h3>Add a new service</h3>
          <label>
            Name
            <input name="name" value={serviceForm.name} onChange={handleServiceChange} required />
          </label>
          <label>
            Category
            <input
              name="category"
              value={serviceForm.category}
              onChange={handleServiceChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows="3"
              value={serviceForm.description}
              onChange={handleServiceChange}
            />
          </label>
          <div className="owner-form__grid">
            <label>
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                value={serviceForm.price}
                onChange={handleServiceChange}
                required
              />
            </label>
            <label>
              Duration (mins)
              <input
                name="durationMinutes"
                type="number"
                value={serviceForm.durationMinutes}
                onChange={handleServiceChange}
                required
              />
            </label>
          </div>
          <label>
            Location
            <input
              name="location"
              value={serviceForm.location}
              onChange={handleServiceChange}
            />
          </label>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving…' : 'Add service'}
          </button>
        </form>

        <form className="card owner-form" onSubmit={handleCreateStaff}>
          <h3>Create staff account</h3>
          <div className="owner-form__grid">
            <label>
              First name
              <input
                name="firstName"
                value={staffForm.firstName}
                onChange={handleStaffChange}
                required
              />
            </label>
            <label>
              Last name
              <input
                name="lastName"
                value={staffForm.lastName}
                onChange={handleStaffChange}
                required
              />
            </label>
          </div>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={staffForm.email}
              onChange={handleStaffChange}
              required
            />
          </label>
          <label>
            Temporary password
            <input
              name="password"
              type="password"
              value={staffForm.password}
              onChange={handleStaffChange}
              required
            />
          </label>
          <label>
            Role
            <select name="role" value={staffForm.role} onChange={handleStaffChange}>
              <option value="provider">Provider</option>
              <option value="support">Support</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <label>
            Phone
            <input name="phone" value={staffForm.phone} onChange={handleStaffChange} />
          </label>
          <label>
            Location
            <input name="location" value={staffForm.location} onChange={handleStaffChange} />
          </label>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Creating…' : 'Invite staff member'}
          </button>
        </form>
      </div>

      {providerStaff.length > 0 && services.length > 0 && (
        <section className="card owner-form">
          <h3>Assign providers to services</h3>
          <form className="owner-form__grid" onSubmit={handleAssignProvider}>
            <label>
              Service
              <select name="service" value={assignment.service} onChange={handleAssignmentChange}>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Provider
              <select
                name="provider"
                value={assignment.provider}
                onChange={handleAssignmentChange}
              >
                {providerStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Assigning…' : 'Assign provider'}
            </button>
          </form>
        </section>
      )}

      <section className="card owner-table">
        <h3>Active services</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Providers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>${service.price.toFixed(2)}</td>
                <td>{service.durationMinutes} mins</td>
                <td>
                  <div className="provider-chip-group">
                    {(service.providers || []).map((provider) => (
                      <span key={provider._id || provider} className="badge">
                        {provider.firstName ? `${provider.firstName} ${provider.lastName}` : provider}
                        <button
                          type="button"
                          className="secondary-link"
                          onClick={() => handleRemoveAssignment(service._id, provider._id || provider)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {(service.providers || []).length === 0 && <small>No providers yet</small>}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="secondary-link"
                    onClick={() => handleArchiveService(service._id)}
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card owner-table">
        <h3>Staff directory</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>
                  {member.firstName} {member.lastName}
                </td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.isActive ? 'Active' : 'Paused'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ManageData;

