import { formatCurrency, formatNumber } from '../../utils/format';
import { useApp } from '../../context/AppContext';
import PseudoQrCode from './PseudoQrCode';

function CopyRow({ label, value, onCopy, copyLabel }) {
  return (
    <div className="copy-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button type="button" className="button button--ghost button--sm" onClick={() => onCopy(value)}>
        {copyLabel}
      </button>
    </div>
  );
}

export default function ExchangeInstructionsStep({ appData, flow, asset, recipient, amountInput, estimate, reference, onBack, onConfirm, onCopy, qrPayload }) {
  const { language } = useApp();
  const paypal = appData.payments.paypal;
  const paysafecard = appData.payments.paysafecard;
  const wallet = asset ? appData.payments.cryptoWallets[asset.symbol] : null;
  const copyLabel = language === 'fr' ? 'Copier' : 'Copy';

  return (
    <div className="exchange-step">
      <div className="section-head section-head--compact">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Instructions' : 'Instructions'}</p>
          <h3>{language === 'fr' ? 'Suivez précisément les informations de règlement' : 'Follow the settlement details carefully'}</h3>
          <p className="muted">{language === 'fr' ? 'Utilisez les informations ci-dessous exactement comme indiquées pour éviter tout retard.' : 'Use the details below exactly as shown to avoid delays.'}</p>
        </div>
      </div>

      {flow.key === 'paypalToCrypto' ? (
        <div className="instruction-stack">
          <CopyRow label="PayPal" value={paypal.email} onCopy={onCopy} copyLabel={copyLabel} />
          <CopyRow label={language === 'fr' ? 'Nom du compte' : 'Account name'} value={paypal.accountName} onCopy={onCopy} copyLabel={copyLabel} />
          <CopyRow label={language === 'fr' ? 'Montant exact' : 'Exact amount'} value={estimate.formattedGrossFiat} onCopy={onCopy} copyLabel={copyLabel} />
          <CopyRow label={language === 'fr' ? 'Note de rapprochement' : 'Reference note'} value={reference} onCopy={onCopy} copyLabel={copyLabel} />
          <p className="instruction-note">{paypal.instruction}</p>
        </div>
      ) : null}

      {flow.key === 'cryptoToPaypal' ? (
        <div className="instruction-grid">
          <div className="instruction-stack">
            <CopyRow label={language === 'fr' ? 'Wallet de dépôt' : 'Deposit wallet'} value={wallet?.address || '—'} onCopy={onCopy} copyLabel={copyLabel} />
            <CopyRow label={language === 'fr' ? 'Réseau' : 'Network'} value={wallet?.network || wallet?.networkLabel || '—'} onCopy={onCopy} copyLabel={copyLabel} />
            <CopyRow label={language === 'fr' ? 'Quantité à envoyer' : 'Quantity to send'} value={`${formatNumber(amountInput, appData.exchange.roundingDigits, language)} ${asset.symbol}`} onCopy={onCopy} copyLabel={copyLabel} />
            <CopyRow label={language === 'fr' ? 'Email PayPal de réception' : 'PayPal destination email'} value={recipient} onCopy={onCopy} copyLabel={copyLabel} />
          </div>
          <div className="qr-card">
            <PseudoQrCode value={qrPayload} />
            <small>{language === 'fr' ? 'QR local généré à partir du payload de transaction.' : 'Local QR generated from the transaction payload.'}</small>
          </div>
        </div>
      ) : null}

      {flow.key === 'paysafecardToCrypto' || flow.key === 'paysafecardToPaypal' ? (
        <div className="instruction-stack">
          <CopyRow label={language === 'fr' ? 'Montant Paysafecard' : 'Paysafecard amount'} value={formatCurrency(estimate.grossFiat, 'EUR', language)} onCopy={onCopy} copyLabel={copyLabel} />
          <CopyRow label={language === 'fr' ? 'Format attendu' : 'Expected format'} value={paysafecard.codeFormat} onCopy={onCopy} copyLabel={copyLabel} />
          {flow.key === 'paysafecardToPaypal' ? <CopyRow label={language === 'fr' ? 'Email PayPal de réception' : 'PayPal destination email'} value={recipient} onCopy={onCopy} copyLabel={copyLabel} /> : null}
          {flow.key === 'paysafecardToCrypto' ? <CopyRow label={language === 'fr' ? 'Wallet de réception' : 'Receiving wallet'} value={recipient} onCopy={onCopy} copyLabel={copyLabel} /> : null}
          <p className="instruction-note">{paysafecard.instructions}</p>
          <p className="instruction-note">{paysafecard.confirmationMessage}</p>
        </div>
      ) : null}

      <div className="step-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>{language === 'fr' ? 'Retour' : 'Back'}</button>
        <button type="button" className="button button--primary" onClick={onConfirm}>{language === 'fr' ? 'J’ai effectué le paiement' : 'I have made the payment'}</button>
      </div>
    </div>
  );
}
