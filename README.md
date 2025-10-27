# Socles

Application de gestion des socles d'exposition pour musées et collections culturelles.

## Description

Socles est une application web progressive (PWA) permettant de gérer l'inventaire des socles d'exposition dans un contexte muséal. L'application fonctionne hors ligne grâce à IndexedDB pour le stockage local des données.

## Fonctionnalités

- 🔐 Authentification utilisateur
- 📝 Création et modification de fiches de socles
- 🔍 Recherche et filtrage des socles
- 💾 Stockage local avec IndexedDB (pas de serveur requis)
- 📱 Interface responsive adaptée aux tablettes et mobiles
- 📋 Mode brouillon pour les fiches en cours
- 🏛️ Conçu spécifiquement pour les musées et centres d'archives

## Technologies utilisées

- **Vue.js 3** - Framework JavaScript progressif
- **Vite** - Build tool et dev server ultra-rapide
- **Vue Router** - Routing côté client
- **IndexedDB** - Base de données locale dans le navigateur
- **idb** - Wrapper moderne pour IndexedDB

## Installation

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build de production
npm run preview
```

## Utilisation

### Compte de démonstration

Pour tester l'application, utilisez les identifiants suivants :
- Email: `demo@socles.fr`
- Mot de passe: `demo`

### Structure des données

Chaque socle contient les informations suivantes :
- Numéro d'inventaire objet
- Typologie
- Dimensions (hauteur, longueur, largeur en cm)
- Numéro d'exposition
- Fonction du socle
- Instructions de montage
- Matériaux/couleurs
- Localisation
- Caisse
- Exposition
- Options (réservé, anti-sismique, ne pas adapter, en/hors vitrine)
- Commentaires

## Architecture

```
src/
├── views/          # Pages de l'application
├── services/       # Services (IndexedDB)
├── router/         # Configuration Vue Router
├── main.js         # Point d'entrée
├── App.vue         # Composant racine
└── style.css       # Styles globaux
```

## Stockage des données

L'application utilise IndexedDB pour stocker les données localement dans le navigateur. Aucune connexion serveur n'est requise. Les données persistent entre les sessions et sont disponibles hors ligne.

## Développement

Le projet utilise Vue 3 avec Composition API et suit les meilleures pratiques de développement front-end.

## Licence

ISC

## Auteur

Gautier Michelin
