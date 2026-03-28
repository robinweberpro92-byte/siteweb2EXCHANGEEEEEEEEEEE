import Badge from '../Badge';

export default function AdminUnsavedBadge({ dirty }) {
  return <Badge tone={dirty ? 'warning' : 'success'}>{dirty ? 'Modifications non sauvegardées' : 'Synchronisé'}</Badge>;
}
