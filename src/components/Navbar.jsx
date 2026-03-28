import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BrandMark from './BrandMark';
import Badge from './Badge';

export default function Navbar() {
  const { config, copy, auth, logout, toggleTheme, setLanguage, language, currentAdmin } = useApp();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: copy.nav.home },
    { to: '/exchange', label: copy.nav.exchange },
    { to: '/market', label: copy.nav.market },
    { to: '/dashboard', label: copy.nav.dashboard },
    { to: '/transactions', label: copy.nav.transactions },
    { to: '/admin', label: copy.nav.admin },
  ];

  function handleLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setOpen(false);
  }

  function closeMenu() {
    setOpen(false);
  }

  const sessionBadge = auth.isGuest
    ? { tone: 'warning', label: copy.common.guestSession }
    : auth.role === 'admin'
      ? { tone: 'danger', label: currentAdmin ? currentAdmin.role : 'Admin' }
      : auth.role === 'user'
        ? { tone: 'info', label: 'User' }
        : null;

  return (
    <header className="nav-shell">
      <div className="container nav">
        <NavLink to="/" className="brand-link" onClick={closeMenu}>
          <BrandMark branding={config.branding} size={44} />
          <div className="brand-link__text">
            <strong>{config.branding.siteName}</strong>
            <span>{config.branding.tagline}</span>
          </div>
        </NavLink>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          <div className="nav-mobile-extras">
            <div className="segmented-control" aria-label={copy.common.language}>
              <button type="button" className={language === 'fr' ? 'is-active' : ''} onClick={() => handleLanguage('fr')}>FR</button>
              <button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => handleLanguage('en')}>EN</button>
            </div>
            <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label={config.theme.mode === 'light' ? copy.common.darkMode : copy.common.lightMode}>
              {config.theme.mode === 'light' ? '☀' : '☾'}
            </button>
            {auth.loggedIn ? (
              <button type="button" className="button button--ghost button--sm" onClick={() => { logout(); closeMenu(); }}>
                {copy.common.logout}
              </button>
            ) : (
              <NavLink to="/login" className="button button--ghost button--sm" onClick={closeMenu}>
                {copy.common.login}
              </NavLink>
            )}
            <NavLink to="/exchange" className="button button--primary button--sm" onClick={closeMenu}>
              {copy.common.openExchange}
            </NavLink>
          </div>
        </nav>

        <div className="nav-actions">
          <div className="segmented-control" aria-label={copy.common.language}>
            <button type="button" className={language === 'fr' ? 'is-active' : ''} onClick={() => handleLanguage('fr')}>FR</button>
            <button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => handleLanguage('en')}>EN</button>
          </div>
          <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label={config.theme.mode === 'light' ? copy.common.darkMode : copy.common.lightMode}>
            {config.theme.mode === 'light' ? '☀' : '☾'}
          </button>
          {auth.loggedIn ? (
            <div className="nav-user">
              <span>{auth.name || auth.email}</span>
              {sessionBadge ? <Badge tone={sessionBadge.tone}>{sessionBadge.label}</Badge> : null}
            </div>
          ) : null}
          {auth.loggedIn ? (
            <button type="button" className="button button--ghost button--sm" onClick={logout}>
              {copy.common.logout}
            </button>
          ) : (
            <NavLink to="/login" className="button button--ghost button--sm">
              {copy.common.login}
            </NavLink>
          )}
          <NavLink to="/exchange" className="button button--primary button--sm">
            {copy.common.openExchange}
          </NavLink>
          <button
            type="button"
            className={`nav-burger ${open ? 'is-open' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
