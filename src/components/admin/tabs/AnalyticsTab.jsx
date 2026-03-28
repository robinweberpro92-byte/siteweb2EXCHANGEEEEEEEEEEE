import { defaultConfig } from '../../../config/defaultConfig';
import { compact, euro } from '../../../utils/format';
import { AdminField, AdminMetric, AdminSaveBar, AdminSection, MiniBars } from '../AdminFormControls';

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export default function AnalyticsTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const analytics = data.analytics;

  function updateAnalytics(patch) {
    onChangeSection('analytics', { ...analytics, ...patch });
  }

  function updateTopAsset(index, value) {
    updateAnalytics({ topAssets: analytics.topAssets.map((item, currentIndex) => (currentIndex === index ? { ...item, volume: Number(value || 0) } : item)) });
  }

  function updateFlowDistribution(index, value) {
    updateAnalytics({ flowDistribution: analytics.flowDistribution.map((item, currentIndex) => (currentIndex === index ? { ...item, value: Number(value || 0) } : item)) });
  }

  function updateSentiment(key, value) {
    updateAnalytics({
      satisfactionBreakdown: {
        ...analytics.satisfactionBreakdown,
        [key]: Number(value || 0),
      },
    });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Volume total" value={euro(analytics.volumeTotal)} helper="Toutes périodes" />
        <AdminMetric label="Transactions" value={compact(analytics.totalTransactions)} helper={`${data.transactions.length} lignes locales`} tone="success" />
        <AdminMetric label="Utilisateurs actifs" value={compact(analytics.activeUsers)} helper="KPI local" tone="info" />
        <AdminMetric label="Revenus estimés" value={euro(analytics.estimatedRevenue)} helper="Projection frais" tone="warning" />
        <AdminMetric label="Completion rate" value={`${Number(analytics.completionRate || 0).toFixed(1)}%`} helper="transactions complétées" tone="success" />
        <AdminMetric label="Traitement moyen" value={`${analytics.averageProcessingMinutes} min`} helper="temps de traitement" tone="warning" />
        <AdminMetric label="Panier moyen" value={euro(analytics.averageTransaction)} helper="ticket moyen" tone="neutral" />
        <AdminMetric label="Peak hour" value={analytics.peakHour} helper="activité la plus dense" tone="info" />
      </div>

      <AdminSection eyebrow="KPI" title="Synthèse de performance" description="Ces valeurs alimentent le dashboard admin, la trust bar publique et les aperçus du produit.">
        <div className="field-grid field-grid--4">
          <AdminField label="Volume total"><input disabled={readOnly} type="number" min="0" step="1" value={analytics.volumeTotal} onChange={(event) => updateAnalytics({ volumeTotal: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Transactions"><input disabled={readOnly} type="number" min="0" step="1" value={analytics.totalTransactions} onChange={(event) => updateAnalytics({ totalTransactions: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Utilisateurs actifs"><input disabled={readOnly} type="number" min="0" step="1" value={analytics.activeUsers} onChange={(event) => updateAnalytics({ activeUsers: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Revenus estimés"><input disabled={readOnly} type="number" min="0" step="0.01" value={analytics.estimatedRevenue} onChange={(event) => updateAnalytics({ estimatedRevenue: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Panier moyen"><input disabled={readOnly} type="number" min="0" step="0.01" value={analytics.averageTransaction} onChange={(event) => updateAnalytics({ averageTransaction: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Completion rate"><input disabled={readOnly} type="number" min="0" max="100" step="0.1" value={analytics.completionRate} onChange={(event) => updateAnalytics({ completionRate: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Traitement moyen (min)"><input disabled={readOnly} type="number" min="1" step="1" value={analytics.averageProcessingMinutes} onChange={(event) => updateAnalytics({ averageProcessingMinutes: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Note moyenne"><input disabled={readOnly} type="number" min="0" max="5" step="0.1" value={analytics.averageRating} onChange={(event) => updateAnalytics({ averageRating: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Peak hour"><input disabled={readOnly} value={analytics.peakHour} onChange={(event) => updateAnalytics({ peakHour: event.target.value })} /></AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Courbes" title="Volumes sur 7 et 30 jours" description="Saisissez des suites numériques séparées par des virgules pour alimenter les aperçus graphiques locaux.">
        <div className="field-grid field-grid--2">
          <AdminField label="Volume 7 jours" className="field--full"><textarea disabled={readOnly} rows="3" value={analytics.dailyVolume7.join(', ')} onChange={(event) => updateAnalytics({ dailyVolume7: parseCsv(event.target.value) })} /></AdminField>
          <AdminField label="Volume 30 jours" className="field--full"><textarea disabled={readOnly} rows="4" value={analytics.dailyVolume30.join(', ')} onChange={(event) => updateAnalytics({ dailyVolume30: parseCsv(event.target.value) })} /></AdminField>
        </div>
        <div className="chart-preview-grid">
          <div className="chart-preview"><span>7 jours</span><MiniBars items={analytics.dailyVolume7} /></div>
          <div className="chart-preview"><span>30 jours</span><MiniBars items={analytics.dailyVolume30} /></div>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Répartition" title="Top assets, flows et satisfaction" description="Ces valeurs enrichissent l’overview admin et les modules de confiance.">
        <div className="field-grid field-grid--4">
          {analytics.topAssets.map((item, index) => (
            <AdminField key={`${item.symbol}-${index}`} label={`Top ${item.symbol}`}><input disabled={readOnly} type="number" min="0" step="1" value={item.volume} onChange={(event) => updateTopAsset(index, event.target.value)} /></AdminField>
          ))}
        </div>
        <div className="field-grid field-grid--4">
          {analytics.flowDistribution.map((item, index) => (
            <AdminField key={`${item.key}-${index}`} label={item.label}><input disabled={readOnly} type="number" min="0" step="1" value={item.value} onChange={(event) => updateFlowDistribution(index, event.target.value)} /></AdminField>
          ))}
        </div>
        <div className="field-grid field-grid--3">
          <AdminField label="Satisfaction positive"><input disabled={readOnly} type="number" min="0" max="100" step="1" value={analytics.satisfactionBreakdown?.positive || 0} onChange={(event) => updateSentiment('positive', event.target.value)} /></AdminField>
          <AdminField label="Satisfaction mixte"><input disabled={readOnly} type="number" min="0" max="100" step="1" value={analytics.satisfactionBreakdown?.mixed || 0} onChange={(event) => updateSentiment('mixed', event.target.value)} /></AdminField>
          <AdminField label="Feedback critique"><input disabled={readOnly} type="number" min="0" max="100" step="1" value={analytics.satisfactionBreakdown?.critical || 0} onChange={(event) => updateSentiment('critical', event.target.value)} /></AdminField>
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} saveLabel="Sauvegarder les analytics" /> : null}
      {!readOnly ? (
        <div className="step-actions">
          <button type="button" className="button button--ghost" onClick={() => onChangeSection('analytics', defaultConfig.analytics)}>
            Réinitialiser les analytics
          </button>
        </div>
      ) : null}
    </div>
  );
}
