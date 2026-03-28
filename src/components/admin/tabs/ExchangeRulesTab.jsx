import { FLOW_DEFINITIONS } from '../../../utils/exchange';
import { AdminField, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';

export default function ExchangeRulesTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const { exchange, market } = data;

  function updateExchange(patch) {
    onChangeSection('exchange', { ...exchange, ...patch });
  }

  function updateAssetFee(symbol, value) {
    updateExchange({ assetFeeOverrides: { ...exchange.assetFeeOverrides, [symbol]: Number(value || 0) } });
  }

  function updateFixedRate(flowKey, symbol, value) {
    updateExchange({
      fixedRates: {
        ...exchange.fixedRates,
        [flowKey]: { ...exchange.fixedRates[flowKey], [symbol]: Number(value || 0) },
      },
    });
  }

  function updateValidation(field, value) {
    updateExchange({
      validationMessages: { ...exchange.validationMessages, [field]: value },
    });
  }

  return (
    <div className="admin-stack">
      <AdminSection eyebrow="Règles globales" title="Frais, limites, arrondis et devise principale" description="Ces paramètres influencent l’estimation nette, les validations et les panneaux latéraux de l’exchange.">
        <div className="field-grid field-grid--4">
          <AdminField label="Frais globaux (%)"><input disabled={readOnly} type="number" min="0" step="0.1" value={exchange.globalFeePercent} onChange={(event) => updateExchange({ globalFeePercent: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Montant minimum"><input disabled={readOnly} type="number" min="0" step="1" value={exchange.minimumAmount} onChange={(event) => updateExchange({ minimumAmount: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Montant maximum"><input disabled={readOnly} type="number" min="0" step="1" value={exchange.maximumAmount} onChange={(event) => updateExchange({ maximumAmount: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Arrondi crypto"><input disabled={readOnly} type="number" min="0" step="1" value={exchange.roundingDigits} onChange={(event) => updateExchange({ roundingDigits: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Devise principale"><input disabled={readOnly} value={exchange.primaryCurrency} onChange={(event) => updateExchange({ primaryCurrency: event.target.value })} /></AdminField>
          <AdminField label="Délai estimé"><input disabled={readOnly} value={exchange.estimatedDelay} onChange={(event) => updateExchange({ estimatedDelay: event.target.value })} /></AdminField>
          <AdminField label="Avertissement exchange" className="field--full"><textarea disabled={readOnly} value={exchange.warningMessage} onChange={(event) => updateExchange({ warningMessage: event.target.value })} /></AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Overrides" title="Frais par crypto" description="Ajustez les overrides par asset pour affiner la marge par flux.">
        <div className="field-grid field-grid--4">
          {market.assets.map((asset) => (
            <AdminField key={asset.symbol} label={`Frais ${asset.symbol} (%)`}>
              <input disabled={readOnly} type="number" min="0" step="0.1" value={exchange.assetFeeOverrides[asset.symbol] ?? 0} onChange={(event) => updateAssetFee(asset.symbol, event.target.value)} />
            </AdminField>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Disponibilité" title="Combinaisons activées et mode taux fixe" description="Les cartes de la landing exchange et les étapes affichées suivent ces règles.">
        <div className="toggle-stack">
          {FLOW_DEFINITIONS.map((flow) => (
            <AdminToggle key={flow.key} label={flow.label} checked={exchange.flowAvailability[flow.key]} onChange={(checked) => updateExchange({ flowAvailability: { ...exchange.flowAvailability, [flow.key]: checked } })} disabled={readOnly} />
          ))}
          <AdminToggle label="Mode taux fixe" checked={exchange.fixedRateMode} onChange={(checked) => updateExchange({ fixedRateMode: checked })} disabled={readOnly} />
        </div>
      </AdminSection>

      <AdminSection eyebrow="Taux fixes" title="Rates par flux et par crypto" description="Utilisez ces champs si vous souhaitez forcer un pricing local plutôt que les prix du marché.">
        <div className="sub-card-grid">
          {FLOW_DEFINITIONS.filter((flow) => flow.requiresAsset).map((flow) => (
            <div key={flow.key} className="sub-card">
              <h4>{flow.label}</h4>
              <div className="field-grid field-grid--4">
                {market.assets.filter((asset) => asset.visibleInExchange).map((asset) => (
                  <AdminField key={`${flow.key}-${asset.symbol}`} label={asset.symbol}>
                    <input disabled={readOnly} type="number" min="0" step="0.0001" value={exchange.fixedRates?.[flow.key]?.[asset.symbol] ?? 0} onChange={(event) => updateFixedRate(flow.key, asset.symbol, event.target.value)} />
                  </AdminField>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Validation" title="Messages d’erreur du formulaire" description="Les messages apparaissent directement dans le moteur d’échange.">
        <div className="field-grid field-grid--2">
          <AdminField label="Montant minimum"><input disabled={readOnly} value={exchange.validationMessages.min} onChange={(event) => updateValidation('min', event.target.value)} /></AdminField>
          <AdminField label="Montant maximum"><input disabled={readOnly} value={exchange.validationMessages.max} onChange={(event) => updateValidation('max', event.target.value)} /></AdminField>
          <AdminField label="Destination manquante"><input disabled={readOnly} value={exchange.validationMessages.recipient} onChange={(event) => updateValidation('recipient', event.target.value)} /></AdminField>
          <AdminField label="Email invalide"><input disabled={readOnly} value={exchange.validationMessages.email} onChange={(event) => updateValidation('email', event.target.value)} /></AdminField>
          <AdminField label="Montant invalide"><input disabled={readOnly} value={exchange.validationMessages.amount} onChange={(event) => updateValidation('amount', event.target.value)} /></AdminField>
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} /> : null}
    </div>
  );
}
