import AdminUnsavedBadge from './AdminUnsavedBadge';
import AdminToast from './AdminToast';

export default function AdminHeader({ activeTab, dirty, unsavedCount, headerActions, currentAdmin, currentRoleLabel }) {
  return (
    <div className="admin-main__header">
      <div>
        <p className="eyebrow">Administration</p>
        <h1>{activeTab.label}</h1>
        <p className="muted">{activeTab.description}</p>
      </div>
      <div className="admin-main__header-side">
        <div className="admin-main__context">
          <strong>{currentAdmin?.name}</strong>
          <span>{currentRoleLabel}</span>
        </div>
        <AdminToast message={unsavedCount ? `${unsavedCount} section(s) comportent des changements` : 'Aucune modification en attente'} tone={unsavedCount ? 'warning' : 'success'} />
        <AdminUnsavedBadge dirty={dirty} />
        <div className="admin-main__actions">{headerActions}</div>
      </div>
    </div>
  );
}
