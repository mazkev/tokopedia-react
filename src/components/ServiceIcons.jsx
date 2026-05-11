import { services } from '../data/products';

export default function ServiceIcons() {
  return (
    <section className="services-section" id="services-section">
      <div className="services-grid">
        {services.map((svc) => (
          <div className="service-item" key={svc.label}>
            <div className="service-icon">{svc.icon}</div>
            <span className="service-label">{svc.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
