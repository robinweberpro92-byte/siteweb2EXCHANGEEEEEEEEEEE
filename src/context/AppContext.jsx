import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultConfig, ROLE_PRESETS } from '../config/defaultConfig';
import { hashValue } from '../utils/hash';
import {
  STORAGE_KEYS,
  cleanupLegacyStorage,
  cloneValue,
  getStorageItem,
  pickSections,
  resetStorageItem,
  setStorageItem,
  generateId,
  normalizeLanguage,
  validateEmail,
} from '../utils/storage';
import {
  buildAdminSession,
  buildGuestSession,
  buildPasswordResetRequest,
  buildUserRecord,
  buildUserSession,
  generateTemporaryPassword,
  isUserLoginAllowed,
  normalizeEmail,
} from '../utils/auth';
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

const PASSWORD_RESETS_DEFAULT = {
  items: [],
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

function getLocaleContent(contentByLanguage, language) {
  const normalized = normalizeLanguage(language);
  return contentByLanguage?.[normalized] || contentByLanguage?.fr || {};
}

function normalizeUsers(users = []) {
  return users.map((user) => ({
    role: 'user',
    status: 'Actif',
    balance: 0,
    kyc: 'Non vérifié',
    tag: 'Standard',
    notes: '',
    passwordHash: '',
    ...user,
  }));
}

function normalizeAdmins(admins = [], appData) {
  return admins.map((admin) => ({
    ...admin,
    permissions: resolveAdminPermissions(admin, appData),
  }));
}

function mergeAdminsWithDefaults(storedAdmins = [], appData) {
  const storedMap = new Map((storedAdmins || []).map((admin) => [normalizeEmail(admin.email), admin]));
  const mergedAdmins = (defaultConfig.admins || []).map((defaultAdmin) => {
    const storedAdmin = storedMap.get(normalizeEmail(defaultAdmin.email));
    return {
      ...defaultAdmin,
      ...(storedAdmin || {}),
    };
  });

  (storedAdmins || []).forEach((admin) => {
    const exists = mergedAdmins.some((item) => normalizeEmail(item.email) === normalizeEmail(admin.email));
    if (!exists) {
      mergedAdmins.push(admin);
    }
  });

  return normalizeAdmins(mergedAdmins, appData);
}

function removeAdminEmailsFromUsers(users = [], admins = []) {
  const adminEmails = new Set((admins || []).map((admin) => normalizeEmail(admin.email)));
  return normalizeUsers(users).filter((user) => !adminEmails.has(normalizeEmail(user.email)));
}

function buildInitialData() {
  cleanupLegacyStorage();
  const configDefaults = pickSections(defaultConfig, CONFIG_SECTIONS);
  const baseConfig = getStorageItem(STORAGE_KEYS.config, configDefaults);
  const merged = {
    ...cloneValue(defaultConfig),
    ...baseConfig,
  };

  const storedAdmins = getStorageItem(STORAGE_KEYS.admins, defaultConfig.admins);
  const admins = mergeAdminsWithDefaults(storedAdmins, merged);
  const storedUsers = getStorageItem(STORAGE_KEYS.users, defaultConfig.users);
  const users = removeAdminEmailsFromUsers(storedUsers, admins);

  return {
    ...merged,
    users,
    transactions: getStorageItem(STORAGE_KEYS.transactions, defaultConfig.transactions),
    notifications: getStorageItem(STORAGE_KEYS.notifications, defaultConfig.notifications),
    analytics: getStorageItem(STORAGE_KEYS.analytics, defaultConfig.analytics),
    objectives: getStorageItem(STORAGE_KEYS.objectives, defaultConfig.objectives),
    reviews: getStorageItem(STORAGE_KEYS.reviews, defaultConfig.reviews),
    admins,
    adminLogs: getStorageItem(STORAGE_KEYS.adminLogs, defaultConfig.adminLogs),
    trustIndicators: getStorageItem(STORAGE_KEYS.trustIndicators, defaultConfig.trustIndicators),
    adminAccess: getStorageItem(STORAGE_KEYS.adminAccess, defaultConfig.adminAccess),
    passwordResets: getStorageItem(STORAGE_KEYS.passwordResetRequests, defaultConfig.passwordResets || PASSWORD_RESETS_DEFAULT),
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
  setStorageItem(STORAGE_KEYS.passwordResetRequests, appData.passwordResets || PASSWORD_RESETS_DEFAULT);
}

function findUserByEmail(appData, email) {
  const normalizedEmail = normalizeEmail(email);
  return (appData.users || []).find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

function findAdminByEmail(appData, email) {
  const normalizedEmail = normalizeEmail(email);
  return (appData.admins || []).find((admin) => normalizeEmail(admin.email) === normalizedEmail && admin.status === 'active') || null;
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
      adminLogs: [entry, ...(current.adminLogs || [])].slice(0, 400),
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
    resetStorageItem(STORAGE_KEYS.config, pickSections(defaultConfig, CONFIG_SECTIONS));
    resetStorageItem(STORAGE_KEYS.users, defaultConfig.users);
    resetStorageItem(STORAGE_KEYS.transactions, defaultConfig.transactions);
    resetStorageItem(STORAGE_KEYS.notifications, defaultConfig.notifications);
    resetStorageItem(STORAGE_KEYS.analytics, defaultConfig.analytics);
    resetStorageItem(STORAGE_KEYS.objectives, defaultConfig.objectives);
    resetStorageItem(STORAGE_KEYS.reviews, defaultConfig.reviews);
    resetStorageItem(STORAGE_KEYS.admins, defaultConfig.admins);
    resetStorageItem(STORAGE_KEYS.adminLogs, defaultConfig.adminLogs);
    resetStorageItem(STORAGE_KEYS.trustIndicators, defaultConfig.trustIndicators);
    resetStorageItem(STORAGE_KEYS.adminAccess, defaultConfig.adminAccess);
    resetStorageItem(STORAGE_KEYS.guestSession, GUEST_PROFILE_DEFAULT);
    resetStorageItem(STORAGE_KEYS.passwordResetRequests, defaultConfig.passwordResets || PASSWORD_RESETS_DEFAULT);
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

  async function loginAccount(email, password) {
    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail) || !String(password || '').trim()) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Connexion refusée.' };
    }

    const admin = findAdminByEmail(appData, normalizedEmail);
    if (admin) {
      const passwordHash = await hashValue(password);
      if (passwordHash !== admin.passwordHash) {
        return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Connexion refusée.' };
      }

      const permissions = resolveAdminPermissions(admin, appData);
      const session = buildAdminSession({ admin, permissions, pinEnabled: appData.adminAccess.pinEnabled });
      setAuth(session);
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
      showToast(`${admin.name} connecté.`, 'success');
      return { ok: true, role: 'admin' };
    }

    const user = findUserByEmail(appData, normalizedEmail);
    if (!user || !isUserLoginAllowed(user)) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.userErrorMessage || 'Aucun compte correspondant.' };
    }

    const passwordHash = await hashValue(password);
    if (!user.passwordHash || passwordHash !== user.passwordHash) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Connexion refusée.' };
    }

    const session = buildUserSession({ user });
    setAuth(session);
    setAppData((current) => ({
      ...current,
      users: current.users.map((item) => (
        item.id === user.id
          ? { ...item, lastLogin: new Date().toISOString(), lastActivity: new Date().toISOString() }
          : item
      )),
    }));
    showToast(`${session.name} connecté.`, 'success');
    return { ok: true, role: 'user' };
  }

  async function loginAdmin(email, password) {
    const result = await loginAccount(email, password);
    return result.role === 'admin' ? result : { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.errorMessage || 'Connexion refusée.' };
  }

  async function loginUser(email, password = '') {
    const result = await loginAccount(email, password);
    return result.role === 'user' ? result : { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.userErrorMessage || 'Aucun compte correspondant.' };
  }

  async function registerAccount({ email, password, displayName = '' }) {
    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) {
      return { ok: false, message: getLocaleContent(appData.content, appData.ui.language).login?.userErrorMessage || 'Adresse email invalide.' };
    }
    if (!String(password || '').trim()) {
      return { ok: false, message: normalizeLanguage(appData.ui.language) === 'fr' ? 'Veuillez saisir un mot de passe.' : 'Please enter a password.' };
    }
    if (findUserByEmail(appData, normalizedEmail) || findAdminByEmail(appData, normalizedEmail)) {
      return { ok: false, message: normalizeLanguage(appData.ui.language) === 'fr' ? 'Un compte existe déjà avec cette adresse email.' : 'An account already exists with this email address.' };
    }

    const user = await buildUserRecord({ email: normalizedEmail, password, displayName });
    setAppData((current) => ({
      ...current,
      users: [user, ...current.users],
      trustIndicators: {
        ...current.trustIndicators,
        activeUsers: Number(current.trustIndicators.activeUsers || 0) + 1,
      },
    }));
    setAuth(buildUserSession({ user }));
    showToast(normalizeLanguage(appData.ui.language) === 'fr' ? 'Compte créé avec succès.' : 'Account created successfully.', 'success');
    return { ok: true, role: 'user', user };
  }

  function continueAsGuest(patch = {}) {
    const nextProfile = buildGuestSession({
      currentProfile: guestProfile,
      language: patch.preferredLanguage || appData.ui.language,
      theme: patch.preferredTheme || appData.theme.mode,
      displayName: patch.displayName || (normalizeLanguage(appData.ui.language) === 'fr' ? 'Invité' : 'Guest'),
    });
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

  async function requestPasswordReset(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) {
      return { ok: false, message: normalizeLanguage(appData.ui.language) === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.' };
    }

    const accountExists = Boolean(findUserByEmail(appData, normalizedEmail) || findAdminByEmail(appData, normalizedEmail));
    const request = buildPasswordResetRequest(normalizedEmail, accountExists);
    setAppData((current) => ({
      ...current,
      passwordResets: {
        items: [request, ...(current.passwordResets?.items || [])].slice(0, 200),
      },
    }));
    showToast(
      normalizeLanguage(appData.ui.language) === 'fr'
        ? 'Votre demande a été transmise au support.'
        : 'Your request has been forwarded to support.',
      'info',
      4200,
    );
    return { ok: true, request };
  }

  async function resolvePasswordResetRequest(requestId, tempPassword, adminMeta = null) {
    const request = (appData.passwordResets?.items || []).find((item) => item.id === requestId);
    if (!request) {
      return { ok: false, message: 'Demande introuvable.' };
    }

    const generatedPassword = String(tempPassword || '').trim() || generateTemporaryPassword();
    const temporaryPasswordHash = await hashValue(generatedPassword);
    const handledBy = adminMeta?.email || auth.email || '';
    const handledAt = new Date().toISOString();

    setAppData((current) => {
      const nextUsers = current.users.map((user) => (
        normalizeEmail(user.email) === request.email
          ? { ...user, passwordHash: temporaryPasswordHash, lastActivity: handledAt }
          : user
      ));
      const nextAdmins = current.admins.map((admin) => (
        normalizeEmail(admin.email) === request.email
          ? { ...admin, passwordHash: temporaryPasswordHash }
          : admin
      ));
      const nextRequests = (current.passwordResets?.items || []).map((item) => (
        item.id === requestId
          ? {
              ...item,
              status: 'resolved',
              handledBy,
              handledAt,
              temporaryPasswordHash,
            }
          : item
      ));

      return {
        ...current,
        users: nextUsers,
        admins: nextAdmins,
        passwordResets: { items: nextRequests },
      };
    });

    if (auth.role === 'admin') {
      recordAdminLog({
        action: 'resolve-reset',
        section: 'passwordResets',
        detail: `Réinitialisation traitée pour ${request.email}`,
        severity: 'warning',
      });
    }

    return { ok: true, temporaryPassword: generatedPassword };
  }

  function removePasswordResetRequest(requestId) {
    setAppData((current) => ({
      ...current,
      passwordResets: {
        items: (current.passwordResets?.items || []).filter((item) => item.id !== requestId),
      },
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
    showToast(normalizeLanguage(appData.ui.language) === 'fr' ? 'Session fermée.' : 'Signed out.', 'info');
  }

  function can(permission) {
    if (auth.role === 'admin') return Boolean(auth.permissions?.[permission]);
    return false;
  }

  function submitExchangeRequest({ flowKey, assetSymbol, recipient, amountInput, reference }) {
    let sessionForTransaction = auth;

    if (!auth.loggedIn && appData.guestSession.enabled) {
      const nextProfile = buildGuestSession({
        currentProfile: guestProfile,
        language: appData.ui.language,
        theme: appData.theme.mode,
        displayName: normalizeLanguage(appData.ui.language) === 'fr' ? 'Invité' : 'Guest',
      });
      setGuestProfile(nextProfile);
      sessionForTransaction = {
        loggedIn: true,
        sessionType: 'guest',
        role: 'guest',
        adminRole: '',
        email: '',
        userId: nextProfile.guestId,
        adminId: '',
        name: nextProfile.displayName,
        pinVerified: false,
        permissions: {},
        isGuest: true,
      };
      setAuth(sessionForTransaction);
    }

    const finalReference = reference || buildReference(appData);
    const transaction = buildTransactionRecord({
      appData,
      auth: sessionForTransaction,
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
      users: current.users.map((user) => (
        normalizeEmail(user.email) === normalizeEmail(sessionForTransaction.email)
          ? { ...user, lastActivity: transaction.date }
          : user
      )),
    }));

    if (sessionForTransaction.isGuest) {
      setGuestProfile((current) => ({
        ...current,
        active: true,
        guestId: sessionForTransaction.userId,
        displayName: current.displayName || sessionForTransaction.name,
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
    () => findUserByEmail(appData, auth.email) || null,
    [appData, auth.email],
  );

  const currentAdmin = useMemo(
    () => appData.admins.find((admin) => admin.id === auth.adminId || normalizeEmail(admin.email) === normalizeEmail(auth.email)) || null,
    [appData.admins, auth.adminId, auth.email],
  );

  const featuredReviews = useMemo(
    () => (appData.reviews || []).filter((review) => review.featured && (review.language === language || review.language === 'all')),
    [appData.reviews, language],
  );

  const visibleReviews = useMemo(
    () => (appData.reviews || []).filter((review) => review.visible !== false && (review.language === language || review.language === 'all' || !review.language)),
    [appData.reviews, language],
  );

  const pendingPasswordResets = useMemo(
    () => (appData.passwordResets?.items || []).filter((item) => item.status === 'pending'),
    [appData.passwordResets],
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
      loginAccount,
      loginAdmin,
      loginUser,
      registerAccount,
      requestPasswordReset,
      resolvePasswordResetRequest,
      removePasswordResetRequest,
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
      pendingPasswordResets,
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
      pendingPasswordResets,
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
