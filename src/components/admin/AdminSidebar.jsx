import Badge from '../Badge';

export default function AdminSidebar({ tabs, activeTab, setActiveTab, dirtyMap, unsavedCount, currentAdmin, currentRoleLabel }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__top">
        <p className="eyebrow">Panel admin</p>
        <h2>Control center</h2>
        <p className="muted">KPI, objectifs, opérations, rôles, alertes, sécurité locale et contenus FR / EN dans une seule interface.</p>
        <div className="admin-identity">
          <strong>{currentAdmin?.name || 'Admin'}</strong>
          <span>{currentAdmin?.email}</span>
          <Badge tone="danger">{currentRoleLabel || currentAdmin?.role || 'admin'}</Badge>
        </div>
      </div>

      <div className="admin-sidebar__list">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab-button ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <div>
              <strong>{tab.label}</strong>
              <span>{tab.description}</span>
            </div>
            <div className="admin-tab-button__meta">
              {tab.sensitive ? <Badge tone="danger">PIN</Badge> : null}
              {dirtyMap[tab.key] ? <Badge tone="warning">Modifié</Badge> : null}
            </div>
          </button>
        ))}
      </div>

      <div className="admin-sidebar__bottom">
        <Badge tone={unsavedCount ? 'warning' : 'success'}>
          {unsavedCount ? `${unsavedCount} section(s) en attente` : 'Toutes les sections sont synchronisées'}
        </Badge>
      </div>
    </aside>
  );
}
