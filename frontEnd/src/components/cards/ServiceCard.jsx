import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const providers = service.providers || [];
  const topProvider = providers[0];

  return (
    <article className="service-card card">
      <header>
        <span className="badge">{service.category}</span>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
      </header>

      <dl className="service-card__meta">
        <div>
          <dt>Duration</dt>
          <dd>{service.durationMinutes} mins</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>${service.price.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Rating</dt>
          <dd>{service.ratingCount ? `${service.ratingAverage.toFixed(1)} ★` : 'New'}</dd>
        </div>
      </dl>

      {topProvider && (
        <div className="service-card__provider">
          <span className="avatar">{topProvider.firstName?.[0]}</span>
          <div>
            <strong>
              {topProvider.firstName} {topProvider.lastName}
            </strong>
            <p>{topProvider.providerProfile?.bio || 'Certified specialist'}</p>
          </div>
        </div>
      )}

      <footer>
        <Link to={`/customer/services/${service._id}/book`} className="primary-button">
          Book now
        </Link>
        <p className="service-card__location">
          Serving {service.location || 'multiple locations'}
        </p>
      </footer>
    </article>
  );
};

export default ServiceCard;


