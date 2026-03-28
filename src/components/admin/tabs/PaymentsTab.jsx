import Badge from '../../Badge';
import { AdminField, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';
import { validateEmail } from '../../../utils/storage';

export default function PaymentsTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const { payments } = data;
  const hasPaypalError = payments.paypal.enabled && !validateEmail(payments.paypal.email);

  function updatePaypal(patch) {
    onChangeSection('payments', { ...payments, paypal: { ...payments.paypal, ...patch } });
  }

  function updatePaysafecard(patch) {
    onChangeSection('payments', { ...payments, paysafecard: { ...payments.paysafecard, ...patch } });
  }

  function updateWallet(symbol, patch) {
    onChangeSection('payments', {
      ...payments,
      cryptoWallets: {
        ...payments.cryptoWallets,
        [symbol]: { ...payments.cryptoWallets[symbol], ...patch },
      },
    });
  }

  return (
    <div className="admin-stack">
      <AdminSection eyebrow="PayPal" title="Compte PayPal et messages de confirmation" description="Ces paramètres alimentent le flow PayPal → Crypto ainsi que les règlements Crypto → PayPal.">
        <div className="field-grid field-grid--2">
          <AdminField label="Email PayPal" error={hasPaypalError ? 'Adresse email invalide.' : ''}>
            <input disabled={readOnly} value={payments.paypal.email} onChange={(event) => updatePaypal({ email: event.target.value })} />
          </AdminField>
          <AdminField label="Nom du compte affiché">
            <input disabled={readOnly} value={payments.paypal.accountName} onChange={(event) => updatePaypal({ accountName: event.target.value })} />
          </AdminField>
          <AdminField label="Message après paiement" className="field--full">
            <textarea disabled={readOnly} value={payments.paypal.postPaymentMessage} onChange={(event) => updatePaypal({ postPaymentMessage: event.target.value })} />
          </AdminField>
          <AdminField label="Délai affiché">
            <input disabled={readOnly} value={payments.paypal.confirmationDelay} onChange={(event) => updatePaypal({ confirmationDelay: event.target.value })} />
          </AdminField>
          <AdminField label="Instruction personnalisée" className="field--full">
            <textarea disabled={readOnly} value={payments.paypal.instruction} onChange={(event) => updatePaypal({ instruction: event.target.value })} />
          </AdminField>
          <AdminField label="Note par défaut">
            <input disabled={readOnly} value={payments.paypal.defaultNote} onChange={(event) => updatePaypal({ defaultNote: event.target.value })} />
          </AdminField>
          <div className="toggle-stack field--full">
            <AdminToggle label="PayPal activé" checked={payments.paypal.enabled} onChange={(checked) => updatePaypal({ enabled: checked })} disabled={readOnly} />
            <AdminToggle label="Utilisable comme méthode de paiement" checked={payments.paypal.paymentEnabled} onChange={(checked) => updatePaypal({ paymentEnabled: checked })} disabled={readOnly} />
            <AdminToggle label="Utilisable comme méthode de réception" checked={payments.paypal.receiveEnabled} onChange={(checked) => updatePaypal({ receiveEnabled: checked })} disabled={readOnly} />
            <AdminToggle label="Génération automatique de note" checked={payments.paypal.autoGenerateNote} onChange={(checked) => updatePaypal({ autoGenerateNote: checked })} disabled={readOnly} />
          </div>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Paysafecard" title="Instructions et format des codes" description="Le flow Paysafecard s’appuie sur ces messages et délais.">
        <div className="field-grid field-grid--2">
          <AdminField label="Instructions" className="field--full">
            <textarea disabled={readOnly} value={payments.paysafecard.instructions} onChange={(event) => updatePaysafecard({ instructions: event.target.value })} />
          </AdminField>
          <AdminField label="Format de code attendu">
            <input disabled={readOnly} value={payments.paysafecard.codeFormat} onChange={(event) => updatePaysafecard({ codeFormat: event.target.value })} />
          </AdminField>
          <AdminField label="Message de confirmation" className="field--full">
            <textarea disabled={readOnly} value={payments.paysafecard.confirmationMessage} onChange={(event) => updatePaysafecard({ confirmationMessage: event.target.value })} />
          </AdminField>
          <AdminField label="Délai affiché">
            <input disabled={readOnly} value={payments.paysafecard.confirmationDelay} onChange={(event) => updatePaysafecard({ confirmationDelay: event.target.value })} />
          </AdminField>
          <div className="toggle-stack field--full">
            <AdminToggle label="Paysafecard activé" checked={payments.paysafecard.enabled} onChange={(checked) => updatePaysafecard({ enabled: checked })} disabled={readOnly} />
            <AdminToggle label="Utilisable comme méthode de paiement" checked={payments.paysafecard.paymentEnabled} onChange={(checked) => updatePaysafecard({ paymentEnabled: checked })} disabled={readOnly} />
          </div>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Wallets crypto" title="Adresses de réception et réseaux" description="Chaque crypto peut être activée ou désactivée pour l’échange et la réception selon sa nature.">
        <div className="asset-admin-grid">
          {Object.entries(payments.cryptoWallets).map(([symbol, wallet]) => (
            <div key={symbol} className="sub-card">
              <div className="section-head section-head--compact">
                <div>
                  <p className="eyebrow">{symbol}</p>
                  <h4>{wallet.label || symbol}</h4>
                </div>
                <Badge tone={wallet.enabled ? 'success' : 'neutral'}>{wallet.enabled ? 'Actif' : 'Off'}</Badge>
              </div>
              <div className="field-grid">
                <AdminField label="Adresse wallet">
                  <textarea disabled={readOnly} rows="3" value={wallet.address} onChange={(event) => updateWallet(symbol, { address: event.target.value })} />
                </AdminField>
                <AdminField label="Label réseau">
                  <input disabled={readOnly} value={wallet.networkLabel} onChange={(event) => updateWallet(symbol, { networkLabel: event.target.value })} />
                </AdminField>
                <AdminField label="Nom interne">
                  <input disabled={readOnly} value={wallet.label} onChange={(event) => updateWallet(symbol, { label: event.target.value })} />
                </AdminField>
                {symbol === 'USDT' ? (
                  <AdminField label="Réseau USDT">
                    <select disabled={readOnly} value={wallet.network || 'TRC20'} onChange={(event) => updateWallet(symbol, { network: event.target.value })}>
                      <option value="TRC20">TRC20</option>
                      <option value="ERC20">ERC20</option>
                    </select>
                  </AdminField>
                ) : null}
                {symbol === 'XRP' ? (
                  <AdminField label="Destination tag XRP">
                    <input disabled={readOnly} value={wallet.destinationTag || ''} onChange={(event) => updateWallet(symbol, { destinationTag: event.target.value })} />
                  </AdminField>
                ) : null}
                <div className="toggle-stack field--full">
                  <AdminToggle label="Actif" checked={wallet.enabled} onChange={(checked) => updateWallet(symbol, { enabled: checked })} disabled={readOnly} />
                  <AdminToggle label="Méthode de paiement" checked={wallet.paymentEnabled} onChange={(checked) => updateWallet(symbol, { paymentEnabled: checked })} disabled={readOnly} />
                  <AdminToggle label="Méthode de réception" checked={wallet.receiveEnabled} onChange={(checked) => updateWallet(symbol, { receiveEnabled: checked })} disabled={readOnly} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} disabled={hasPaypalError} /> : null}
    </div>
  );
}
