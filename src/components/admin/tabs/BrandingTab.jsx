import { useMemo, useState } from 'react';
import BrandMark from '../../BrandMark';
import { AdminField, AdminMetric, AdminSaveBar, AdminSection } from '../AdminFormControls';
import { fileToBase64, isLikelyUrl, validateEmail } from '../../../utils/storage';

export default function BrandingTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false, language }) {
  const { branding, footer, socialLinks, theme, trustIndicators, ui } = data;
  const [uploading, setUploading] = useState(false);

  const hasError = useMemo(() => {
    if (!branding.siteName.trim()) return true;
    if (!validateEmail(branding.supportEmail)) return true;
    if (branding.logoUrl && !isLikelyUrl(branding.logoUrl)) return true;
    if (branding.faviconUrl && !isLikelyUrl(branding.faviconUrl)) return true;
    return false;
  }, [branding]);

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file || readOnly) return;
    setUploading(true);
    try {
      const dataUrl = await fileToBase64(file);
      onChangeSection('branding', { ...branding, logoDataUrl: dataUrl });
    } finally {
      setUploading(false);
    }
  }

  function updateBranding(patch) {
    onChangeSection('branding', { ...branding, ...patch });
  }

  function updateTheme(patch) {
    onChangeSection('theme', { ...theme, ...patch });
  }

  function updateFooter(patch) {
    onChangeSection('footer', { ...footer, ...patch });
  }

  function updateSocial(patch) {
    onChangeSection('socialLinks', { ...socialLinks, ...patch });
  }

  function updateTrust(patch) {
    onChangeSection('trustIndicators', { ...trustIndicators, ...patch });
  }

  function updateUi(patch) {
    onChangeSection('ui', { ...ui, ...patch });
  }

  function updateLegalLink(index, field, nextValue) {
    const legalLinks = footer.legalLinks.map((link, currentIndex) =>
      currentIndex === index ? { ...link, [field]: nextValue } : link,
    );
    updateFooter({ legalLinks });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Volume mensuel" value={`${Math.round(trustIndicators.monthlyVolume / 1000)}k€`} helper="Trust bar" />
        <AdminMetric label="Avis affichés" value={String(data.reviews.filter((review) => review.featured).length)} helper="reviews featured" tone="success" />
        <AdminMetric label="Note moyenne" value={`${trustIndicators.averageRating.toFixed(1)}/5`} helper={`${trustIndicators.reviewCount} avis`} tone="warning" />
        <AdminMetric label="Loader" value={ui.loaderEnabled ? 'Actif' : 'Désactivé'} helper="entrée premium" tone="info" />
      </div>

      <AdminSection eyebrow="Branding" title="Identité du site" description="Logo, nom, short name, tagline et coordonnées support visibles dans toute l’application.">
        <div className="field-grid field-grid--2">
          <AdminField label="Nom du site">
            <input disabled={readOnly} value={branding.siteName} onChange={(event) => updateBranding({ siteName: event.target.value })} />
          </AdminField>
          <AdminField label="Short name">
            <input disabled={readOnly} value={branding.shortName} onChange={(event) => updateBranding({ shortName: event.target.value })} />
          </AdminField>
          <AdminField label="Tagline">
            <input disabled={readOnly} value={branding.tagline} onChange={(event) => updateBranding({ tagline: event.target.value })} />
          </AdminField>
          <AdminField label="Email support" error={branding.supportEmail && !validateEmail(branding.supportEmail) ? 'Adresse email invalide.' : ''}>
            <input disabled={readOnly} value={branding.supportEmail} onChange={(event) => updateBranding({ supportEmail: event.target.value })} />
          </AdminField>
          <AdminField label="Logo URL" error={branding.logoUrl && !isLikelyUrl(branding.logoUrl) ? 'URL ou chemin invalide.' : ''}>
            <input disabled={readOnly} value={branding.logoUrl} onChange={(event) => updateBranding({ logoUrl: event.target.value })} placeholder="https://..." />
          </AdminField>
          <AdminField label="Favicon URL" error={branding.faviconUrl && !isLikelyUrl(branding.faviconUrl) ? 'URL ou chemin invalide.' : ''}>
            <input disabled={readOnly} value={branding.faviconUrl} onChange={(event) => updateBranding({ faviconUrl: event.target.value })} placeholder="/favicon.svg" />
          </AdminField>
          <AdminField label="Upload logo" hint="Le fichier est converti en base64 et stocké dans localStorage.">
            <input disabled={readOnly} type="file" accept="image/*" onChange={handleLogoUpload} />
          </AdminField>
          <div className="preview-card">
            <span className="field__label">Prévisualisation</span>
            <div className="brand-preview">
              <BrandMark branding={branding} size={58} />
              <div>
                <strong>{branding.siteName}</strong>
                <span>{uploading ? 'Import en cours…' : branding.tagline}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Apparence" title="Palette, annonce globale et loader" description="Le thème dark reste par défaut, avec un light mode optionnel pilotable.">
        <div className="field-grid field-grid--2">
          <AdminField label="Couleur principale">
            <input disabled={readOnly} type="color" value={theme.primary} onChange={(event) => updateTheme({ primary: event.target.value })} />
          </AdminField>
          <AdminField label="Couleur secondaire">
            <input disabled={readOnly} type="color" value={theme.secondary} onChange={(event) => updateTheme({ secondary: event.target.value })} />
          </AdminField>
          <AdminField label="Mode de thème par défaut">
            <select disabled={readOnly} value={theme.mode} onChange={(event) => updateTheme({ mode: event.target.value })}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </AdminField>
          <AdminField label="Langue par défaut">
            <select disabled={readOnly} value={ui.language} onChange={(event) => updateUi({ language: event.target.value })}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </AdminField>
          <AdminField label="Annonce activée">
            <select disabled={readOnly} value={branding.announcementEnabled ? 'yes' : 'no'} onChange={(event) => updateBranding({ announcementEnabled: event.target.value === 'yes' })}>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </AdminField>
          <AdminField label="Tonalité annonce">
            <select disabled={readOnly} value={branding.announcementTone} onChange={(event) => updateBranding({ announcementTone: event.target.value })}>
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="danger">Erreur</option>
            </select>
          </AdminField>
          <AdminField label="Texte de l’annonce" className="field--full">
            <textarea disabled={readOnly} value={branding.announcementText} onChange={(event) => updateBranding({ announcementText: event.target.value })} />
          </AdminField>
          <AdminField label="Loader d’entrée activé">
            <select disabled={readOnly} value={ui.loaderEnabled ? 'yes' : 'no'} onChange={(event) => updateUi({ loaderEnabled: event.target.value === 'yes' })}>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </AdminField>
          <AdminField label="Texte loader FR">
            <input disabled={readOnly} value={ui.loaderText.fr} onChange={(event) => updateUi({ loaderText: { ...ui.loaderText, fr: event.target.value } })} />
          </AdminField>
          <AdminField label="Loader text EN">
            <input disabled={readOnly} value={ui.loaderText.en} onChange={(event) => updateUi({ loaderText: { ...ui.loaderText, en: event.target.value } })} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Trust" title="Chiffres publics crédibles" description="Ces indicateurs alimentent la trust bar, la landing, le dashboard et certains modules admin.">
        <div className="field-grid field-grid--4">
          <AdminField label="Volume mensuel"><input disabled={readOnly} type="number" min="0" step="100" value={trustIndicators.monthlyVolume} onChange={(event) => updateTrust({ monthlyVolume: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Transactions totales"><input disabled={readOnly} type="number" min="0" step="1" value={trustIndicators.totalTransactions} onChange={(event) => updateTrust({ totalTransactions: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Utilisateurs actifs"><input disabled={readOnly} type="number" min="0" step="1" value={trustIndicators.activeUsers} onChange={(event) => updateTrust({ activeUsers: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Note moyenne"><input disabled={readOnly} type="number" min="0" max="5" step="0.1" value={trustIndicators.averageRating} onChange={(event) => updateTrust({ averageRating: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Nombre d’avis"><input disabled={readOnly} type="number" min="0" step="1" value={trustIndicators.reviewCount} onChange={(event) => updateTrust({ reviewCount: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Satisfaction support %"><input disabled={readOnly} type="number" min="0" max="100" step="1" value={trustIndicators.supportSatisfaction} onChange={(event) => updateTrust({ supportSatisfaction: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Temps moyen (min)"><input disabled={readOnly} type="number" min="0" step="1" value={trustIndicators.averageProcessingMinutes} onChange={(event) => updateTrust({ averageProcessingMinutes: Number(event.target.value || 0) })} /></AdminField>
          <AdminField label="Completion rate %"><input disabled={readOnly} type="number" min="0" max="100" step="0.1" value={trustIndicators.completionRate} onChange={(event) => updateTrust({ completionRate: Number(event.target.value || 0) })} /></AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Footer" title="Footer, liens légaux et réseaux" description="Tous les liens sont éditables et persistés localement.">
        <div className="field-grid field-grid--2">
          <AdminField label="Texte du footer" className="field--full">
            <textarea disabled={readOnly} value={footer.text} onChange={(event) => updateFooter({ text: event.target.value })} />
          </AdminField>
          <AdminField label="Copyright">
            <input disabled={readOnly} value={footer.copyright} onChange={(event) => updateFooter({ copyright: event.target.value })} />
          </AdminField>
          <AdminField label="Twitter">
            <input disabled={readOnly} value={socialLinks.twitter} onChange={(event) => updateSocial({ twitter: event.target.value })} />
          </AdminField>
          <AdminField label="Telegram">
            <input disabled={readOnly} value={socialLinks.telegram} onChange={(event) => updateSocial({ telegram: event.target.value })} />
          </AdminField>
          <AdminField label="Discord">
            <input disabled={readOnly} value={socialLinks.discord} onChange={(event) => updateSocial({ discord: event.target.value })} />
          </AdminField>
          <AdminField label="LinkedIn">
            <input disabled={readOnly} value={socialLinks.linkedin} onChange={(event) => updateSocial({ linkedin: event.target.value })} />
          </AdminField>
        </div>
        <div className="field-grid field-grid--3">
          {footer.legalLinks.map((link, index) => (
            <div key={`${link.label}-${index}`} className="sub-card">
              <AdminField label={`Libellé ${index + 1}`}>
                <input disabled={readOnly} value={link.label} onChange={(event) => updateLegalLink(index, 'label', event.target.value)} />
              </AdminField>
              <AdminField label={`URL ${index + 1}`}>
                <input disabled={readOnly} value={link.url} onChange={(event) => updateLegalLink(index, 'url', event.target.value)} />
              </AdminField>
            </div>
          ))}
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} disabled={hasError} /> : null}
    </div>
  );
}
