import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import MarketTable from '../components/MarketTable';
import StatsStrip from '../components/StatsStrip';
import ReviewsSection from '../components/ReviewsSection';
import { useApp } from '../context/AppContext';
import { FLOW_DEFINITIONS } from '../utils/exchange';

export default function HomePage() {
  const { config, copy, continueAsGuest, auth, language } = useApp();
  const activeFlows = FLOW_DEFINITIONS.filter((flow) => config.exchange.flowAvailability[flow.key]);

  return (
    <>
      <section className="hero-section hero-section--premium">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-badges">
              <Badge tone="info">Front-only</Badge>
              <Badge tone="success">Mobile-first</Badge>
              <Badge tone="warning">Admin-ready</Badge>
            </div>
            <span className="hero-trust-copy">{copy.home.trustBadge}</span>
            <h1>{copy.home.heroTitle}</h1>
            <p>{copy.home.heroSubtitle}</p>
            <div className="hero-actions">
              <Link to="/exchange" className="button button--primary">{copy.home.primaryCta}</Link>
              <Link to="/admin" className="button button--ghost">{copy.home.secondaryCta}</Link>
              {!auth.loggedIn ? (
                <button type="button" className="button button--soft" onClick={() => continueAsGuest({ displayName: language === 'fr' ? 'Invité' : 'Guest' })}>
                  {copy.common.continueAsGuest}
                </button>
              ) : null}
            </div>
          </div>

          <Card className="hero-panel hero-panel--dashboard">
            <div className="hero-panel__top">
              <div>
                <p className="eyebrow">{language === 'fr' ? 'Flux actifs' : 'Active flows'}</p>
                <h3>{language === 'fr' ? 'Parcours disponibles immédiatement' : 'Flows available right now'}</h3>
              </div>
              <Badge tone="success">{activeFlows.length}</Badge>
            </div>
            <div className="flow-grid flow-grid--landing">
              {activeFlows.map((flow) => (
                <div key={flow.key} className="flow-card flow-card--static">
                  <Badge tone="info">{copy.exchange.flowLabels[flow.key] || flow.label}</Badge>
                  <strong>{flow.paymentMethod} → {flow.receiveMethod}</strong>
                  <p>
                    {language === 'fr'
                      ? 'Résumé net, instructions adaptées, boutons copier et suivi immédiat.'
                      : 'Net preview, contextual instructions, copy actions and immediate tracking.'}
                  </p>
                </div>
              ))}
            </div>
            <div className="hero-panel__footer">
              <div className="hero-panel__metric">
                <span>{language === 'fr' ? 'Temps moyen' : 'Average time'}</span>
                <strong>{config.trustIndicators.averageProcessingMinutes} min</strong>
              </div>
              <div className="hero-panel__metric">
                <span>{language === 'fr' ? 'Satisfaction' : 'Satisfaction'}</span>
                <strong>{config.trustIndicators.supportSatisfaction}%</strong>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {config.ui.showTrustStrip ? (
        <section className="container section">
          <StatsStrip />
        </section>
      ) : null}

      <section className="container section feature-grid feature-grid--premium">
        {copy.home.reasons.map((item, index) => (
          <Card key={`${item.title}-${index}`} className="feature-card">
            <p className="eyebrow">0{index + 1}</p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Card>
        ))}
      </section>

      <section className="container section split-section">
        <Card>
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">{language === 'fr' ? 'Comment ça marche' : 'How it works'}</p>
              <h3>{language === 'fr' ? 'Un parcours simple et guidé' : 'A clear guided flow'}</h3>
            </div>
          </div>
          <div className="steps-list">
            {copy.home.steps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="step-row">
                <span>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">Admin</p>
              <h3>{language === 'fr' ? 'Ce que vous pilotez' : 'What you control'}</h3>
            </div>
          </div>
          <div className="bullet-list bullet-list--compact">
            <div className="bullet-list__item"><span /> <p>{language === 'fr' ? 'Branding, thème, langues, trust bar et reviews en un seul endroit.' : 'Branding, theme, languages, trust bar and reviews from one place.'}</p></div>
            <div className="bullet-list__item"><span /> <p>{language === 'fr' ? 'Paiements, wallets, règles métier, frais et combinaisons Exchange.' : 'Payments, wallets, business rules, fees and exchange combinations.'}</p></div>
            <div className="bullet-list__item"><span /> <p>{language === 'fr' ? 'Analytics, objectifs, rôles admin, help center, logs et alertes.' : 'Analytics, objectives, admin roles, help center, logs and alert center.'}</p></div>
          </div>
        </Card>
      </section>

      <section className="container section">
        <ReviewsSection limit={6} />
      </section>

      <section className="container section">
        <MarketTable limit={4} title={language === 'fr' ? 'Aperçu du marché' : 'Market snapshot'} subtitle={copy.market.subtitle} />
      </section>

      <section className="container section faq-grid">
        {copy.home.faq.map((item) => (
          <Card key={item.question} className="faq-card">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </Card>
        ))}
      </section>

      <section className="container section final-cta">
        <Card className="cta-card">
          <div>
            <p className="eyebrow">{language === 'fr' ? 'Prêt à commencer ?' : 'Ready to start?'}</p>
            <h3>{language === 'fr' ? 'Lancez votre demande en quelques étapes' : 'Launch your request in a few guided steps'}</h3>
          </div>
          <div className="hero-actions">
            <Link to="/exchange" className="button button--primary">{copy.common.openExchange}</Link>
            {!auth.loggedIn ? (
              <button type="button" className="button button--ghost" onClick={() => continueAsGuest({ displayName: language === 'fr' ? 'Invité' : 'Guest' })}>
                {copy.common.continueAsGuest}
              </button>
            ) : null}
          </div>
        </Card>
      </section>
    </>
  );
}
