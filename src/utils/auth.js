import { hashValue } from './hash';
import { generateGuestId, generateId, normalizeLanguage } from './storage';

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isUserLoginAllowed(user) {
  const status = String(user?.status || '').toLowerCase();
  return Boolean(user) && !status.includes('suspend');
}

export function buildAdminSession({ admin, permissions, pinEnabled = false }) {
  return {
    loggedIn: true,
    sessionType: 'admin',
    role: 'admin',
    adminRole: admin.role,
    email: admin.email,
    userId: admin.id,
    adminId: admin.id,
    name: admin.name,
    pinVerified: !pinEnabled,
    permissions: permissions || {},
    isGuest: false,
  };
}

export function buildUserSession({ user }) {
  return {
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
  };
}

export function buildGuestSession({ currentProfile, language = 'fr', theme = 'dark', displayName = '' }) {
  const now = new Date().toISOString();
  return {
    active: true,
    guestId: currentProfile?.guestId || generateGuestId(),
    createdAt: currentProfile?.createdAt || now,
    updatedAt: now,
    displayName: displayName || currentProfile?.displayName || 'Guest',
    preferredLanguage: normalizeLanguage(language),
    preferredTheme: theme || currentProfile?.preferredTheme || 'dark',
    transactionsCount: Number(currentProfile?.transactionsCount || 0),
    optionalContactMethod: currentProfile?.optionalContactMethod || '',
    optionalContactValue: currentProfile?.optionalContactValue || '',
    status: 'active',
  };
}

export async function buildUserRecord({ email, password, displayName = '' }) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashValue(password);
  const now = new Date().toISOString();
  const fallbackName = normalizedEmail.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Client';
  const name = displayName.trim() || fallbackName.replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: generateId('USR'),
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    createdAt: now,
    lastLogin: now,
    balance: 0,
    status: 'Actif',
    kyc: 'Non vérifié',
    lastActivity: now,
    tag: 'Standard',
    notes: '',
  };
}

export function buildPasswordResetRequest(email, knownAccount = true) {
  return {
    id: generateId('RST'),
    email: normalizeEmail(email),
    requestedAt: new Date().toISOString(),
    status: 'pending',
    handledBy: '',
    handledAt: '',
    temporaryPasswordHash: '',
    resetCodeHash: '',
    knownAccount,
  };
}

export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let output = 'Tmp-';
  for (let index = 0; index < 8; index += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}
