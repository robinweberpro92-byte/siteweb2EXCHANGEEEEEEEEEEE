import { useEffect, useMemo, useState } from 'react';
import Card from '../Card';
import { useApp } from '../../context/AppContext';
import {
  buildQRCodeData,
  buildReference,
  estimateExchange,
  getExchangeAssets,
  getFlowDefinition,
  validateExchangeStep,
} from '../../utils/exchange';
import ExchangeLandingStep from './ExchangeLandingStep';
import ExchangeRecipientStep from './ExchangeRecipientStep';
import ExchangeAssetStep from './ExchangeAssetStep';
import ExchangeAmountStep from './ExchangeAmountStep';
import ExchangeSummaryStep from './ExchangeSummaryStep';
import ExchangeInstructionsStep from './ExchangeInstructionsStep';
import ExchangeSuccessStep from './ExchangeSuccessStep';
import ExchangeSidebar from './ExchangeSidebar';
import ExchangeProgress from './ExchangeProgress';

function buildSteps(flow, language) {
  const isFr = language === 'fr';
  if (!flow) {
    return [{ key: 'landing', label: isFr ? 'Choix' : 'Choose', description: isFr ? 'Sélection du flux' : 'Select your route' }];
  }

  const steps = [
    { key: 'recipient', label: isFr ? 'Destination' : 'Destination', description: isFr ? 'Adresse ou email de réception' : 'Wallet or destination email' },
  ];
  if (flow.requiresAsset) {
    steps.push({ key: 'asset', label: isFr ? 'Crypto' : 'Crypto', description: isFr ? 'Sélection de la crypto' : 'Select the crypto' });
  }
  steps.push(
    { key: 'amount', label: isFr ? 'Montant' : 'Amount', description: isFr ? 'Montant et estimation nette' : 'Amount and net estimate' },
    { key: 'summary', label: isFr ? 'Résumé' : 'Summary', description: isFr ? 'Vérification finale' : 'Final review' },
    { key: 'instructions', label: isFr ? 'Instructions' : 'Instructions', description: isFr ? 'Coordonnées de règlement' : 'Payment details' },
    { key: 'success', label: isFr ? 'Confirmation' : 'Confirmation', description: isFr ? 'Demande enregistrée' : 'Request registered' },
  );
  return steps;
}

export default function ExchangeWorkspace({ embedded = false, hideHeader = false }) {
  const { config, auth, showToast, submitExchangeRequest, copy, guestProfile, language } = useApp();
  const assets = useMemo(() => getExchangeAssets(config), [config]);
  const [flowKey, setFlowKey] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [assetSymbol, setAssetSymbol] = useState(assets[0]?.symbol || 'BTC');
  const [amountInput, setAmountInput] = useState('');
  const [reference, setReference] = useState(buildReference(config));
  const [errors, setErrors] = useState({});
  const [transaction, setTransaction] = useState(null);

  const flow = getFlowDefinition(flowKey || 'paypalToCrypto');
  const steps = buildSteps(flowKey ? flow : null, language);
  const currentStepKey = steps[currentIndex]?.key || 'landing';
  const asset = assets.find((item) => item.symbol === assetSymbol) || assets[0] || null;
  const estimate = useMemo(
    () => estimateExchange({ appData: config, flowKey: flowKey || 'paypalToCrypto', assetSymbol: asset?.symbol, amountInput }),
    [config, flowKey, asset?.symbol, amountInput],
  );
  const qrPayload = buildQRCodeData({ flowKey: flowKey || 'paypalToCrypto', assetSymbol: asset?.symbol, recipient, amountInput, reference, appData: config });

  useEffect(() => {
    if (assets.length && !assets.some((item) => item.symbol === assetSymbol)) {
      setAssetSymbol(assets[0].symbol);
    }
  }, [assetSymbol, assets]);

  function resetFlow() {
    setFlowKey(null);
    setCurrentIndex(0);
    setRecipient('');
    setAmountInput('');
    setReference(buildReference(config));
    setErrors({});
    setTransaction(null);
  }

  function startFlow(nextFlowKey) {
    const nextFlow = getFlowDefinition(nextFlowKey);
    setFlowKey(nextFlowKey);
    setCurrentIndex(0);
    setReference(buildReference(config));
    setErrors({});
    setTransaction(null);
    setAmountInput('');
    if (nextFlow.recipientType === 'email') {
      setRecipient(auth.email || guestProfile.optionalContactValue || '');
    } else {
      setRecipient('');
    }
  }

  function nextStep() {
    const result = validateExchangeStep({ appData: config, flowKey: flowKey || 'paypalToCrypto', stepKey: currentStepKey, recipient, assetSymbol: asset?.symbol, amountInput });
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function previousStep() {
    if (currentIndex <= 0) {
      resetFlow();
      return;
    }
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function copyText(value) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(String(value || ''));
    }
    showToast(language === 'fr' ? 'Information copiée.' : 'Copied to clipboard.', 'info');
  }

  function confirmPayment() {
    const created = submitExchangeRequest({
      flowKey,
      assetSymbol: flow.requiresAsset ? asset?.symbol : null,
      recipient,
      amountInput,
      reference,
    });
    setTransaction(created);
    setCurrentIndex(steps.findIndex((step) => step.key === 'success'));
  }

  return (
    <div className={`exchange-layout ${embedded ? 'exchange-layout--embedded' : ''}`}>
      <div className="exchange-main">
        {!hideHeader ? (
          <div className="page-head page-head--exchange">
            <span className="eyebrow">{copy.nav.exchange}</span>
            <h1>{copy.exchange.title}</h1>
            <p>{copy.exchange.intro}</p>
          </div>
        ) : null}

        {flowKey ? <ExchangeProgress steps={steps} currentIndex={currentIndex} /> : null}

        <Card className="exchange-card exchange-card--workspace">
          {!flowKey ? <ExchangeLandingStep appData={config} onSelect={startFlow} /> : null}
          {flowKey && currentStepKey === 'recipient' ? (
            <ExchangeRecipientStep
              flow={flow}
              value={recipient}
              onChange={setRecipient}
              error={errors.recipient}
              onBack={previousStep}
              onNext={nextStep}
            />
          ) : null}
          {flowKey && currentStepKey === 'asset' ? (
            <ExchangeAssetStep
              assets={assets}
              value={asset?.symbol}
              onChange={setAssetSymbol}
              error={errors.asset}
              onBack={previousStep}
              onNext={nextStep}
            />
          ) : null}
          {flowKey && currentStepKey === 'amount' ? (
            <ExchangeAmountStep
              appData={config}
              flow={flow}
              asset={asset}
              value={amountInput}
              onChange={setAmountInput}
              estimate={estimate}
              error={errors.amount}
              onBack={previousStep}
              onNext={nextStep}
            />
          ) : null}
          {flowKey && currentStepKey === 'summary' ? (
            <ExchangeSummaryStep
              flow={flow}
              recipient={recipient}
              estimate={estimate}
              reference={reference}
              onBack={previousStep}
              onNext={nextStep}
            />
          ) : null}
          {flowKey && currentStepKey === 'instructions' ? (
            <ExchangeInstructionsStep
              appData={config}
              flow={flow}
              asset={asset}
              recipient={recipient}
              amountInput={amountInput}
              estimate={estimate}
              reference={reference}
              qrPayload={qrPayload}
              onBack={previousStep}
              onConfirm={confirmPayment}
              onCopy={copyText}
            />
          ) : null}
          {flowKey && currentStepKey === 'success' ? (
            <ExchangeSuccessStep appData={config} transaction={transaction} onRestart={resetFlow} />
          ) : null}
        </Card>
      </div>

      <ExchangeSidebar
        appData={config}
        flowLabel={flowKey ? copy.exchange.flowLabels[flowKey] || flow.label : (language === 'fr' ? 'Sélection' : 'Selection')}
        estimate={flowKey ? estimate : null}
      />
    </div>
  );
}
