import { useApp } from '../context/AppContext';

export default function GuestBadge() {
  const { auth, copy } = useApp();
  if (!auth.isGuest) return null;
  return <span className="guest-badge">{copy.common.guestSession}</span>;
}
