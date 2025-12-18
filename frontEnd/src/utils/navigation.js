export const roleNavigation = {
  customer: [
    { to: '/customer/services', label: 'Explore Services', icon: '🧭' },
    { to: '/customer/appointments', label: 'My Appointments', icon: '🗓️' },
    { to: '/customer/confirmation', label: 'Confirmations', icon: '✅' },
  ],
  provider: [
    { to: '/provider/availability', label: 'Availability', icon: '🕘' },
    { to: '/provider/requests', label: 'Booking Requests', icon: '📥' },
    { to: '/provider/history', label: 'Client History', icon: '📚' },
  ],
  support: [
    { to: '/support', label: 'Support Desk', icon: '🛠️' },
    { to: '/support/tickets', label: 'Active Tickets', icon: '🎟️' },
  ],
  owner: [
    { to: '/owner/manage', label: 'Manage Data', icon: '🧩' },
    { to: '/owner/analytics', label: 'Analytics', icon: '📊' },
    { to: '/owner/reports', label: 'Revenue Reports', icon: '💼' },
  ],
};


