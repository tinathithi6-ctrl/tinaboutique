# 🛍️ TinaBoutique - Application E-commerce Complète

Une application e-commerce moderne et complète construite avec React, TypeScript, Node.js, Express et PostgreSQL.

## ✨ Fonctionnalités

### 🛒 Boutique Client
- **Catalogue de produits** avec recherche et filtrage par catégories
- **Panier d'achat persistant** sauvegardé en base de données
- **Authentification sécurisée** avec JWT
- **Processus de paiement** complet
- **Interface responsive** adaptée mobile et desktop
- **Système de notation** et avis clients

### 👨‍💼 Panel d'Administration
- **Gestion complète des produits** (CRUD)
- **Statistiques de vente** en temps réel
- **Gestion des commandes** avec statuts
- **Gestion des utilisateurs** et rôles
- **Upload d'images** pour les produits
- **Rapports avancés** (ventes, clients, paniers abandonnés)
- **Dashboard analytique** avec graphiques

### 🔧 Fonctionnalités Techniques
- **API REST complète** avec Express.js
- **Base de données PostgreSQL** robuste
- **Authentification JWT** sécurisée
- **Upload de fichiers** avec Multer
- **Cache intelligent** avec React Query
- **Internationalisation** (Français/Anglais)
- **Mode sombre/clair** automatique

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le développement rapide
- **Tailwind CSS** pour le styling
- **React Query** pour la gestion des données
- **React Router** pour la navigation
- **Radix UI** pour les composants accessibles
- **Lucide Icons** pour les icônes

### Backend
- **Node.js** avec Express.js
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Multer** pour l'upload de fichiers
- **CORS** configuré pour la sécurité

### Outils de Développement
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage
- **TypeScript** pour la sécurité des types
- **Vitest** pour les tests

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+ installé
- **PostgreSQL** 15+ installé et configuré
- **Git** pour cloner le repository

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/tinaboutique.git
   cd tinaboutique
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   ```bash
   # Créer la base de données
   createdb tinaboutique_db

   # Créer l'utilisateur
   psql -c "CREATE USER tinaboutique_user WITH PASSWORD 'abcd1234';"
   psql -c "GRANT ALL PRIVILEGES ON DATABASE tinaboutique_db TO tinaboutique_user;"

   # Exécuter le schéma de base de données
   psql -U tinaboutique_user -d tinaboutique_db -f database_schema_v2.sql
   ```

4. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier .env avec vos paramètres PostgreSQL
   ```

5. **Démarrer l'application**
   ```bash
   # Terminal 1 : Backend
   npm run dev:backend

   # Terminal 2 : Frontend
   npm run dev
   ```

6. **Accéder à l'application**
   - **Frontend :** http://localhost:8080
   - **Backend API :** http://localhost:3001

## 📊 Structure de la Base de Données

```
tinaboutique_db
├── users (utilisateurs)
├── categories (catégories de produits)
├── products (produits)
├── cart_items (articles du panier)
├── orders (commandes)
├── order_items (articles des commandes)
├── promotions (promotions)
├── promo_codes (codes promo)
└── user_roles (rôles utilisateurs)
```

## 🔐 Comptes de Test

### Administrateur
- **Email :** admin@tinaboutique.com
- **Mot de passe :** admin123

### Client
- **Email :** client@tinaboutique.com
- **Mot de passe :** client123

## 📁 Structure du Projet

```
tinaboutique/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── ui/             # Composants de base (shadcn/ui)
│   │   ├── admin/          # Composants d'administration
│   │   └── boutique/       # Composants de la boutique
│   ├── contexts/           # Contextes React (Auth, Cart)
│   ├── hooks/              # Hooks personnalisés
│   ├── pages/              # Pages de l'application
│   ├── integrations/       # Intégrations externes
│   └── lib/                # Utilitaires
├── public/                 # Assets statiques
├── uploads/                # Images uploadées
├── database_schema_v2.sql  # Schéma de la base de données
├── server.ts              # Serveur backend Express
└── README.md
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Frontend + Backend
npm run dev:frontend     # Frontend uniquement
npm run dev:backend      # Backend uniquement

# Build
npm run build           # Build de production
npm run preview         # Prévisualisation du build

# Tests
npm run test            # Exécuter les tests
npm run lint            # Vérification ESLint
npm run format          # Formatage Prettier

# Base de données
npm run db:reset        # Réinitialiser la base de données
npm run db:seed         # Peupler avec des données de test
```

## 🌟 Fonctionnalités Avancées

### 🤖 Intelligence Artificielle
- **Chatbot intégré** pour l'assistance client
- **Recommandations personnalisées** basées sur l'historique
- **Analyse prédictive** des ventes

### 📊 Analytics et Reporting
- **Tableaux de bord en temps réel**
- **Rapports de vente détaillés**
- **Analyse des paniers abandonnés**
- **Segmentation client**

### 🔒 Sécurité
- **Authentification JWT robuste**
- **Protection CSRF**
- **Validation des données côté serveur**
- **Logs d'audit complets**

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **React** et **Vite** pour le framework frontend
- **Express.js** pour le backend
- **PostgreSQL** pour la base de données
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants

---

**🎉 TinaBoutique - Votre boutique e-commerce moderne et performante !**
