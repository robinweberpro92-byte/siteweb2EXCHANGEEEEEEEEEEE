import { formatCurrency, formatNumber } from './format';
import { clampNumber, generateId, validateEmail } from './storage';

export const FLOW_DEFINITIONS = [
  {
    key: 'paypalToCrypto',
    label: 'PayPal → Crypto',
    paymentMethod: 'PayPal',
    receiveMethod: 'Crypto',
    recipientLabel: 'Adresse crypto de réception',
    recipientPlaceholder: 'Renseignez votre wallet de réception',
    recipientType: 'wallet',
    requiresAsset: true,
    amountInputMode: 'fiat',
    amountLabel: 'Montant envoyé via PayPal',
  },
  {
    key: 'cryptoToPaypal',
    label: 'Crypto → PayPal',
    paymentMethod: 'Crypto',
    receiveMethod: 'PayPal',
    recipientLabel: 'Adresse email PayPal de réception',
    recipientPlaceholder: 'utilisateur@paypal.com',
    recipientType: 'email',
    requiresAsset: true,
    amountInputMode: 'crypto',
    amountLabel: 'Quantité crypto envoyée',
  },
  {
    key: 'paysafecardToCrypto',
    label: 'Paysafecard → Crypto',
    paymentMethod: 'Paysafecard',
    receiveMethod: 'Crypto',
    recipientLabel: 'Adresse crypto de réception',
    recipientPlaceholder: 'Renseignez votre wallet de réception',
    recipientType: 'wallet',
    requiresAsset: true,
    amountInputMode: 'fiat',
    amountLabel: 'Montant Paysafecard',
  },
  {
    key: 'paysafecardToPaypal',
    label: 'Paysafecard → PayPal',
    paymentMethod: 'Paysafecard',
    receiveMethod: 'PayPal',
    recipientLabel: 'Adresse email PayPal de réception',
    recipientPlaceholder: 'utilisateur@paypal.com',
    recipientType: 'email',
    requiresAsset: false,
    amountInputMode: 'fiat',
    amountLabel: 'Montant Paysafecard',
  },
];

export function getFlowDefinition(flowKey) {
  return FLOW_DEFINITIONS.find((flow) => flow.key === flowKey) || FLOW_DEFINITIONS[0];
}

export function generateTransactionId() {
  return generateId('TX');
}

export function computeFees(amount, feePercent) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const safeFee = Number.isFinite(Number(feePercent)) ? Number(feePercent) : 0;
  return (safeAmount * safeFee) / 100;
}

export function computeNetAmount(amount, feePercent) {
  return Math.max(0, Number(amount || 0) - computeFees(amount, feePercent));
}

export function roundValue(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export function getExchangeAssets(appData) {
  const wallets = appData.payments.cryptoWallets || {};
  return [...(appData.market.assets || [])]
    .filter((asset) => asset.visibleInExchange && wallets[asset.symbol]?.enabled)
    .sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
}

export function getMarketAssets(appData) {
  return [...(appData.market.assets || [])]
    .filter((asset) => asset.visibleInMarket)
    .sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
}

export function getAssetRate(appData, flowKey, assetSymbol) {
  const asset = (appData.market.assets || []).find((item) => item.symbol === assetSymbol);
  if (!asset) return 0;
  if (appData.exchange.fixedRateMode) {
    const flowRates = appData.exchange.fixedRates?.[flowKey] || {};
    return Number(flowRates[assetSymbol] || asset.price || 0);
  }
  return Number(asset.price || 0);
}

export function buildReference(appData) {
  const base = String(appData.branding.shortName || 'REF').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'REF';
  return `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function estimateExchange({ appData, flowKey, assetSymbol, amountInput }) {
  const flow = getFlowDefinition(flowKey);
  const amount = Number(amountInput || 0);
  const rate = assetSymbol ? getAssetRate(appData, flowKey, assetSymbol) : 1;
  const feePercent = assetSymbol
    ? Number(appData.exchange.assetFeeOverrides?.[assetSymbol] ?? appData.exchange.globalFeePercent ?? 0)
    : Number(appData.exchange.globalFeePercent || 0);

  let grossFiat = 0;
  let netFiat = 0;
  let feeAmount = 0;
  let cryptoAmount = 0;
  let quotedPayout = 0;

  if (flow.amountInputMode === 'crypto') {
    cryptoAmount = Math.max(0, amount);
    grossFiat = cryptoAmount * rate;
    feeAmount = computeFees(grossFiat, feePercent);
    netFiat = Math.max(0, grossFiat - feeAmount);
    quotedPayout = netFiat;
  } else {
    grossFiat = Math.max(0, amount);
    feeAmount = computeFees(grossFiat, feePercent);
    netFiat = Math.max(0, grossFiat - feeAmount);
    quotedPayout = netFiat;
    if (flow.receiveMethod === 'Crypto' && rate > 0) {
      cryptoAmount = netFiat / rate;
    }
  }

  const minAmount = Number(appData.exchange.minimumAmount || 0);
  const maxAmount = Number(appData.exchange.maximumAmount || 0);
  const notionalValue = grossFiat;
  const withinMin = notionalValue >= minAmount;
  const withinMax = notionalValue <= maxAmount;

  return {
    flow,
    rate,
    feePercent,
    grossFiat,
    feeAmount,
    netFiat,
    cryptoAmount,
    quotedPayout,
    minAmount,
    maxAmount,
    withinMin,
    withinMax,
    formattedRate: assetSymbol ? `${formatCurrency(rate)} / ${assetSymbol}` : formatCurrency(rate),
    formattedGrossFiat: formatCurrency(grossFiat),
    formattedNetFiat: formatCurrency(netFiat),
    formattedFeeAmount: formatCurrency(feeAmount),
    formattedCryptoAmount: assetSymbol ? `${formatNumber(cryptoAmount, appData.exchange.roundingDigits)} ${assetSymbol}` : '—',
  };
}

export function validateExchangeStep({ appData, flowKey, stepKey, recipient, assetSymbol, amountInput }) {
  const flow = getFlowDefinition(flowKey);
  const errors = {};
  const estimate = estimateExchange({ appData, flowKey, assetSymbol, amountInput });

  if (stepKey === 'recipient') {
    if (!String(recipient || '').trim()) {
      errors.recipient = appData.exchange.validationMessages.recipient;
    } else if (flow.recipientType === 'email' && !validateEmail(recipient)) {
      errors.recipient = appData.exchange.validationMessages.email;
    }
  }

  if (stepKey === 'asset' && flow.requiresAsset && !assetSymbol) {
    errors.asset = 'Sélectionnez un actif pour poursuivre.';
  }

  if (stepKey === 'amount') {
    const numericAmount = Number(amountInput || 0);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      errors.amount = appData.exchange.validationMessages.amount;
    } else if (!estimate.withinMin) {
      errors.amount = appData.exchange.validationMessages.min;
    } else if (!estimate.withinMax) {
      errors.amount = appData.exchange.validationMessages.max;
    }
  }

  return { isValid: !Object.keys(errors).length, errors, estimate };
}

export function buildQRCodeData({ flowKey, assetSymbol, recipient, amountInput, reference, appData }) {
  const estimate = estimateExchange({ appData, flowKey, assetSymbol, amountInput });
  const flow = getFlowDefinition(flowKey);
  const lines = [
    `${flow.label}`,
    `Référence: ${reference}`,
    recipient ? `Destination: ${recipient}` : '',
    assetSymbol ? `Asset: ${assetSymbol}` : '',
    `Montant brut: ${estimate.formattedGrossFiat}`,
    `Montant net: ${estimate.formattedNetFiat}`,
    flow.amountInputMode === 'crypto' ? `Quantité: ${formatNumber(amountInput, appData.exchange.roundingDigits)} ${assetSymbol}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildTransactionRecord({ appData, auth, flowKey, assetSymbol, recipient, amountInput, reference }) {
  const estimate = estimateExchange({ appData, flowKey, assetSymbol, amountInput });
  const flow = getFlowDefinition(flowKey);
  const userName = auth.role === 'user' || auth.isGuest ? auth.name : auth.name || 'Visiteur';
  const userEmail = auth.email || recipient || `${String(auth.userId || 'visitor').toLowerCase()}@local`;
  const transactionId = generateTransactionId();

  return {
    id: transactionId,
    userId: auth.userId || auth.email || 'guest',
    userName,
    userEmail,
    flowKey,
    type: flow.label,
    paymentMethod: flow.paymentMethod === 'Crypto' ? assetSymbol : flow.paymentMethod,
    receiveMethod: flow.receiveMethod === 'Crypto' ? assetSymbol : flow.receiveMethod,
    amountGross: roundValue(estimate.grossFiat, 2),
    fees: roundValue(estimate.feeAmount, 2),
    amountNet: roundValue(estimate.netFiat, 2),
    asset: flow.receiveMethod === 'Crypto' || flow.paymentMethod === 'Crypto' ? assetSymbol : 'EUR',
    assetQuantity: roundValue(
      flow.amountInputMode === 'crypto' ? Number(amountInput || 0) : estimate.cryptoAmount,
      appData.exchange.roundingDigits,
    ),
    status: 'En attente',
    date: new Date().toISOString(),
    recipient,
    reference,
    note: auth.isGuest ? 'Créé depuis une session invitée locale.' : 'Créé depuis le parcours guidé.',
  };
}

export function updateAnalyticsWithTransaction(currentAnalytics, transaction) {
  const analytics = { ...currentAnalytics };
  analytics.volumeTotal = roundValue(Number(analytics.volumeTotal || 0) + Number(transaction.amountGross || 0), 2);
  analytics.totalTransactions = Number(analytics.totalTransactions || 0) + 1;
  analytics.averageTransaction = analytics.totalTransactions
    ? roundValue(analytics.volumeTotal / analytics.totalTransactions, 2)
    : 0;
  analytics.estimatedRevenue = roundValue(Number(analytics.estimatedRevenue || 0) + Number(transaction.fees || 0), 2);

  const assetSymbol = transaction.asset;
  analytics.topAssets = [...(analytics.topAssets || [])];
  const assetIndex = analytics.topAssets.findIndex((item) => item.symbol === assetSymbol);
  if (assetIndex >= 0) {
    analytics.topAssets[assetIndex] = {
      ...analytics.topAssets[assetIndex],
      volume: Number(analytics.topAssets[assetIndex].volume || 0) + 1,
    };
  } else if (assetSymbol && assetSymbol !== 'EUR') {
    analytics.topAssets.push({ symbol: assetSymbol, volume: 1 });
  }

  analytics.flowDistribution = [...(analytics.flowDistribution || [])];
  const flowIndex = analytics.flowDistribution.findIndex((item) => item.key === transaction.flowKey);
  if (flowIndex >= 0) {
    analytics.flowDistribution[flowIndex] = {
      ...analytics.flowDistribution[flowIndex],
      value: Number(analytics.flowDistribution[flowIndex].value || 0) + 1,
    };
  } else {
    const definition = getFlowDefinition(transaction.flowKey);
    analytics.flowDistribution.push({ key: transaction.flowKey, label: definition.label, value: 1 });
  }

  analytics.activeUsers = clampNumber(analytics.activeUsers, 0) || analytics.activeUsers;
  return analytics;
}
