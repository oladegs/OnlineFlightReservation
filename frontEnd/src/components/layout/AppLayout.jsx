import { NavLink, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { roleNavigation } from '../../utils/navigation.js';

const logoGradient = {
  background:
    'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(249, 115, 22, 0.85) 100%)',
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigation = roleNavigation[user?.role] || [];
  const activeLabel = navigation.find((nav) => location.pathname.startsWith(nav.to))?.label;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar__brand" style={logoGradient}>
          <div className="sidebar__logo">A</div>
          <div>
            <p className="sidebar__title">Appointly</p>
            <span className="sidebar__subtitle">{user?.role}</span>
          </div>
        </div>
        <nav className="sidebar__nav">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar__link">
              <span className="sidebar__icon" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="primary-ghost" onClick={logout}>
          Log out
        </button>
      </aside>
      <main className="main">
        <header className="main__header">
          <h1>{activeLabel || 'Dashboard'}</h1>
          <div className="main__user">
            <div className="avatar" aria-hidden>{user?.firstName?.[0]}</div>
            <div>
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
              <p>{user?.email}</p>
            </div>
          </div>
        </header>
        <section className="main__content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AppLayout;

