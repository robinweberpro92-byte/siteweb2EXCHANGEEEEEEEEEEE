export const STORAGE_KEYS = {
  config: 'app_config_v1',
  users: 'app_users_v1',
  transactions: 'app_transactions_v1',
  notifications: 'app_notifications_v1',
  adminAccess: 'app_admin_access_v1',
  adminLogs: 'app_admin_logs_v1',
  admins: 'app_admins_v1',
  reviews: 'app_reviews_v1',
  objectives: 'app_objectives_v1',
  analytics: 'app_analytics_v1',
  trustIndicators: 'app_trust_indicators_v1',
  session: 'app_session_v1',
  guestSession: 'app_guest_session_v1',
  uiPrefs: 'app_ui_prefs_v1',
  adminDraft: 'app_admin_draft_v1',
};

export function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function safeJSONParse(raw, fallback = null) {
  if (typeof raw !== 'string' || !raw.trim()) {
    return cloneValue(fallback);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return cloneValue(fallback);
  }
}

export function deepMerge(defaultValue, customValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(customValue) ? cloneValue(customValue) : cloneValue(defaultValue);
  }

  if (isPlainObject(defaultValue)) {
    if (!isPlainObject(customValue)) return cloneValue(defaultValue);
    const keys = new Set([...Object.keys(defaultValue), ...Object.keys(customValue)]);
    const merged = {};
    keys.forEach((key) => {
      const hasDefault = Object.prototype.hasOwnProperty.call(defaultValue, key);
      const hasCustom = Object.prototype.hasOwnProperty.call(customValue, key);

      if (hasDefault && hasCustom) {
        merged[key] = deepMerge(defaultValue[key], customValue[key]);
        return;
      }

      if (hasCustom) {
        merged[key] = cloneValue(customValue[key]);
        return;
      }

      merged[key] = cloneValue(defaultValue[key]);
    });
    return merged;
  }

  if (customValue === undefined || customValue === null || Number.isNaN(customValue)) {
    return cloneValue(defaultValue);
  }

  return cloneValue(customValue);
}

export function initializeMissingDefaults(currentValue, defaults) {
  return deepMerge(defaults, currentValue);
}

export function getStorageItem(key, fallback) {
  if (typeof window === 'undefined') return cloneValue(fallback);
  const raw = window.localStorage.getItem(key);
  const parsed = safeJSONParse(raw, fallback);
  return initializeMissingDefaults(parsed, fallback);
}

export function setStorageItem(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mergeStorageItem(key, patch, fallback = {}) {
  const current = getStorageItem(key, fallback);
  const next = deepMerge(current, patch);
  setStorageItem(key, next);
  return next;
}

export function resetStorageItem(key, fallback) {
  if (typeof window === 'undefined') return cloneValue(fallback);
  if (fallback === undefined) {
    window.localStorage.removeItem(key);
    return null;
  }
  const next = cloneValue(fallback);
  setStorageItem(key, next);
  return next;
}

export function pickSections(source, sectionKeys) {
  return sectionKeys.reduce((accumulator, key) => {
    accumulator[key] = cloneValue(source[key]);
    return accumulator;
  }, {});
}

export function generateId(prefix = 'ID') {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export function generateGuestId() {
  return generateId('GUEST');
}

export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validatePositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export function isLikelyUrl(value) {
  const input = String(value || '').trim();
  if (!input) return false;
  if (input.startsWith('/')) return true;
  if (input.startsWith('data:image/')) return true;
  return /^https?:\/\//i.test(input);
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadCSV(filename, rows) {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(rows) || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const serialize = (cell) => {
    const value = String(cell ?? '');
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const content = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => serialize(row[header])).join(',')),
  ].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function clampNumber(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}

export function normalizeLanguage(language) {
  return String(language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export function permissionEnabled(targetPermissions = {}, permission) {
  return Boolean(targetPermissions?.[permission]);
}
