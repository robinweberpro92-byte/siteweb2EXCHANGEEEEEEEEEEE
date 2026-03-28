import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminShell, { SensitiveGate } from '../components/admin/AdminShell';
import { ADMIN_TABS } from '../components/admin/adminTabs';
import OverviewTab from '../components/admin/tabs/OverviewTab';
import BrandingTab from '../components/admin/tabs/BrandingTab';
import PaymentsTab from '../components/admin/tabs/PaymentsTab';
import ExchangeRulesTab from '../components/admin/tabs/ExchangeRulesTab';
import UsersTab from '../components/admin/tabs/UsersTab';
import TransactionsTab from '../components/admin/tabs/TransactionsTab';
import ReviewsTab from '../components/admin/tabs/ReviewsTab';
import NotificationsTab from '../components/admin/tabs/NotificationsTab';
import ContentTab from '../components/admin/tabs/ContentTab';
import MarketTab from '../components/admin/tabs/MarketTab';
import AnalyticsTab from '../components/admin/tabs/AnalyticsTab';
import ObjectivesTab from '../components/admin/tabs/ObjectivesTab';
import AdminsRolesTab from '../components/admin/tabs/AdminsRolesTab';
import SecurityTab from '../components/admin/tabs/SecurityTab';
import HelpCenterTab from '../components/admin/tabs/HelpCenterTab';
import LogsTab from '../components/admin/tabs/LogsTab';
import Card from '../components/Card';
import { defaultConfig } from '../config/defaultConfig';
import { useApp } from '../context/AppContext';
import { STORAGE_KEYS, cloneValue, getStorageItem, setStorageItem } from '../utils/storage';

const TAB_COMPONENTS = {
  overview: OverviewTab,
  branding: BrandingTab,
  payments: PaymentsTab,
  exchangeRules: ExchangeRulesTab,
  users: UsersTab,
  transactions: TransactionsTab,
  reviews: ReviewsTab,
  notifications: NotificationsTab,
  content: ContentTab,
  market: MarketTab,
  analytics: AnalyticsTab,
  objectives: ObjectivesTab,
  adminsRoles: AdminsRolesTab,
  security: SecurityTab,
  helpCenter: HelpCenterTab,
  logs: LogsTab,
};

export default function AdminPage() {
  const {
    ready,
    config,
    auth,
    currentAdmin,
    language,
    commitSections,
    resetAppData,
    verifyPin,
    showToast,
    logout,
    can,
    resolveRoleDefinition,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [draft, setDraft] = useState(config);
  const [pinError, setPinError] = useState('');

  const visibleTabs = useMemo(() => ADMIN_TABS.filter((tab) => can(tab.viewPermission)), [can]);

  useEffect(() => {
    if (!ready) return;
    const storedDraft = getStorageItem(STORAGE_KEYS.adminDraft, config);
    setDraft(storedDraft);
  }, [config, ready]);

  useEffect(() => {
    if (!ready) return;
    setStorageItem(STORAGE_KEYS.adminDraft, draft);
  }, [draft, ready]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0]?.key || 'overview');
    }
  }, [visibleTabs, activeTab]);

  const dirtyMap = useMemo(() => {
    return Object.fromEntries(
      ADMIN_TABS.map((tab) => [
        tab.key,
        tab.sectionKeys.some((sectionKey) => JSON.stringify(draft[sectionKey]) !== JSON.stringify(config[sectionKey])),
      ]),
    );
  }, [draft, config]);

  const unsavedCount = Object.values(dirtyMap).filter(Boolean).length;
  const activeDefinition = visibleTabs.find((tab) => tab.key === activeTab) || visibleTabs[0] || ADMIN_TABS[0];
  const ActiveComponent = TAB_COMPONENTS[activeDefinition?.key] || OverviewTab;
  const readOnly = activeDefinition ? !can(activeDefinition.editPermission) : true;
  const needsPin = config.adminAccess.pinEnabled
    && activeDefinition
    && (config.adminAccess.pinProtectedTabs || []).includes(activeDefinition.key)
    && !auth.pinVerified;
  const currentRoleLabel = resolveRoleDefinition(currentAdmin?.role)?.label || currentAdmin?.role || 'Admin';

  function changeSection(sectionKey, nextValue) {
    setDraft((current) => ({ ...current, [sectionKey]: cloneValue(nextValue) }));
  }

  function saveActiveTab() {
    if (!activeDefinition) return;
    const nextSections = activeDefinition.sectionKeys.reduce((accumulator, sectionKey) => {
      accumulator[sectionKey] = cloneValue(draft[sectionKey]);
      return accumulator;
    }, {});
    commitSections(nextSections, {
      action: `save:${activeDefinition.key}`,
      section: activeDefinition.key,
      detail: `Sauvegarde de l’onglet ${activeDefinition.label}`,
      severity: activeDefinition.sensitive ? 'warning' : 'success',
    });
    showToast(`${activeDefinition.label} sauvegardé.`, 'success');
  }

  function resetActiveTab() {
    if (!activeDefinition) return;
    setDraft((current) => {
      const next = { ...current };
      activeDefinition.sectionKeys.forEach((sectionKey) => {
        next[sectionKey] = cloneValue(defaultConfig[sectionKey]);
      });
      return next;
    });
    showToast(`${activeDefinition.label} remis aux valeurs par défaut dans le brouillon.`, 'warning');
  }

  function reloadDraft() {
    setDraft(cloneValue(config));
    showToast('Brouillon rechargé depuis les données locales.', 'info');
  }

  function resetEverything() {
    resetAppData();
    setDraft(cloneValue(defaultConfig));
    setStorageItem(STORAGE_KEYS.adminDraft, cloneValue(defaultConfig));
    showToast('Toutes les données locales ont été réinitialisées.', 'warning', 4200);
  }

  async function handlePinSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await verifyPin(formData.get('pin'));
    if (!result.ok) {
      setPinError(result.message);
      return;
    }
    setPinError('');
    showToast('Onglet sensible déverrouillé.', 'success');
  }

  if (!ready) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Chargement…</h1>
          <p className="muted">Préparation du panel et lecture des données locales.</p>
        </Card>
      </section>
    );
  }

  if (auth.role !== 'admin') {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Session administrateur requise</h1>
          <p className="muted">Connectez-vous avec un compte administrateur local pour piloter la plateforme.</p>
          <Link to="/login" className="button button--primary">Aller à la connexion</Link>
        </Card>
      </section>
    );
  }

  if (!visibleTabs.length) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Accès limité</h1>
          <p className="muted">Aucun onglet n’est autorisé pour le rôle courant.</p>
          <button type="button" className="button button--ghost" onClick={logout}>Déconnexion</button>
        </Card>
      </section>
    );
  }

  return (
    <section className="container section page-intro admin-page">
      <AdminShell
        tabs={visibleTabs}
        activeTab={activeDefinition.key}
        setActiveTab={setActiveTab}
        dirtyMap={dirtyMap}
        unsavedCount={unsavedCount}
        currentAdmin={currentAdmin}
        currentRoleLabel={currentRoleLabel}
        headerActions={(
          <>
            <button type="button" className="button button--ghost" onClick={reloadDraft}>Recharger</button>
            {can('maintenanceToggle') ? <button type="button" className="button button--danger" onClick={resetEverything}>Reset global</button> : null}
          </>
        )}
      >
        {needsPin ? (
          <SensitiveGate label={activeDefinition.label} error={pinError} onSubmit={handlePinSubmit} />
        ) : (
          <ActiveComponent
            data={draft}
            dirty={dirtyMap[activeDefinition.key]}
            onChangeSection={changeSection}
            onSave={saveActiveTab}
            onReset={resetActiveTab}
            onLogout={logout}
            onShowToast={showToast}
            onOpenTab={setActiveTab}
            currentAdmin={currentAdmin}
            currentRoleLabel={currentRoleLabel}
            readOnly={readOnly}
            language={language}
            resolveRoleDefinition={resolveRoleDefinition}
          />
        )}
      </AdminShell>
    </section>
  );
}
