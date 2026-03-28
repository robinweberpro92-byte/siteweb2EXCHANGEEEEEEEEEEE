import Badge from '../../Badge';
import { AdminMetric, AdminSection, AdminEmptyState } from '../AdminFormControls';
import { compact, euro, formatDateTime } from '../../../utils/format';

function objectiveProgress(current, target, inverse = false) {
  const safeTarget = Math.max(Number(target || 0), 1);
  const safeCurrent = Math.max(Number(current || 0), 0);
  let ratio = inverse ? safeTarget / Math.max(safeCurrent, 1) : safeCurrent / safeTarget;
  if (!Number.isFinite(ratio)) ratio = 0;
  const percent = Math.max(0, Math.min(100, ratio * 100));
  return Math.round(percent);
}

function buildAlerts(data) {
  const alerts = [];
  const logoConfigured = Boolean(data.branding.logoUrl || data.branding.logoDataUrl);
  if (!logoConfigured) {
    alerts.push({ id: 'branding-logo', tone: 'warning', title: 'Logo manquant', detail: 'Ajoutez un logo URL ou upload pour renforcer la crédibilité du produit.', target: 'branding' });
  }
  if (!data.branding.faviconUrl && !logoConfigured) {
    alerts.push({ id: 'branding-favicon', tone: 'info', title: 'Favicon non défini', detail: 'Définissez une favicon pour finaliser l’identité du site.', target: 'branding' });
  }
  const walletCount = Object.values(data.payments.cryptoWallets || {}).filter((wallet) => wallet.enabled && wallet.address).length;
  if (walletCount < 3) {
    alerts.push({ id: 'wallet-count', tone: 'warning', title: 'Configuration wallets incomplète', detail: 'Moins de trois wallets crypto actifs sont actuellement configurés.', target: 'payments' });
  }
  if (!data.payments.paypal?.email) {
    alerts.push({ id: 'paypal', tone: 'warning', title: 'Email PayPal manquant', detail: 'Le flux PayPal nécessite une adresse de règlement visible dans les instructions.', target: 'payments' });
  }
  if (!data.admins.some((admin) => admin.status === 'active' && admin.role !== 'owner')) {
    alerts.push({ id: 'admins-secondary', tone: 'danger', title: 'Aucun admin secondaire actif', detail: 'Ajoutez au moins un autre admin pour éviter un point de défaillance unique.', target: 'adminsRoles' });
  }
  const featuredReviews = data.reviews.filter((review) => review.featured && review.visible !== false).length;
  if (featuredReviews < 3) {
    alerts.push({ id: 'reviews-featured', tone: 'warning', title: 'Preuve sociale limitée', detail: 'Mettez en avant au moins trois avis pour renforcer la landing et le login.', target: 'reviews' });
  }
  if (!data.content?.en?.home?.heroTitle || !data.content?.en?.login?.title) {
    alerts.push({ id: 'content-en', tone: 'warning', title: 'Contenus EN incomplets', detail: 'Complétez les contenus anglais pour une expérience bilingue cohérente.', target: 'content' });
  }
  if (data.security.maintenanceMode) {
    alerts.push({ id: 'maintenance', tone: 'danger', title: 'Maintenance active', detail: 'Le site public est actuellement remplacé par l’écran de maintenance.', target: 'security' });
  }
  const longPending = data.transactions.filter((transaction) => transaction.status === 'En attente').length;
  if (longPending >= 2) {
    alerts.push({ id: 'pending', tone: 'info', title: 'Dossiers en attente', detail: `${longPending} transactions restent en attente dans la base locale.`, target: 'transactions' });
  }
  if (!data.security.loginPageEnabled) {
    alerts.push({ id: 'login-disabled', tone: 'info', title: 'Login public désactivé', detail: 'Seul le mode invité et/ou admin reste disponible tant que la page login public est coupée.', target: 'security' });
  }
  const pendingResets = (data.passwordResets?.items || []).filter((item) => item.status === 'pending').length;
  if (pendingResets) {
    alerts.push({ id: 'password-resets', tone: 'warning', title: 'Demandes de reset à traiter', detail: `${pendingResets} demande(s) de mot de passe oublié attendent une action.`, target: 'passwordResets' });
  }
  return alerts;
}

export default function OverviewTab({ data, currentRoleLabel, onOpenTab }) {
  const alerts = buildAlerts(data);
  const recentLogs = (data.adminLogs || []).slice(0, 6);
  const currentConversion = Number(((Number(data.analytics.totalTransactions || 0) / Math.max(Number(data.analytics.activeUsers || 1), 1)) * 100).toFixed(1));

  const objectiveCards = [
    { key: 'volume', label: 'Volume mensuel', current: data.analytics.volumeTotal, target: data.objectives.volumeTarget, format: (value) => euro(value) },
    { key: 'transactions', label: 'Transactions', current: data.analytics.totalTransactions, target: data.objectives.transactionTarget, format: (value) => compact(value) },
    { key: 'users', label: 'Utilisateurs actifs', current: data.analytics.activeUsers, target: data.objectives.userTarget, format: (value) => compact(value) },
    { key: 'satisfaction', label: 'Satisfaction', current: data.analytics.averageRating, target: data.objectives.satisfactionTarget, format: (value) => `${Number(value || 0).toFixed(1)}/5` },
    { key: 'processing', label: 'Traitement moyen', current: data.analytics.averageProcessingMinutes, target: data.objectives.processingTimeTarget, format: (value) => `${value} min`, inverse: true },
    { key: 'conversion', label: 'Conversion', current: currentConversion, target: data.objectives.conversionTarget, format: (value) => `${Number(value || 0).toFixed(1)}%` },
  ];

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Volume total" value={euro(data.analytics.volumeTotal)} helper="Tous canaux" />
        <AdminMetric label="Transactions" value={compact(data.analytics.totalTransactions)} helper="Base locale" tone="success" />
        <AdminMetric label="Utilisateurs actifs" value={compact(data.analytics.activeUsers)} helper="Dernière projection" tone="info" />
        <AdminMetric label="Revenus estimés" value={euro(data.analytics.estimatedRevenue)} helper="Frais cumulés" tone="warning" />
        <AdminMetric label="Completion rate" value={`${Number(data.analytics.completionRate || 0).toFixed(1)}%`} helper="Performance opérationnelle" tone="success" />
        <AdminMetric label="Temps moyen" value={`${data.analytics.averageProcessingMinutes} min`} helper="Traitement moyen" tone="warning" />
        <AdminMetric label="Note moyenne" value={`${Number(data.trustIndicators.averageRating || 0).toFixed(1)}/5`} helper={`${compact(data.trustIndicators.reviewCount)} avis`} tone="info" />
        <AdminMetric label="Admin connecté" value={currentRoleLabel || 'Admin'} helper="Rôle actif" tone="danger" />
        <AdminMetric label="Resets en attente" value={String((data.passwordResets?.items || []).filter((item) => item.status === 'pending').length)} helper="support" tone="warning" />
      </div>

      <AdminSection
        eyebrow="Pilotage"
        title="Quick actions"
        description="Raccourcis vers les sections les plus sollicitées au quotidien."
      >
        <div className="quick-actions-grid">
          <button type="button" className="button button--primary" onClick={() => onOpenTab?.('notifications')}>Créer une annonce</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('transactions')}>Ajouter une transaction</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('users')}>Ajouter un utilisateur</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('adminsRoles')}>Ajouter un admin</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('security')}>Accès & maintenance</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('passwordResets')}>Traiter les resets</button>
          <button type="button" className="button button--ghost" onClick={() => onOpenTab?.('analytics')}>Voir les analytics</button>
        </div>
      </AdminSection>

      <div className="admin-grid admin-grid--split">
        <AdminSection
          eyebrow="Objectives"
          title="Suivi des objectifs"
          description="Visualisation immédiate du rythme atteint par rapport aux objectifs configurés."
        >
          <div className="objective-grid">
            {objectiveCards.map((item) => {
              const progress = objectiveProgress(item.current, item.target, item.inverse);
              return (
                <div key={item.key} className="objective-card">
                  <div className="objective-card__head">
                    <strong>{item.label}</strong>
                    <Badge tone={progress >= 100 ? 'success' : progress >= 75 ? 'warning' : 'danger'}>{progress}%</Badge>
                  </div>
                  <div className="objective-card__values">
                    <span>{item.format(item.current)}</span>
                    <span>{item.format(item.target)}</span>
                  </div>
                  <div className="progress-inline">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminSection>

        <AdminSection
          eyebrow="Alert center"
          title="Alertes & points d’attention"
          description="Ce panneau permet de repérer immédiatement les zones incomplètes ou sensibles."
        >
          {alerts.length ? (
            <div className="alert-grid">
              {alerts.map((alert) => (
                <button key={alert.id} type="button" className={`alert-card alert-card--${alert.tone}`} onClick={() => onOpenTab?.(alert.target)}>
                  <div className="alert-card__head">
                    <Badge tone={alert.tone}>{alert.tone}</Badge>
                    <span>{alert.target}</span>
                  </div>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </button>
              ))}
            </div>
          ) : (
            <AdminEmptyState title="Aucune alerte critique" description="La configuration actuelle est cohérente sur les principaux points de contrôle." />
          )}
        </AdminSection>
      </div>

      <AdminSection
        eyebrow="Activity"
        title="Actions récentes"
        description="Historique local des dernières opérations administrateur."
        actions={<button type="button" className="button button--ghost button--sm" onClick={() => onOpenTab?.('logs')}>Ouvrir les logs</button>}
      >
        {recentLogs.length ? (
          <div className="list-stack">
            {recentLogs.map((entry) => (
              <div key={entry.id} className="list-row list-row--panel">
                <div className="list-row__main">
                  <div className="list-row__head">
                    <div className="inline-badges">
                      <Badge tone={entry.severity || 'info'}>{entry.severity || 'info'}</Badge>
                      <Badge tone="neutral">{entry.section}</Badge>
                    </div>
                    <strong>{entry.action}</strong>
                    <span>{entry.name || entry.email || 'Admin'} • {formatDateTime(entry.at)}</span>
                  </div>
                  {entry.detail ? <p className="muted">{entry.detail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState title="Aucune action enregistrée" description="Les futures connexions, sauvegardes et changements sensibles seront visibles ici." />
        )}
      </AdminSection>
    </div>
  );
}
