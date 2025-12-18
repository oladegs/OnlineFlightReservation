import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="page-state">
    <div className="page-state__icon">🧭</div>
    <h1>We lost that page</h1>
    <p>
      The page you&apos;re looking for has moved or doesn&apos;t exist. Let&apos;s guide you back
      to the main experience.
    </p>
    <Link to="/" className="primary-button">
      Go home
    </Link>
  </div>
);

export default NotFoundPage;


