import BrandMark from './BrandMark';
import { useApp } from '../context/AppContext';
import { compact, formatNumber } from '../utils/format';

export default function Footer() {
  const { config, language } = useApp();
  const { footer, socialLinks, branding, payments, trustIndicators } = config;
  const footerText = typeof footer.text === 'object'
    ? footer.text[language] || footer.text.fr || ''
    : (language === 'fr' ? footer.text : 'Clyra Exchange keeps crypto and payment swaps simple with clear steps, visible fees and readable tracking.');

  return (
    <footer className="footer-shell">
      <div className="container footer-grid">
        <div className="footer-block footer-block--brand">
          <div className="brand-link brand-link--footer">
            <BrandMark branding={branding} size={40} />
            <div className="brand-link__text">
              <strong>{branding.siteName}</strong>
              <span>{branding.tagline}</span>
            </div>
          </div>
          <p>{footerText}</p>
          <div className="footer-mini-stats">
            <div><span>{language === 'fr' ? 'Volume' : 'Volume'}</span><strong>{compact(trustIndicators.monthlyVolume, language)}</strong></div>
            <div><span>{language === 'fr' ? 'Avis' : 'Reviews'}</span><strong>{formatNumber(trustIndicators.reviewCount, 0, language)}</strong></div>
            <div><span>{language === 'fr' ? 'Satisfaction' : 'Satisfaction'}</span><strong>{trustIndicators.supportSatisfaction}%</strong></div>
          </div>
          <small>{footer.copyright}</small>
        </div>

        <div className="footer-block">
          <h4>{language === 'fr' ? 'Liens légaux' : 'Legal links'}</h4>
          <ul>
            {footer.legalLinks.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-block">
          <h4>{language === 'fr' ? 'Réseaux' : 'Social'}</h4>
          <ul>
            <li><a href={socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a></li>
            <li><a href={socialLinks.telegram} target="_blank" rel="noreferrer">Telegram</a></li>
            <li><a href={socialLinks.discord} target="_blank" rel="noreferrer">Discord</a></li>
            <li><a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
          </ul>
        </div>

        <div className="footer-block">
          <h4>{language === 'fr' ? 'Support & règlements' : 'Support & settlement'}</h4>
          <ul>
            <li>{branding.supportEmail}</li>
            <li>{payments.paypal.email}</li>
            <li>{payments.paypal.confirmationDelay}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
