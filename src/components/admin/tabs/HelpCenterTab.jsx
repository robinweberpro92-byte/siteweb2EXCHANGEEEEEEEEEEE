import Badge from '../../Badge';
import { AdminSection } from '../AdminFormControls';

function buildReadiness(data) {
  const checks = [
    { label: 'Branding configuré', ok: Boolean(data.branding.siteName && (data.branding.logoUrl || data.branding.logoDataUrl || data.branding.shortName)) },
    { label: 'Support email valide', ok: Boolean(data.branding.supportEmail) },
    { label: 'PayPal configuré', ok: Boolean(data.payments.paypal?.email) },
    { label: 'Au moins 3 wallets actifs', ok: Object.values(data.payments.cryptoWallets || {}).filter((wallet) => wallet.enabled && wallet.address).length >= 3 },
    { label: 'Contenu FR complet', ok: Boolean(data.content?.fr?.home?.heroTitle && data.content?.fr?.login?.title) },
    { label: 'Contenu EN complet', ok: Boolean(data.content?.en?.home?.heroTitle && data.content?.en?.login?.title) },
    { label: 'Reviews mises en avant', ok: data.reviews.filter((review) => review.featured).length >= 3 },
    { label: 'Admin secondaire actif', ok: data.admins.some((admin) => admin.role !== 'owner' && admin.status === 'active') },
    { label: 'Login configuré', ok: data.security.loginPageEnabled || data.guestSession.enabled },
    { label: 'Maintenance inactive ou maîtrisée', ok: !data.security.maintenanceMode || data.adminAccess.allowAdminDuringMaintenance },
  ];
  return checks;
}

export default function HelpCenterTab({ data, onOpenTab }) {
  const checks = buildReadiness(data);
  const score = checks.filter((item) => item.ok).length;
  const guides = [
    { title: 'Configurer le branding', text: 'Définissez site name, logo, favicon, couleurs et trust bar avant toute autre étape.', target: 'branding' },
    { title: 'Brancher les paiements', text: 'Renseignez PayPal, Paysafecard et les wallets réseau avant d’ouvrir les flows.', target: 'payments' },
    { title: 'Vérifier les règles exchange', text: 'Ajustez frais, min/max, combinaisons et messages pour éviter les parcours confus.', target: 'exchangeRules' },
    { title: 'Préparer FR / EN', text: 'Complétez le contenu bilingue pour une UX propre sur la landing, le login et le dashboard.', target: 'content' },
    { title: 'Organiser les rôles admin', text: 'Ajoutez les comptes secondaires et attribuez le bon niveau de permission.', target: 'adminsRoles' },
    { title: 'Surveiller sécurité & maintenance', text: 'Activez le PIN, définissez les tabs sensibles et contrôlez la maintenance.', target: 'security' },
  ];

  return (
    <div className="admin-stack">
      <AdminSection eyebrow="Readiness" title="System readiness" description="Checklist rapide pour savoir si la plateforme est prête à être montrée ou pilotée.">
        <div className="readiness-score">
          <strong>{score} / {checks.length}</strong>
          <span>{score >= 8 ? 'Configuration robuste' : score >= 6 ? 'Configuration solide mais perfectible' : 'Configuration à compléter'}</span>
        </div>
        <div className="checklist-grid">
          {checks.map((item) => (
            <div key={item.label} className={`checklist-item ${item.ok ? 'is-ok' : 'is-missing'}`}>
              <Badge tone={item.ok ? 'success' : 'warning'}>{item.ok ? 'OK' : 'À faire'}</Badge>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Guides" title="Aide rapide" description="Accédez immédiatement à la section la plus utile selon l’action que vous devez effectuer.">
        <div className="guide-grid">
          {guides.map((guide) => (
            <button key={guide.title} type="button" className="guide-card" onClick={() => onOpenTab?.(guide.target)}>
              <strong>{guide.title}</strong>
              <p>{guide.text}</p>
              <span>Ouvrir {guide.target}</span>
            </button>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="FAQ" title="Réponses utiles" description="Rappels rapides pour éviter les erreurs de pilotage les plus fréquentes.">
        <div className="faq-grid faq-grid--admin">
          <div className="faq-card"><h3>Comment tester un flow ?</h3><p>Créez une session invitée, ouvrez l’Exchange et vérifiez les instructions, min/max et estimations nettes sans toucher aux données externes.</p></div>
          <div className="faq-card"><h3>Quand utiliser le PIN secondaire ?</h3><p>Pour les onglets paiements, sécurité, rôles admin et règles d’échange, afin de limiter les modifications sensibles.</p></div>
          <div className="faq-card"><h3>Comment rendre la landing plus crédible ?</h3><p>Travaillez le branding, les indicateurs publics, les avis featured et gardez des chiffres cohérents entre trust bar et analytics.</p></div>
          <div className="faq-card"><h3>Le mode invité fait quoi ?</h3><p>Il crée une session locale honnête et persistée sur le même appareil, sans promesse de compte serveur ni collecte cachée.</p></div>
        </div>
      </AdminSection>
    </div>
  );
}
