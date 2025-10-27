# Instructions de déploiement sur GitHub

Le projet Socles est prêt à être déployé sur GitHub. Voici les instructions pour le faire.

## Option 1 : Utiliser le script automatique (Recommandé)

Un script de déploiement `deploy.sh` a été créé pour vous faciliter la tâche.

```bash
# Exécuter le script
./deploy.sh
```

⚠️ **Important** : Après le déploiement, supprimez ou modifiez le fichier `deploy.sh` pour retirer votre token GitHub par sécurité.

## Option 2 : Déploiement manuel

Si vous préférez faire le déploiement manuellement :

### 1. Créer le dépôt sur GitHub

Allez sur https://github.com/new et créez un nouveau dépôt avec les informations suivantes :
- Nom : `Socles`
- Description : `Application de gestion des socles d'exposition pour musées et collections culturelles`
- Visibilité : Public
- Ne cochez PAS "Initialize this repository with a README"

### 2. Pousser le code

```bash
# Le remote est déjà configuré, il suffit de pousser
git push -u origin main
```

Si le remote n'est pas configuré :

```bash
git remote add origin https://github.com/gautiermichelin/Socles.git
git push -u origin main
```

## Vérification

Une fois déployé, vous pourrez accéder à votre dépôt ici :
**https://github.com/gautiermichelin/Socles**

## Développement local

Pour travailler sur le projet localement :

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Le site sera accessible sur http://localhost:5173
```

## Déploiement en production

Pour déployer l'application sur un serveur web :

```bash
# Créer le build de production
npm run build

# Les fichiers optimisés seront dans le dossier dist/
# Vous pouvez ensuite déployer ces fichiers sur n'importe quel hébergeur statique
# (Netlify, Vercel, GitHub Pages, etc.)
```

## Sécurité

⚠️ N'oubliez pas de :
1. Supprimer votre token GitHub du fichier `deploy.sh` après utilisation
2. Ne jamais committer de tokens ou mots de passe dans le dépôt
3. Utiliser des variables d'environnement pour les informations sensibles

## Support

Pour toute question ou problème, consultez la documentation Vue.js :
- https://vuejs.org/
- https://router.vuejs.org/
- https://vitejs.dev/
