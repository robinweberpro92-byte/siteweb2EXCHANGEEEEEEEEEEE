import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultConfig, ROLE_PRESETS } from '../config/defaultConfig';
import { hashValue } from '../utils/hash';
import {
  STORAGE_KEYS,
  cloneValue,
  getStorageItem,
  pickSections,
  resetStorageItem,
  setStorageItem,
  generateId,
  generateGuestId,
  normalizeLanguage,
  validateEmail,
} from '../utils/storage';
import { buildReference, buildTransactionRecord, updateAnalyticsWithTransaction } from '../utils/exchange';

const CONFIG_SECTIONS = [
  'branding',
  'footer',
  'socialLinks',
  'theme',
  'payments',
  'exchange',
  'market',
  'content',
  'security',
  'adminAccess',
  'adminRoles',
  'trustIndicators',
  'guestSession',
  'ui',
];

const SESSION_DEFAULT = {
  loggedIn: false,
  sessionType: 'anonymous',
  role: 'guest',
  adminRole: '',
  email: '',
  userId: '',
  adminId: '',
  name: '',
  pinVerified: false,
  permissions: {},
  isGuest: false,
};

const GUEST_PROFILE_DEFAULT = {
  active: false,
  guestId: '',
  createdAt: '',
  updatedAt: '',
  displayName: '',
  preferredLanguage: 'fr',
  preferredTheme: 'dark',
  transactionsCount: 0,
  optionalContactMethod: '',
  optionalContactValue: '',
  status: 'ready',
};

const AppContext = createContext(null);

function updateDocumentBranding(appData, language) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = appData.theme.mode || 'dark';
  root.lang = normalizeLanguage(language);
  root.style.setProperty('--primary', appData.theme.primary || '#3B82F6');
  root.style.setProperty('--secondary', appData.theme.secondary || '#8B5CF6');
  document.title = appData.branding.siteName || 'Exchange';

  const themeMeta = document.querySelector("meta[name='theme-color']");
  if (themeMeta) {
    themeMeta.setAttribute('content', appData.theme.mode === 'light' ? '#F8FAFC' : '#0B0F17');
  }

  const href = appData.branding.faviconUrl || appData.branding.logoDataUrl || appData.branding.logoUrl || '/logo-mark.svg';
  let favicon = document.querySelector("link[rel*='icon']");
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    document.head.appendChild(favicon);
  }
  favicon.setAttribute('href', href);
}

function resolveRoleDefinition(roleKey, appData) {
  return appData.adminRoles?.[roleKey] || ROLE_PRESETS?.[roleKey] || null;
}

function resolveAdminPermissions(admin, appData) {
  const presetPermissions = resolveRoleDefinition(admin.role, appData)?.permissions || {};
  return {
    ...presetPermissions,
    ...(admin.permissions || {}),
  };
}

function buildInitialData() {
  const configDefaults = pickSections(defaultConfig, CONFIG_SECTIONS);
  const baseConfig = getStorageItem(STORAGE_KEYS.config, configDefaults);
  return {
    ...cloneValue(defaultConfig),
    ...baseConfig,
    users: getStorageItem(STORAGE_KEYS.users, defaultConfig.users),
    transactions: getStorageItem(STORAGE_KEYS.transactions, defaultConfig.transactions),
    notifications: getStorageItem(STORAGE_KEYS.notifications, defaultConfig.notifications),
    analytics: getStorageItem(STORAGE_KEYS.analytics, defaultConfig.analytics),
    objectives: getStorageItem(STORAGE_KEYS.objectives, defaultConfig.objectives),
    reviews: getStorageItem(STORAGE_KEYS.reviews, defaultConfig.reviews),
    admins: getStorageItem(STORAGE_KEYS.admins, defaultConfig.admins),
    adminLogs: getStorageItem(STORAGE_KEYS.adminLogs, defaultConfig.adminLogs),
    trustIndicators: getStorageItem(STORAGE_KEYS.trustIndicators, defaultConfig.trustIndicators),
    adminAccess: getStorageItem(STORAGE_KEYS.adminAccess, defaultConfig.adminAccess),
  };
}

function persistData(appData) {
  setStorageItem(STORAGE_KEYS.config, pickSections(appData, CONFIG_SECTIONS));
  setStorageItem(STORAGE_KEYS.users, appData.users);
  setStorageItem(STORAGE_KEYS.transactions, appData.transactions);
  setStorageItem(STORAGE_KEYS.notifications, appData.notifications);
  setStorageItem(STORAGE_KEYS.analytics, appData.analytics);
  setStorageItem(STORAGE_KEYS.objectives, appData.objectives);
  setStorageItem(STORAGE_KEYS.reviews, appData.reviews);
  setStorageItem(STORAGE_KEYS.admins, appData.admins);
  setStorageItem(STORAGE_KEYS.adminLogs, appData.adminLogs);
  setStorageItem(STORAGE_KEYS.trustIndicators, appData.trustIndicators);
  setStorageItem(STORAGE_KEYS.adminAccess, appData.adminAccess);
}

function getLocaleContent(contentByLanguage, language) {
  const normalized = normalizeLanguage(language);
  return contentByLanguage?.[normalized] || contentByLanguage?.fr || {};
}

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [appData, setAppData] = useState(defaultConfig);
  const [auth, setAuth] = useState(SESSION_DEFAULT);
  const [guestProfile, setGuestProfile] = useState(GUEST_PROFILE_DEFAULT);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const nextData = buildInitialData();
    setAppData(nextData);
    setAuth(getStorageItem(STORAGE_KEYS.session, SESSION_DEFAULT));
    setGuestProfile(getStorageItem(STORAGE_KEYS.guestSession, GUEST_PROFILE_DEFAULT));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    persistData(appData);
    updateDocumentBranding(appData, appData.ui.language);
  }, [appData, ready]);

  useEffect(() => {
    if (!ready) return;
    setStorageItem(STORAGE_KEYS.session, auth);
  }, [auth, ready]);

  useEffect(() => {
    if (!ready) return;
    setStorageItem(STORAGE_KEYS.guestSession, guestProfile);
  }, [guestProfile, ready]);

  function showToast(message, tone = 'info', duration = 3200) {
    const id = generateId('TOAST');
    setToasts((current) => [...current, { id, message, tone }]);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
    }
    return id;
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function recordAdminLog({ action, section, detail, severity = 'info', adminOverride }) {
    const sourceAdmin = adminOverride || (auth.adminId ? appData.admins.find((item) => item.id === auth.adminId) : null);
    const entry = {
      id: generateId('LOG'),
      adminId: sourceAdmin?.id || auth.adminId || '',
      email: sourceAdmin?.email || auth.email || '',
      name: sourceAdmin?.name || auth.name || '',
      role: sourceAdmin?.role || auth.adminRole || auth.role || '',
      action,
      section,
      detail,
      severity,
      at: new Date().toISOString(),
    };

    setAppData((current) => ({
      ...current,
      adminLogs: [entry, ...(current.adminLogs || [])].slice(0, 250),
    }));
    return entry;
  }

  function replaceSection(sectionKey, nextValue) {
    setAppData((current) => ({
      ...current,
      [sectionKey]: cloneValue(nextValue),
    }));
  }

  function replaceSections(nextSections) {
    setAppData((current) => ({
      ...current,
      ...cloneValue(nextSections),
    }));
  }

  function commitSections(nextSections, meta = null) {
    replaceSections(nextSections);
    if (meta && auth.role === 'admin') {
      recordAdminLog(meta);
    }
  }

  function resetSections(sectionKeys) {
    setAppData((current) => {
      const next = { ...current };
      sectionKeys.forEach((key) => {
        next[key] = cloneValue(defaultConfig[key]);
      });
      return next;
    });
  }

  function resetAppData() {
    setAppData(cloneValue(defaultConfig));
    setGuestProfile(GUEST_PROFILE_DEFAULT);
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (name === 'session' || name === 'adminDraft') return;
      resetStorageItem(key, defaultConfig[name] ?? (name === 'guestSession' ? GUEST_PROFILE_DEFAULT : undefined));
    });
    resetStorageItem(STORAGE_KEYS.session, SESSION_DEFAULT);
    setAuth(SESSION_DEFAULT);
  }

  function setLanguage(nextLanguage) {
    const normalized = normalizeLanguage(nextLanguage);
    setAppData((current) => ({
      ...current,
      ui: {
        ...current.ui,
        language: normalized,
      },
    }));
    if (guestProfile.active) {
      setGuestProfile((current) => ({
        ...current,
        preferredLanguage: normalized,
        updatedAt: new Date().toISOString(),
      }));
    }
  }

  function setThemeMode(nextMode) {
    setAppData((current) => ({
      ...current,
      theme: {
        ...current.theme,
        mode: nextMode,
      },
    }));
    if (guestProfile.active) {
      setGuestProfile((current) => ({
        ...current,
        preferredTheme: nextMode,
        updatedAt: new Date().toISOString(),
      }));
    }
  }

  function toggleTheme() {
    setThemeMode(appData.theme.mode === 'light' ? 'dark' : 'light');
  }

  async function loginAdmin(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Accès refusé.' };
    }

    const admin = (appData.admins || []).find((item) => item.email.toLowerCase() === normalizedEmail && item.status === 'active');
    if (!admin) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Accès refusé.' };
    }

    const passwordHash = await hashValue(password);
    const isValid = passwordHash === admin.passwordHash;
    if (!isValid) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Accès refusé.' };
    }

    const permissions = resolveAdminPermissions(admin, appData);
    setAuth({
      loggedIn: true,
      sessionType: 'admin',
      role: 'admin',
      adminRole: admin.role,
      email: normalizedEmail,
      userId: 'admin',
      adminId: admin.id,
      name: admin.name,
      pinVerified: !appData.adminAccess.pinEnabled,
      permissions,
      isGuest: false,
    });

    setAppData((current) => ({
      ...current,
      admins: current.admins.map((item) => (item.id === admin.id ? { ...item, lastLogin: new Date().toISOString() } : item)),
    }));

    recordAdminLog({
      action: 'login',
      section: 'security',
      detail: 'Ouverture de session administrateur',
      severity: 'info',
      adminOverride: admin,
    });
    showToast(`Session ${resolveRoleDefinition(admin.role, appData)?.label || 'admin'} ouverte.`, 'success');
    return { ok: true };
  }

  function loginUser(email) {
    if (!appData.security.loginPageEnabled) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.disabledMessage };
    }
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.userErrorMessage };
    }
    const user = appData.users.find((item) => item.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.userErrorMessage };
    }
    setAuth({
      loggedIn: true,
      sessionType: 'user',
      role: 'user',
      adminRole: '',
      email: user.email,
      userId: user.id,
      adminId: '',
      name: user.name,
      pinVerified: false,
      permissions: {},
      isGuest: false,
    });
    showToast(`Bienvenue ${user.name}.`, 'success');
    return { ok: true };
  }

  function continueAsGuest(patch = {}) {
    const now = new Date().toISOString();
    const nextProfile = {
      ...GUEST_PROFILE_DEFAULT,
      active: true,
      guestId: guestProfile.guestId || generateGuestId(),
      createdAt: guestProfile.createdAt || now,
      updatedAt: now,
      displayName: patch.displayName || guestProfile.displayName || 'Guest',
      preferredLanguage: normalizeLanguage(patch.preferredLanguage || guestProfile.preferredLanguage || appData.ui.language),
      preferredTheme: patch.preferredTheme || guestProfile.preferredTheme || appData.theme.mode,
      transactionsCount: guestProfile.transactionsCount || 0,
      optionalContactMethod: patch.optionalContactMethod ?? guestProfile.optionalContactMethod,
      optionalContactValue: patch.optionalContactValue ?? guestProfile.optionalContactValue,
      status: 'active',
    };
    setGuestProfile(nextProfile);
    setAuth({
      loggedIn: true,
      sessionType: 'guest',
      role: 'guest',
      adminRole: '',
      email: '',
      userId: nextProfile.guestId,
      adminId: '',
      name: nextProfile.displayName || 'Guest',
      pinVerified: false,
      permissions: {},
      isGuest: true,
    });
    if (nextProfile.preferredLanguage !== appData.ui.language) {
      setLanguage(nextProfile.preferredLanguage);
    }
    if (nextProfile.preferredTheme !== appData.theme.mode) {
      setThemeMode(nextProfile.preferredTheme);
    }
    showToast(getLocaleContent(appData.content, appData.ui.language).login?.guestSubtitle || 'Session invitée ouverte.', 'success');
    return nextProfile;
  }

  function updateGuestProfile(patch) {
    setGuestProfile((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  async function verifyPin(pin) {
    if (!appData.adminAccess.pinEnabled) {
      setAuth((current) => ({ ...current, pinVerified: true }));
      return { ok: true };
    }
    const pinHash = await hashValue(pin);
    if (pinHash !== appData.adminAccess.pinHash) {
      return { ok: false, message: 'PIN secondaire invalide.' };
    }
    setAuth((current) => ({ ...current, pinVerified: true }));
    return { ok: true };
  }

  function logout() {
    if (auth.role === 'admin') {
      recordAdminLog({
        action: 'logout',
        section: 'security',
        detail: 'Fermeture de session administrateur',
        severity: 'info',
      });
    }
    setAuth(SESSION_DEFAULT);
    showToast('Session fermée.', 'info');
  }

  function can(permission) {
    if (auth.role === 'admin') return Boolean(auth.permissions?.[permission]);
    return false;
  }

  function submitExchangeRequest({ flowKey, assetSymbol, recipient, amountInput, reference }) {
    const finalReference = reference || buildReference(appData);
    const transaction = buildTransactionRecord({
      appData,
      auth,
      flowKey,
      assetSymbol,
      recipient,
      amountInput,
      reference: finalReference,
    });

    setAppData((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
      analytics: updateAnalyticsWithTransaction(current.analytics, transaction),
      trustIndicators: {
        ...current.trustIndicators,
        monthlyVolume: Number(current.trustIndicators.monthlyVolume || 0) + Number(transaction.amountGross || 0),
        totalTransactions: Number(current.trustIndicators.totalTransactions || 0) + 1,
      },
    }));

    if (auth.isGuest) {
      setGuestProfile((current) => ({
        ...current,
        active: true,
        transactionsCount: Number(current.transactionsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      }));
    }

    showToast(`${getLocaleContent(appData.content, appData.ui.language).exchange?.confirmationMessage || 'Demande créée'} • ${transaction.id}`, 'success', 4600);
    return transaction;
  }

  const language = normalizeLanguage(appData.ui.language);
  const copy = useMemo(() => getLocaleContent(appData.content, language), [appData.content, language]);

  const currentUser = useMemo(
    () => appData.users.find((user) => user.email.toLowerCase() === String(auth.email || '').toLowerCase()) || null,
    [appData.users, auth.email],
  );

  const currentAdmin = useMemo(
    () => appData.admins.find((admin) => admin.id === auth.adminId || admin.email.toLowerCase() === String(auth.email || '').toLowerCase()) || null,
    [appData.admins, auth.adminId, auth.email],
  );

  const featuredReviews = useMemo(
    () => (appData.reviews || []).filter((review) => review.featured && (review.language === language || review.language === 'all')),
    [appData.reviews, language],
  );

  const visibleReviews = useMemo(
    () => (appData.reviews || []).filter((review) => review.language === language || review.language === 'all' || !review.language),
    [appData.reviews, language],
  );

  const value = useMemo(
    () => ({
      ready,
      config: appData,
      auth,
      guestProfile,
      toasts,
      language,
      copy,
      showToast,
      dismissToast,
      replaceSection,
      replaceSections,
      commitSections,
      resetSections,
      resetAppData,
      setLanguage,
      setThemeMode,
      toggleTheme,
      loginAdmin,
      loginUser,
      continueAsGuest,
      updateGuestProfile,
      verifyPin,
      logout,
      submitExchangeRequest,
      can,
      currentUser,
      currentAdmin,
      featuredReviews,
      visibleReviews,
      recordAdminLog,
      resolveAdminPermissions: (admin) => resolveAdminPermissions(admin, appData),
      resolveRoleDefinition: (roleKey) => resolveRoleDefinition(roleKey, appData),
    }),
    [
      appData,
      auth,
      ready,
      guestProfile,
      toasts,
      language,
      copy,
      currentUser,
      currentAdmin,
      featuredReviews,
      visibleReviews,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
