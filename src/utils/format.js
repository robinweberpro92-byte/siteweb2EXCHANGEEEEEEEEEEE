function resolveLocale(locale) {
  if (locale) {
    return String(locale).toLowerCase().startsWith('en') ? 'en-US' : 'fr-FR';
  }
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en-US' : 'fr-FR';
  }
  return 'fr-FR';
}

export function formatCurrency(value, currency = 'EUR', locale) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: safeValue >= 100 ? 0 : 2,
  }).format(safeValue);
}

export function formatCompactNumber(value, locale) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(resolveLocale(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safeValue);
}

export function formatNumber(value, maximumFractionDigits = 2, locale) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(resolveLocale(locale), {
    maximumFractionDigits,
  }).format(safeValue);
}

export function formatPercent(value, digits = 2) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sign = safeValue > 0 ? '+' : '';
  return `${sign}${safeValue.toFixed(digits)}%`;
}

export function formatDate(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(resolveLocale(locale), { dateStyle: 'medium' }).format(date);
}

export function formatDateTime(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatInputDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function routeLabel(target) {
  const mapping = {
    all: 'Toutes les pages',
    home: 'Accueil',
    exchange: 'Exchange',
    market: 'Marché',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    login: 'Login',
  };
  return mapping[target] || target;
}

export function statusTone(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('confirm') || normalized.includes('active')) return 'success';
  if (normalized.includes('attente') || normalized.includes('cours') || normalized.includes('pending')) return 'warning';
  if (normalized.includes('rejet') || normalized.includes('suspend') || normalized.includes('inactive')) return 'danger';
  if (normalized.includes('vérifi') || normalized.includes('verifi')) return 'info';
  return 'neutral';
}

export function roleTone(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized.includes('owner') || normalized.includes('security')) return 'danger';
  if (normalized.includes('finance')) return 'success';
  if (normalized.includes('support') || normalized.includes('platform') || normalized.includes('ops')) return 'info';
  if (normalized.includes('content') || normalized.includes('marketing')) return 'secondary';
  return 'neutral';
}

export const euro = formatCurrency;
export const pct = formatPercent;
export const compact = formatCompactNumber;
