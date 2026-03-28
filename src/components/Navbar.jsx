import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BrandMark from './BrandMark';
import GuestBadge from './GuestBadge';

export default function Navbar() {
  const { config, copy, auth, logout, toggleTheme, setLanguage, language } = useApp();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: copy.nav.exchange },
    { to: '/transactions', label: copy.nav.transactions },
    ...(!auth.loggedIn ? [{ to: '/login', label: copy.nav.login }] : []),
  ];

  function closeMenu() {
    setOpen(false);
  }

  function handleLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    closeMenu();
  }

  return (
    <header className="nav-shell">
      <div className="container nav nav--public">
        <NavLink to="/" className="brand-link" onClick={closeMenu}>
          <BrandMark branding={config.branding} size={42} />
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
            ) : null}
          </div>
        </nav>

        <div className="nav-actions nav-actions--public">
          <GuestBadge />
          {auth.loggedIn && !auth.isGuest ? <span className="nav-account-chip">{auth.email}</span> : null}
          <div className="segmented-control" aria-label={copy.common.language}>
            <button type="button" className={language === 'fr' ? 'is-active' : ''} onClick={() => handleLanguage('fr')}>FR</button>
            <button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => handleLanguage('en')}>EN</button>
          </div>
          <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} aria-label={config.theme.mode === 'light' ? copy.common.darkMode : copy.common.lightMode}>
            {config.theme.mode === 'light' ? '☀' : '☾'}
          </button>
          {auth.loggedIn ? (
            <button type="button" className="button button--ghost button--sm" onClick={logout}>
              {copy.common.logout}
            </button>
          ) : null}
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
