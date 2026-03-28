import { useState } from 'react';
import { AdminField, AdminSaveBar, AdminSection } from '../AdminFormControls';

export default function ContentTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const [locale, setLocale] = useState('fr');
  const content = data.content[locale];

  function updateLocaleSection(sectionKey, patch) {
    onChangeSection('content', {
      ...data.content,
      [locale]: {
        ...data.content[locale],
        [sectionKey]: {
          ...data.content[locale][sectionKey],
          ...patch,
        },
      },
    });
  }

  function updateReason(index, field, value) {
    const reasons = content.home.reasons.map((item, currentIndex) => (currentIndex === index ? { ...item, [field]: value } : item));
    updateLocaleSection('home', { reasons });
  }

  function updateStep(index, field, value) {
    const steps = content.home.steps.map((item, currentIndex) => (currentIndex === index ? { ...item, [field]: value } : item));
    updateLocaleSection('home', { steps });
  }

  function updateFaq(index, field, value) {
    const faq = content.home.faq.map((item, currentIndex) => (currentIndex === index ? { ...item, [field]: value } : item));
    updateLocaleSection('home', { faq });
  }

  function updateFlowLabel(key, value) {
    updateLocaleSection('exchange', {
      flowLabels: {
        ...content.exchange.flowLabels,
        [key]: value,
      },
    });
  }

  return (
    <div className="admin-stack">
      <AdminSection eyebrow="Locale" title="Contenus FR / EN" description="Pilotez les textes publics sans casser la structure des pages ni le responsive.">
        <div className="field-grid field-grid--3">
          <AdminField label="Langue en cours">
            <select value={locale} onChange={(event) => setLocale(event.target.value)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection eyebrow="Home" title="Hero, raisons, étapes et FAQ" description="Ces textes structurent la landing et doivent rester courts, crédibles et orientés action.">
        <div className="field-grid field-grid--2">
          <AdminField label="Hero title" className="field--full"><textarea disabled={readOnly} value={content.home.heroTitle} onChange={(event) => updateLocaleSection('home', { heroTitle: event.target.value })} /></AdminField>
          <AdminField label="Hero subtitle" className="field--full"><textarea disabled={readOnly} value={content.home.heroSubtitle} onChange={(event) => updateLocaleSection('home', { heroSubtitle: event.target.value })} /></AdminField>
          <AdminField label="CTA principal"><input disabled={readOnly} value={content.home.primaryCta} onChange={(event) => updateLocaleSection('home', { primaryCta: event.target.value })} /></AdminField>
          <AdminField label="CTA secondaire"><input disabled={readOnly} value={content.home.secondaryCta} onChange={(event) => updateLocaleSection('home', { secondaryCta: event.target.value })} /></AdminField>
          <AdminField label="Trust badge" className="field--full"><input disabled={readOnly} value={content.home.trustBadge} onChange={(event) => updateLocaleSection('home', { trustBadge: event.target.value })} /></AdminField>
        </div>
        <div className="sub-card-grid">
          {content.home.reasons.map((item, index) => (
            <div key={`${item.title}-${index}`} className="sub-card">
              <AdminField label={`Raison ${index + 1} — titre`}><input disabled={readOnly} value={item.title} onChange={(event) => updateReason(index, 'title', event.target.value)} /></AdminField>
              <AdminField label={`Raison ${index + 1} — texte`}><textarea disabled={readOnly} value={item.text} onChange={(event) => updateReason(index, 'text', event.target.value)} /></AdminField>
            </div>
          ))}
        </div>
        <div className="sub-card-grid">
          {content.home.steps.map((item, index) => (
            <div key={`${item.title}-${index}`} className="sub-card">
              <AdminField label={`Étape ${index + 1} — titre`}><input disabled={readOnly} value={item.title} onChange={(event) => updateStep(index, 'title', event.target.value)} /></AdminField>
              <AdminField label={`Étape ${index + 1} — texte`}><textarea disabled={readOnly} value={item.text} onChange={(event) => updateStep(index, 'text', event.target.value)} /></AdminField>
            </div>
          ))}
        </div>
        <div className="sub-card-grid">
          {content.home.faq.map((item, index) => (
            <div key={`${item.question}-${index}`} className="sub-card">
              <AdminField label={`FAQ ${index + 1} — question`}><input disabled={readOnly} value={item.question} onChange={(event) => updateFaq(index, 'question', event.target.value)} /></AdminField>
              <AdminField label={`FAQ ${index + 1} — réponse`}><textarea disabled={readOnly} value={item.answer} onChange={(event) => updateFaq(index, 'answer', event.target.value)} /></AdminField>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Exchange" title="Intro, avertissements et labels de flux" description="Le flow doit rester professionnel et explicite sur tous les écrans.">
        <div className="field-grid field-grid--2">
          <AdminField label="Titre exchange"><input disabled={readOnly} value={content.exchange.title} onChange={(event) => updateLocaleSection('exchange', { title: event.target.value })} /></AdminField>
          <AdminField label="Intro" className="field--full"><textarea disabled={readOnly} value={content.exchange.intro} onChange={(event) => updateLocaleSection('exchange', { intro: event.target.value })} /></AdminField>
          <AdminField label="Warning" className="field--full"><textarea disabled={readOnly} value={content.exchange.warning} onChange={(event) => updateLocaleSection('exchange', { warning: event.target.value })} /></AdminField>
          <AdminField label="Confirmation finale"><input disabled={readOnly} value={content.exchange.confirmationMessage} onChange={(event) => updateLocaleSection('exchange', { confirmationMessage: event.target.value })} /></AdminField>
          <AdminField label="Message vérification"><input disabled={readOnly} value={content.exchange.verificationMessage} onChange={(event) => updateLocaleSection('exchange', { verificationMessage: event.target.value })} /></AdminField>
          <AdminField label="Message post-paiement" className="field--full"><textarea disabled={readOnly} value={content.exchange.postPaymentMessage} onChange={(event) => updateLocaleSection('exchange', { postPaymentMessage: event.target.value })} /></AdminField>
        </div>
        <div className="field-grid field-grid--2">
          {Object.entries(content.exchange.flowLabels).map(([key, value]) => (
            <AdminField key={key} label={key}><input disabled={readOnly} value={value} onChange={(event) => updateFlowLabel(key, event.target.value)} /></AdminField>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Dashboard / Login / Maintenance" title="Messages opérationnels" description="Ajustez les messages qui rassurent l’utilisateur et clarifient le statut du service.">
        <div className="field-grid field-grid--2">
          <AdminField label="Dashboard welcome" className="field--full"><textarea disabled={readOnly} value={content.dashboard.welcomeMessage} onChange={(event) => updateLocaleSection('dashboard', { welcomeMessage: event.target.value })} /></AdminField>
          <AdminField label="Dashboard account message" className="field--full"><textarea disabled={readOnly} value={content.dashboard.accountMessage} onChange={(event) => updateLocaleSection('dashboard', { accountMessage: event.target.value })} /></AdminField>
          <AdminField label="Dashboard guest message" className="field--full"><textarea disabled={readOnly} value={content.dashboard.guestMessage} onChange={(event) => updateLocaleSection('dashboard', { guestMessage: event.target.value })} /></AdminField>
          <AdminField label="Login title"><input disabled={readOnly} value={content.login.title} onChange={(event) => updateLocaleSection('login', { title: event.target.value })} /></AdminField>
          <AdminField label="Login subtitle" className="field--full"><textarea disabled={readOnly} value={content.login.subtitle} onChange={(event) => updateLocaleSection('login', { subtitle: event.target.value })} /></AdminField>
          <AdminField label="Admin title"><input disabled={readOnly} value={content.login.adminTitle} onChange={(event) => updateLocaleSection('login', { adminTitle: event.target.value })} /></AdminField>
          <AdminField label="Guest title"><input disabled={readOnly} value={content.login.guestTitle} onChange={(event) => updateLocaleSection('login', { guestTitle: event.target.value })} /></AdminField>
          <AdminField label="Maintenance title"><input disabled={readOnly} value={content.maintenance.title} onChange={(event) => updateLocaleSection('maintenance', { title: event.target.value })} /></AdminField>
          <AdminField label="Maintenance message" className="field--full"><textarea disabled={readOnly} value={content.maintenance.message} onChange={(event) => updateLocaleSection('maintenance', { message: event.target.value })} /></AdminField>
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} /> : null}
    </div>
  );
}
