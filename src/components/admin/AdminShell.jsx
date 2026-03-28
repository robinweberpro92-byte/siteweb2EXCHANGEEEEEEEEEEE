import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminShell({ tabs, activeTab, setActiveTab, dirtyMap, unsavedCount, headerActions, currentAdmin, currentRoleLabel, children }) {
  const activeDefinition = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <div className="admin-shell">
      <AdminSidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dirtyMap={dirtyMap}
        unsavedCount={unsavedCount}
        currentAdmin={currentAdmin}
        currentRoleLabel={currentRoleLabel}
      />
      <div className="admin-main">
        <AdminHeader
          activeTab={activeDefinition}
          dirty={dirtyMap[activeTab]}
          unsavedCount={unsavedCount}
          headerActions={headerActions}
          currentAdmin={currentAdmin}
          currentRoleLabel={currentRoleLabel}
        />
        {children}
      </div>
    </div>
  );
}

export function SensitiveGate({ label, error, onSubmit }) {
  return (
    <div className="panel sensitive-gate">
      <p className="eyebrow">PIN secondaire requis</p>
      <h2>{label}</h2>
      <p className="muted">Cette section est protégée par le PIN secondaire configuré dans l’onglet Sécurité & Accès.</p>
      <form className="field-grid" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">Code PIN</span>
          <input name="pin" type="password" inputMode="numeric" autoComplete="one-time-code" />
          {error ? <small className="field__error">{error}</small> : null}
        </label>
        <button type="submit" className="button button--primary">Déverrouiller</button>
      </form>
    </div>
  );
}
