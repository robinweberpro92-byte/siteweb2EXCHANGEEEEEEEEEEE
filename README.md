# Clyra Exchange Front

Application React + Vite front-only pour un service d’échange crypto/paiement.

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

Le build génère un dossier `dist` compatible Vercel.

## Déploiement Vercel

- Framework Preset : `Vite`
- Build Command : `npm run build`
- Output Directory : `dist`

Le projet n’a pas besoin de backend, de base externe ni d’API obligatoire.

## Accès owner par défaut

- email : `owner@clyra.exchange`
- mot de passe : `control2026!`

## Stockage local

Cette version isole complètement les données avec un nouvel espace de clés `clyra_exchange_*_v4` et supprime les anciennes clés `app_*` / `clyra_exchange_*` plus anciennes au premier chargement pour éviter les collisions.
