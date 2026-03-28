import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import MarketTable from '../components/MarketTable';
import ReviewsSection from '../components/ReviewsSection';
import { useApp } from '../context/AppContext';
import { euro, formatDateTime, statusTone } from '../utils/format';

function ProgressStat({ label, value, progress, helper }) {
  return (
    <Card className="stat-card stat-card--dashboard">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="progress-inline"><span style={{ width: `${Math.max(8, Math.min(progress, 100))}%` }} /></div>
      <small>{helper}</small>
    </Card>
  );
}

export default function DashboardPage() {
  const { config, auth, currentUser, guestProfile, copy, language } = useApp();

  const scopedTransactions = auth.isGuest
    ? config.transactions.filter((transaction) => transaction.userId === auth.userId)
    : auth.role === 'user'
      ? config.transactions.filter((transaction) => transaction.userEmail.toLowerCase() === auth.email.toLowerCase())
      : config.transactions;

  const recentTransactions = scopedTransactions.slice(0, 5);
  const dashboardNotifications = config.notifications.items.filter((item) => item.enabled && (item.target === 'all' || item.target === 'dashboard') && (!item.language || item.language === 'all' || item.language === language));

  const cards = [
    {
      label: auth.isGuest ? (language === 'fr' ? 'Session locale' : 'Local session') : auth.role === 'user' ? (language === 'fr' ? 'Solde estimé' : 'Estimated balance') : (language === 'fr' ? 'Volume total' : 'Total volume'),
      value: auth.isGuest
        ? `${guestProfile.transactionsCount || 0}`
        : euro(auth.role === 'user' ? currentUser?.balance || 0 : config.analytics.volumeTotal, 'EUR', language),
      helper: auth.isGuest ? (language === 'fr' ? 'opérations créées' : 'requests created') : auth.role === 'user' ? (language === 'fr' ? 'solde local' : 'local balance') : (language === 'fr' ? 'kpi global' : 'global KPI'),
      progress: auth.isGuest ? Math.min((guestProfile.transactionsCount || 0) * 18, 100) : 74,
    },
    {
      label: language === 'fr' ? 'Transactions' : 'Transactions',
      value: String(scopedTransactions.length),
      helper: auth.isGuest ? (language === 'fr' ? 'historique invité' : 'guest history') : auth.role === 'user' ? (language === 'fr' ? 'historique personnel' : 'personal history') : (language === 'fr' ? 'historique global' : 'global history'),
      progress: Math.min(scopedTransactions.length * 10, 100),
    },
    {
      label: language === 'fr' ? 'Temps moyen' : 'Average time',
      value: `${config.trustIndicators.averageProcessingMinutes} min`,
      helper: `${config.trustIndicators.completionRate}% ${language === 'fr' ? 'de completion' : 'completion'}`,
      progress: 82,
    },
    {
      label: auth.isGuest ? copy.common.guestSession : auth.role === 'user' ? (language === 'fr' ? 'Statut KYC' : 'KYC status') : (language === 'fr' ? 'Utilisateurs actifs' : 'Active users'),
      value: auth.isGuest ? (guestProfile.displayName || 'Guest') : auth.role === 'user' ? currentUser?.kyc || '—' : String(config.analytics.activeUsers),
      helper: auth.isGuest ? (language === 'fr' ? 'session locale persistée' : 'persistent local session') : auth.role === 'user' ? currentUser?.status || '—' : config.analytics.peakHour,
      progress: auth.isGuest ? 48 : 66,
    },
  ];

  return (
    <section className="container section page-intro dashboard-page">
      <div className="page-head">
        <span className="eyebrow">{copy.nav.dashboard}</span>
        <h1>
          {auth.isGuest
            ? `${copy.dashboard.title} — ${copy.common.guestSession}`
            : auth.role === 'user'
              ? `Bonjour ${currentUser?.name || auth.name}`
              : copy.dashboard.title}
        </h1>
        <p>{auth.isGuest ? copy.dashboard.guestMessage : copy.dashboard.welcomeMessage}</p>
      </div>

      <div className="dashboard-grid dashboard-grid--metrics">
        {cards.map((card) => (
          <ProgressStat key={card.label} {...card} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--2col">
        <Card>
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">{language === 'fr' ? 'Compte' : 'Account'}</p>
              <h3>{language === 'fr' ? 'État du profil' : 'Profile state'}</h3>
            </div>
            <Badge tone={statusTone(currentUser?.status || (auth.isGuest ? 'En cours' : 'Actif'))}>
              {auth.isGuest ? copy.common.guestSession : currentUser?.status || 'Actif'}
            </Badge>
          </div>
          <div className="summary-list">
            <div className="summary-row"><span>Email</span><strong>{auth.email || '—'}</strong></div>
            <div className="summary-row"><span>{language === 'fr' ? 'KYC' : 'KYC'}</span><strong>{currentUser?.kyc || '—'}</strong></div>
            <div className="summary-row"><span>{language === 'fr' ? 'Support' : 'Support'}</span><strong>{config.branding.supportEmail}</strong></div>
          </div>
          <p className="muted sidebar-copy">{copy.dashboard.accountMessage}</p>
          <div className="step-actions step-actions--left step-actions--wrap">
            <Link to="/exchange" className="button button--primary">{copy.common.openExchange}</Link>
            <Link to="/transactions" className="button button--ghost">{copy.common.viewTransactions}</Link>
            {auth.isGuest ? <Link to="/login" className="button button--soft">{copy.common.completeProfile}</Link> : null}
          </div>
        </Card>

        <Card>
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">{language === 'fr' ? 'Notifications' : 'Notifications'}</p>
              <h3>{language === 'fr' ? 'Centre de messages' : 'Message center'}</h3>
            </div>
          </div>
          <div className="history-list">
            {dashboardNotifications.length ? dashboardNotifications.map((item) => (
              <div key={item.id} className="history-row history-row--stack">
                <div>
                  <strong>{item.message}</strong>
                  <span>{item.display}</span>
                </div>
                <Badge tone={item.type || 'info'}>{item.type}</Badge>
              </div>
            )) : <p className="muted">{language === 'fr' ? 'Aucun message actif pour cette page.' : 'No active messages for this page.'}</p>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-head section-head--compact">
          <div>
            <p className="eyebrow">{language === 'fr' ? 'Transactions récentes' : 'Recent transactions'}</p>
            <h3>{language === 'fr' ? 'Suivi des derniers dossiers' : 'Track recent requests'}</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{language === 'fr' ? 'Type' : 'Type'}</th>
                <th>{language === 'fr' ? 'Montant net' : 'Net amount'}</th>
                <th>{language === 'fr' ? 'Asset' : 'Asset'}</th>
                <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th>{language === 'fr' ? 'Date' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.type}</td>
                  <td>{euro(transaction.amountNet, 'EUR', language)}</td>
                  <td>{transaction.asset}</td>
                  <td><Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge></td>
                  <td>{formatDateTime(transaction.date, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mobile-history-cards">
          {recentTransactions.map((transaction) => (
            <div key={`${transaction.id}-mobile`} className="history-card">
              <div className="history-card__top">
                <strong>{transaction.id}</strong>
                <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
              </div>
              <p>{transaction.type}</p>
              <div className="history-card__grid">
                <div><span>{language === 'fr' ? 'Net' : 'Net'}</span><strong>{euro(transaction.amountNet, 'EUR', language)}</strong></div>
                <div><span>Asset</span><strong>{transaction.asset}</strong></div>
                <div><span>{language === 'fr' ? 'Date' : 'Date'}</span><strong>{formatDateTime(transaction.date, language)}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="section" />
      <MarketTable limit={4} title={language === 'fr' ? 'Aperçu marché' : 'Market overview'} subtitle={copy.market.subtitle} />

      <section className="section">
        <ReviewsSection limit={3} compact title={language === 'fr' ? 'Pourquoi les utilisateurs reviennent' : 'Why users come back'} subtitle={language === 'fr' ? 'Un rappel rapide de la perception client pour renforcer la confiance.' : 'A quick social proof reminder that reinforces trust.'} />
      </section>
    </section>
  );
}
