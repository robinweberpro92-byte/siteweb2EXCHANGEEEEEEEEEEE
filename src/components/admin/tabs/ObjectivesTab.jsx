import { AdminField, AdminMetric, AdminSaveBar, AdminSection } from '../AdminFormControls';
import { compact, euro } from '../../../utils/format';

function progressValue(current, target, inverse = false) {
  const safeTarget = Math.max(Number(target || 0), 1);
  const safeCurrent = Math.max(Number(current || 0), 0.0001);
  const ratio = inverse ? safeTarget / safeCurrent : safeCurrent / safeTarget;
  return Math.max(0, Math.min(100, ratio * 100));
}

export default function ObjectivesTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const objectives = data.objectives;
  const analytics = data.analytics;
  const currentConversion = Number(((Number(analytics.totalTransactions || 0) / Math.max(Number(analytics.activeUsers || 1), 1)) * 100).toFixed(1));

  function updateObjectives(patch) {
    onChangeSection('objectives', { ...objectives, ...patch });
  }

  const cards = [
    {
      label: 'Volume mensuel',
      current: analytics.volumeTotal,
      target: objectives.volumeTarget,
      format: (value) => euro(value),
      key: 'volumeTarget',
    },
    {
      label: 'Transactions',
      current: analytics.totalTransactions,
      target: objectives.transactionTarget,
      format: (value) => compact(value),
      key: 'transactionTarget',
    },
    {
      label: 'Utilisateurs actifs',
      current: analytics.activeUsers,
      target: objectives.userTarget,
      format: (value) => compact(value),
      key: 'userTarget',
    },
    {
      label: 'Satisfaction',
      current: analytics.averageRating,
      target: objectives.satisfactionTarget,
      format: (value) => `${Number(value || 0).toFixed(1)}/5`,
      key: 'satisfactionTarget',
    },
    {
      label: 'Traitement moyen',
      current: analytics.averageProcessingMinutes,
      target: objectives.processingTimeTarget,
      format: (value) => `${value} min`,
      key: 'processingTimeTarget',
      inverse: true,
    },
    {
      label: 'Conversion',
      current: currentConversion,
      target: objectives.conversionTarget,
      format: (value) => `${Number(value || 0).toFixed(1)}%`,
      key: 'conversionTarget',
    },
  ];

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        {cards.slice(0, 4).map((item) => (
          <AdminMetric key={item.key} label={item.label} value={item.format(item.target)} helper={`Actuel ${item.format(item.current)}`} tone={progressValue(item.current, item.target, item.inverse) >= 100 ? 'success' : 'warning'} />
        ))}
      </div>

      <AdminSection eyebrow="Cibles" title="Objectifs mensuels" description="Définissez des cibles crédibles et suivez immédiatement la progression calculée sur les données analytics.">
        <div className="field-grid field-grid--3">
          <AdminField label="Objectif volume"><input disabled={readOnly} type="number" min="0" step="1000" value={objectives.volumeTarget} onChange={(event) => updateObjectives({ volumeTarget: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Objectif transactions"><input disabled={readOnly} type="number" min="0" step="1" value={objectives.transactionTarget} onChange={(event) => updateObjectives({ transactionTarget: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Objectif utilisateurs"><input disabled={readOnly} type="number" min="0" step="1" value={objectives.userTarget} onChange={(event) => updateObjectives({ userTarget: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Objectif satisfaction"><input disabled={readOnly} type="number" min="0" max="5" step="0.1" value={objectives.satisfactionTarget} onChange={(event) => updateObjectives({ satisfactionTarget: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Objectif délai moyen (min)"><input disabled={readOnly} type="number" min="1" step="1" value={objectives.processingTimeTarget} onChange={(event) => updateObjectives({ processingTimeTarget: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Objectif conversion (%)"><input disabled={readOnly} type="number" min="0" step="0.1" value={objectives.conversionTarget} onChange={(event) => updateObjectives({ conversionTarget: Number(event.target.value || 0) })} /></AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Progression" title="Rythme actuel" description="Lecture visuelle simple pour savoir si la trajectoire du mois est atteignable.">
        <div className="objective-grid">
          {cards.map((item) => {
            const progress = progressValue(item.current, item.target, item.inverse);
            return (
              <div key={item.key} className="objective-card">
                <div className="objective-card__head">
                  <strong>{item.label}</strong>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="objective-card__values">
                  <span>{item.format(item.current)}</span>
                  <span>{item.format(item.target)}</span>
                </div>
                <div className="progress-inline"><span style={{ width: `${progress}%` }} /></div>
              </div>
            );
          })}
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} saveLabel="Sauvegarder les objectifs" /> : null}
    </div>
  );
}
