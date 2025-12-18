import { Link, useLocation } from 'react-router-dom';

const UnauthorizedPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="page-state">
      <div className="page-state__icon">🔒</div>
      <h1>Access Restricted</h1>
      <p>
        You don&apos;t have permission to view this area. If you believe this is a mistake,
        please contact an administrator.
      </p>
      <Link to={from} className="primary-button">
        Return to your dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;


