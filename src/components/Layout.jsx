import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastStack from './ToastStack';
import AppLoader from './AppLoader';
import BrandMark from './BrandMark';
import AnnouncementBar from './AnnouncementBar';
import { useApp } from '../context/AppContext';

function getPageKey(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/exchange')) return 'exchange';
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/secure-access')) return 'admin';
  return pathname;
}

function notificationMatches(item, pageKey, language) {
  const languageMatch = !item.language || item.language === 'all' || item.language === language;
  const pageMatch = item.target === 'all'
    || item.target === pageKey
    || (pageKey === 'home' && item.target === 'exchange')
    || (pageKey === 'exchange' && item.target === 'home');
  return languageMatch && pageMatch;
}

function MaintenanceView({ title, message, branding }) {
  return (
    <section className="container section maintenance-screen">
      <div className="panel maintenance-card">
        <BrandMark branding={branding} size={64} />
        <p className="eyebrow">Maintenance</p>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </section>
  );
}

export default function Layout() {
  const location = useLocation();
  const shownRef = useRef(new Set());
  const [loaderVisible, setLoaderVisible] = useState(false);
  const { config, auth, ready, toasts, dismissToast, showToast, language, copy } = useApp();
  const pageKey = getPageKey(location.pathname);
  const isAdminPath = location.pathname.startsWith('/secure-access');

  const bannerNotifications = useMemo(
    () => config.notifications.items.filter((item) => item.enabled && item.display === 'banner' && notificationMatches(item, pageKey, language)),
    [config.notifications.items, pageKey, language],
  );

  useEffect(() => {
    if (!ready) return;
    setLoaderVisible(Boolean(config.ui.loaderEnabled));
  }, [ready, config.ui.loaderEnabled]);

  useEffect(() => {
    if (!ready) return;
    const toastNotifications = config.notifications.items.filter((item) => item.enabled && item.display === 'toast' && notificationMatches(item, pageKey, language));
    toastNotifications.forEach((item) => {
      const key = `${pageKey}-${language}-${item.id}`;
      if (shownRef.current.has(key)) return;
      shownRef.current.add(key);
      showToast(item.message, item.type, item.duration);
    });
  }, [config.notifications, pageKey, language, ready, showToast]);

  const adminRoutesAllowed = config.adminAccess.allowAdminDuringMaintenance && isAdminPath;
  const maintenanceEnabled = config.security.maintenanceMode && !adminRoutesAllowed && auth.role !== 'admin';

  return (
    <div className={`app-shell ${isAdminPath ? 'app-shell--admin' : ''}`}>
      <AppLoader
        branding={config.branding}
        text={config.ui.loaderText?.[language] || config.ui.loaderText?.fr}
        enabled={loaderVisible}
      />

      {!isAdminPath ? (
        <AnnouncementBar text={config.branding.announcementEnabled ? config.branding.announcementText : ''} tone={config.branding.announcementTone || 'info'} />
      ) : null}

      {!isAdminPath ? <Navbar /> : null}

      {!isAdminPath && bannerNotifications.length ? (
        <div className="notification-banners container">
          {bannerNotifications.map((item) => (
            <div key={item.id} className={`inline-banner inline-banner--${item.type || 'info'}`}>
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      <main>
        {maintenanceEnabled ? (
          <MaintenanceView
            title={config.security.maintenanceTitle || copy.maintenance.title}
            message={config.security.maintenanceMessage || copy.maintenance.message}
            branding={config.branding}
          />
        ) : (
          <Outlet />
        )}
      </main>
      {!isAdminPath ? <Footer /> : null}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
