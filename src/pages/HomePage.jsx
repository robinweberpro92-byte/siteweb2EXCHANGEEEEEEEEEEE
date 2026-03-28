import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import GuestBadge from '../components/GuestBadge';
import ReviewsSection from '../components/ReviewsSection';
import TrustStrip from '../components/TrustStrip';
import ExchangeWorkspace from '../components/exchange/ExchangeWorkspace';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { config, copy, auth, language, continueAsGuest } = useApp();

  const supportLinks = [
    config.branding.supportEmail ? { label: language === 'fr' ? 'Email support' : 'Support email', value: config.branding.supportEmail, href: `mailto:${config.branding.supportEmail}` } : null,
    config.socialLinks.discord ? { label: 'Discord', value: 'Discord', href: config.socialLinks.discord } : null,
    config.socialLinks.telegram ? { label: 'Telegram', value: 'Telegram', href: config.socialLinks.telegram } : null,
  ].filter(Boolean);

  return (
    <>
      <section className="container section public-hero">
        <div className="hero-layout hero-layout--wide">
          <div className="hero-copy hero-copy--public">
            <div className="hero-copy__topline">
              <Badge tone="info">{language === 'fr' ? 'Traitement rapide' : 'Fast processing'}</Badge>
              <Badge tone="success">{language === 'fr' ? 'Frais visibles' : 'Visible fees'}</Badge>
              <GuestBadge />
            </div>
            <span className="hero-trust-copy">{copy.home.trustBadge}</span>
            <h1>{copy.home.heroTitle}</h1>
            <p>{copy.home.heroSubtitle}</p>
            <div className="hero-actions hero-actions--stack-mobile">
              <a href="#exchange-panel" className="button button--primary">{copy.home.primaryCta}</a>
              <Link to="/transactions" className="button button--ghost">{copy.home.secondaryCta}</Link>
              {!auth.loggedIn ? (
                <button type="button" className="button button--soft" onClick={() => continueAsGuest({ displayName: language === 'fr' ? 'Invité' : 'Guest' })}>
                  {copy.common.continueAsGuest}
                </button>
              ) : null}
            </div>
            <div className="hero-points">
              {copy.home.reasons.slice(0, 3).map((item) => (
                <div key={item.title} className="hero-point">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="exchange-panel" className="hero-workspace">
            <ExchangeWorkspace embedded hideHeader />
          </div>
        </div>
      </section>

      {config.ui.showTrustStrip ? (
        <section className="container section">
          <TrustStrip />
        </section>
      ) : null}

      <section className="container section public-grid public-grid--3">
        {copy.home.steps.map((step, index) => (
          <Card key={step.title} className="public-card">
            <p className="eyebrow">0{index + 1}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </Card>
        ))}
      </section>

      <section className="container section public-support-grid">
        <Card className="public-card public-card--support">
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">{language === 'fr' ? 'Pourquoi nous choisir' : 'Why choose us'}</p>
              <h3>{language === 'fr' ? 'Une expérience simple, claire et rassurante' : 'A clear, simple and reassuring experience'}</h3>
            </div>
          </div>
          <div className="bullet-list bullet-list--compact">
            {copy.home.reasons.map((item) => (
              <div key={item.title} className="bullet-list__item">
                <span />
                <p><strong>{item.title}</strong> — {item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="public-card public-card--support">
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">{language === 'fr' ? 'Support' : 'Support'}</p>
              <h3>{language === 'fr' ? 'Besoin d’aide pendant votre demande ?' : 'Need help during your request?'}</h3>
            </div>
          </div>
          <div className="support-list">
            {supportLinks.map((item) => (
              <a key={item.label} href={item.href} className="support-row" target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </a>
            ))}
          </div>
          <p className="muted">{language === 'fr' ? 'Gardez votre référence de transaction à portée de main pour accélérer le traitement.' : 'Keep your transaction reference handy to speed up support responses.'}</p>
        </Card>
      </section>

      <section className="container section">
        <ReviewsSection limit={6} title={language === 'fr' ? 'Ils ont déjà utilisé le service' : 'They already use the service'} subtitle={language === 'fr' ? 'Des retours simples et crédibles pour savoir à quoi vous attendre avant de commencer.' : 'Simple, credible feedback so you know what to expect before you start.'} />
      </section>

      <section className="container section faq-grid faq-grid--public">
        {copy.home.faq.map((item) => (
          <Card key={item.question} className="faq-card">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </Card>
        ))}
      </section>
    </>
  );
}
