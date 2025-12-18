import client from './client';

export const authApi = {
  login: (payload) => client.post('/auth/login', payload),
  register: (payload) => client.post('/auth/register', payload),
  logout: () => client.post('/auth/logout'),
  profile: () => client.get('/auth/me'),
  ownerCreateUser: (payload) => client.post('/auth/owner/users', payload),
  ownerListUsers: () => client.get('/auth/owner/users'),
  ownerUpdateUser: (id, payload) => client.patch(`/auth/owner/users/${id}`, payload),
};

export const serviceApi = {
  list: (params) => client.get('/services', { params }),
  details: (id) => client.get(`/services/${id}`),
  create: (payload) => client.post('/services', payload),
  update: (id, payload) => client.put(`/services/${id}`, payload),
  remove: (id) => client.delete(`/services/${id}`),
  summary: (id) => client.get(`/services/${id}/summary`),
};

export const providerApi = {
  list: () => client.get('/providers'),
  profile: (id) => client.get(`/providers/${id}`),
  addAvailability: (slots) => client.post('/providers/me/availability', { slots }),
  removeAvailability: (slotId) => client.delete(`/providers/me/availability/${slotId}`),
  pendingRequests: () => client.get('/providers/me/requests'),
  updateRequest: (id, payload) => client.patch(`/providers/me/requests/${id}`, payload),
  clientHistory: () => client.get('/providers/me/history'),
};

export const availabilityApi = {
  list: (params) => client.get('/availability', { params }),
  block: (id) => client.patch(`/availability/${id}/block`),
};

export const appointmentApi = {
  create: (payload) => client.post('/appointments', payload),
  list: () => client.get('/appointments'),
  get: (id) => client.get(`/appointments/${id}`),
  confirm: (id) => client.patch(`/appointments/${id}/confirm`),
  cancel: (id) => client.patch(`/appointments/${id}/cancel`),
  reschedule: (id, payload) => client.patch(`/appointments/${id}/reschedule`, payload),
  ownerDashboard: () => client.get('/appointments/owner/dashboard/overview'),
};

export const feedbackApi = {
  submit: (payload) => client.post('/feedback', payload),
  provider: (id) => client.get(`/feedback/provider/${id}`),
};

export const analyticsApi = {
  overview: () => client.get('/analytics/overview'),
  topServices: (params) => client.get('/analytics/top-services', { params }),
  revenue: (params) => client.get('/analytics/revenue', { params }),
  customers: () => client.get('/analytics/customers'),
};

export const reportApi = {
  revenue: (params) =>
    client.get('/reports/revenue', {
      params,
      responseType: params?.format === 'csv' ? 'blob' : 'json',
    }),
};

export const supportApi = {
  searchBooking: (params) => client.get('/support/bookings/search', { params }),
  listTickets: (params) => client.get('/support/tickets', { params }),
  createTicket: (payload) => client.post('/support/tickets', payload),
  getTicket: (id) => client.get(`/support/tickets/${id}`),
  updateTicket: (id, payload) => client.patch(`/support/tickets/${id}`, payload),
};


