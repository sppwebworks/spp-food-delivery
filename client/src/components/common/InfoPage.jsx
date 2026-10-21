import { Link } from "react-router-dom";

const InfoPage = ({
  eyebrow = "INFORMATION",
  title,
  subtitle,
  icon = "📄",
  sections = [],
  footerCta = null,
}) => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="info-hero-inner">
          <span className="info-hero-eyebrow">{eyebrow}</span>
          <div className="info-hero-icon">{icon}</div>
          <h1 className="info-hero-title">{title}</h1>
          {subtitle && <p className="info-hero-subtitle">{subtitle}</p>}
        </div>
      </section>

      <section className="info-content">
        {sections.map((sec, idx) => (
          <div key={idx} className="info-card">
            {sec.heading && <h2 className="info-card-title">{sec.heading}</h2>}

            {sec.body &&
              sec.body.map((para, i) => (
                <p key={i} className="info-card-para">
                  {para}
                </p>
              ))}

            {sec.items && (
              <ul className="info-card-list">
                {sec.items.map((it, i) => (
                  <li key={i}>
                    <span className="info-card-bullet">✓</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}

            {sec.note && (
              <div className="info-card-note">
                <span className="info-card-note-icon">💡</span>
                <span>{sec.note}</span>
              </div>
            )}
          </div>
        ))}

        <div className="info-cta">
          <div className="info-cta-content">
            <h3>Still have questions?</h3>
            <p>Our support team is here to help you out.</p>
          </div>
          <div className="info-cta-actions">
            {footerCta ? (
              <Link to={footerCta.to} className="btn-primary">
                {footerCta.label}
              </Link>
            ) : (
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>
            )}
            <Link to="/help" className="btn-outline">
              Visit Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
