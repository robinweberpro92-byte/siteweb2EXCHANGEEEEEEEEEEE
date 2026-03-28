# Clyra Exchange Front

Application React + Vite front-only pour une plateforme crypto/paiement premium avec :

- landing page cohérente
- moteur d’échange multi-flows
- dashboard utilisateur
- panel admin par onglets
- persistance complète via localStorage
- build Vite simple et compatible Vercel

## Stack

- React 18
- Vite 5
- React Router 6
- CSS global simple
- localStorage pour la persistance

## Lancer le projet

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

Le build génère un dossier `dist` directement exploitable sur Vercel.

## Déploiement Vercel

- Framework Preset : `Vite` ou `Other`
- Build Command : `npm run build`
- Output Directory : `dist`

Aucune base externe, aucune API obligatoire, aucun runtime serveur n’est requis.

## Accès admin local par défaut

- email : `admin@clyra.exchange`
- mot de passe : `control2026!`

Ces identifiants restent modifiables depuis l’onglet **Sécurité & Accès Admin**.

## Persistance locale

Les données sont stockées via des clés versionnées :

- `app_config_v1`
- `app_users_v1`
- `app_transactions_v1`
- `app_notifications_v1`
- `app_admin_access_v1`
- `app_admin_logs_v1`
- `app_analytics_v1`
- `app_session_v1`
- `app_admin_draft_v1`

## Notes

La sécurité d’authentification admin reste strictement locale au navigateur. Le mot de passe et le PIN sont hachés côté front pour éviter le stockage en clair, sans prétendre fournir une sécurité serveur réelle.
