# 🚀 GUIDE DE DÉPLOIEMENT NETLIFY - TINABOUTIQUE

## ✅ PRÉREQUIS

- ✅ **Build réussi** (`npm run build` fonctionne)
- ✅ **Code sur GitHub** (ou GitLab, Bitbucket)
- ✅ **Compte Netlify** (gratuit)
- ✅ **Backend déployé** (Railway, Render, Heroku)

---

## 📝 ÉTAPES DE DÉPLOIEMENT

### **Étape 1 : Préparer le Backend**

#### Option A : Déployer sur Railway (Recommandé)
```bash
1. Aller sur https://railway.app
2. Créer un compte (gratuit 5$/mois)
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionner votre repo tinaboutique
5. Ajouter PostgreSQL database
6. Configurer variables d'environnement :
   - DATABASE_URL (auto-générée)
   - JWT_SECRET=votre-secret-super-long-et-securise-32-chars-minimum
   - PORT=3001
   - NODE_ENV=production
   - FRONTEND_URL=https://tinaboutique.netlify.app (à mettre après)
7. Deploy !
8. Copier l'URL générée (ex: https://tinaboutique-api.railway.app)
```

#### Option B : Déployer sur Render
```bash
1. Aller sur https://render.com
2. "New Web Service"
3. Connecter GitHub repo
4. Configuration :
   - Build Command: npm install
   - Start Command: npm run dev:backend
   - Environment Variables: (mêmes que Railway)
5. Deploy
6. Copier l'URL (ex: https://tinaboutique-api.onrender.com)
```

---

### **Étape 2 : Déployer le Frontend sur Netlify**

#### **Méthode 1 : Depuis l'Interface Netlify (Plus Simple)**

```bash
1. Aller sur https://app.netlify.com
2. Cliquer "Add new site" → "Import an existing project"
3. Choisir "GitHub" (ou votre provider Git)
4. Sélectionner le repo "tinaboutique"
5. Configuration Build :
   
   Build command: npm run build
   Publish directory: dist
   
6. Cliquer "Show advanced" → "New variable"
   
   Ajouter les variables d'environnement :
   
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique
   VITE_API_URL=https://tinaboutique-api.railway.app
   
7. Cliquer "Deploy site"
8. ✅ Site déployé en 2-3 minutes !
```

#### **Méthode 2 : Depuis la CLI Netlify**

```bash
# Installer la CLI Netlify
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser
netlify init

# Suivre les instructions :
# - Create & configure a new site
# - Team: choisir votre équipe
# - Site name: tinaboutique (ou autre)
# - Build command: npm run build
# - Directory to deploy: dist

# Déployer
netlify deploy --prod

# ✅ C'est tout !
```

---

### **Étape 3 : Configuration Post-Déploiement**

#### **3.1 Configurer les Redirections API**

Dans le fichier `netlify.toml` (déjà configuré), remplacer :
```toml
from = "/api/*"
to = "https://api.example.com/:splat"
```

Par votre URL backend :
```toml
from = "/api/*"
to = "https://tinaboutique-api.railway.app/:splat"
```

#### **3.2 Mettre à jour les Variables d'Environnement**

Dans Netlify Dashboard :
```
Site settings → Environment variables → Add variable
```

Ajouter :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_API_URL=https://tinaboutique-api.railway.app
```

#### **3.3 Configurer le Domaine Personnalisé (Optionnel)**

```bash
1. Aller dans "Domain management"
2. "Add custom domain"
3. Entrer votre domaine (ex: tinaboutique.com)
4. Suivre les instructions DNS
5. Activer HTTPS automatique (gratuit)
```

---

### **Étape 4 : Mettre à jour le Backend**

Dans votre backend (Railway/Render), mettre à jour la variable :
```env
FRONTEND_URL=https://tinaboutique.netlify.app
```

Et dans `server.ts`, vérifier la configuration CORS :
```typescript
const allowedOrigins = [
  'https://tinaboutique.netlify.app',
  'http://localhost:8080' // Pour développement local
];
```

---

## 🔧 CONFIGURATION NETLIFY.TOML (Déjà Fait)

Le fichier `netlify.toml` à la racine du projet contient :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://tinaboutique-api.railway.app/:splat"  # À REMPLACER
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## 🗄️ BASE DE DONNÉES

### **Créer la Base de Données PostgreSQL**

#### Sur Railway :
```bash
1. Dans votre projet Railway
2. "New" → "Database" → "Add PostgreSQL"
3. Database créée automatiquement
4. Copier DATABASE_URL
5. Se connecter via psql ou TablePlus
6. Exécuter database_schema_v2.sql
```

#### Commandes SQL :
```bash
# Depuis votre terminal local
psql "postgresql://user:pass@host:port/db" -f database_schema_v2.sql

# Ou depuis un client SQL (TablePlus, pgAdmin)
# Copier-coller le contenu de database_schema_v2.sql
```

---

## ✅ VÉRIFICATIONS POST-DÉPLOIEMENT

### **1. Tester le Frontend**
```bash
✅ Page d'accueil charge
✅ Navigation fonctionne
✅ Images s'affichent
✅ Aucune erreur console
```

### **2. Tester l'API**
```bash
# Tester un endpoint public
curl https://tinaboutique.netlify.app/api/products

# Devrait retourner la liste des produits
```

### **3. Tester l'Authentification**
```bash
✅ Inscription fonctionne
✅ Connexion fonctionne
✅ Token JWT valide
✅ Profil accessible
```

### **4. Tester le Panier**
```bash
✅ Ajouter au panier
✅ Modifier quantité
✅ Supprimer article
✅ Panier persistant
```

### **5. Tester le Checkout**
```bash
✅ Processus complet
✅ Paiement (mode test)
✅ Confirmation commande
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### **Erreur : "Page Not Found" sur refresh**
```bash
✅ Solution : Fichier _redirects créé dans public/
Contenu :
/*    /index.html   200
```

### **Erreur : "API calls fail (404 ou CORS)"**
```bash
1. Vérifier netlify.toml (redirect /api/*)
2. Vérifier CORS dans backend (allowedOrigins)
3. Vérifier variable VITE_API_URL
4. Redéployer après changements
```

### **Erreur : "Environment variables not defined"**
```bash
1. Aller dans Site settings → Environment variables
2. Vérifier VITE_SUPABASE_URL
3. Vérifier VITE_SUPABASE_PUBLISHABLE_KEY
4. Redéployer (ou Clear cache + Deploy)
```

### **Erreur : "Build fails"**
```bash
# Vérifier localement
npm run build

# Si ça marche localement :
1. Clear build cache dans Netlify
2. Rebuild deploy
```

---

## 📊 MONITORING

### **Netlify Analytics (Gratuit)**
```bash
1. Aller dans "Analytics" dans Netlify Dashboard
2. Voir :
   - Trafic
   - Top pages
   - 404 errors
   - Bandwidth
```

### **Supabase Dashboard**
```bash
1. Aller sur https://supabase.com
2. Voir :
   - API calls
   - Database size
   - Auth users
```

---

## 🚀 DÉPLOIEMENT CONTINU (CI/CD)

### **Automatique via Git**
```bash
✅ Chaque push sur main → Deploy automatique
✅ Pull requests → Deploy preview
✅ Rollback facile

Configuration :
1. Site settings → Build & deploy
2. "Build hooks" → "Add build hook"
3. Copier l'URL webhook
```

---

## 💰 COÛTS ESTIMÉS

### **Plan Gratuit Netlify**
```
✅ 100 GB bandwidth/mois
✅ 300 build minutes/mois
✅ HTTPS automatique
✅ Deploy previews illimités
✅ Formulaires : 100 submissions/mois
```

### **Plan Gratuit Railway**
```
✅ 5$/mois crédits gratuits
✅ PostgreSQL inclus
✅ 500 MB RAM
✅ Scaling automatique
```

### **Total : 0$ pour commencer** ✅

---

## 🎯 COMMANDES RAPIDES

```bash
# Build local
npm run build

# Test build local
npm run preview

# Deploy Netlify CLI
netlify deploy --prod

# Logs Netlify
netlify logs

# Open dashboard
netlify open
```

---

## 📞 SUPPORT

### **Netlify**
- Docs : https://docs.netlify.com
- Community : https://answers.netlify.com
- Status : https://www.netlifystatus.com

### **Railway**
- Docs : https://docs.railway.app
- Discord : https://discord.gg/railway

---

## ✅ CHECKLIST FINALE

Avant de déployer, vérifier :

- [ ] ✅ Build fonctionne localement
- [ ] ✅ Backend déployé (Railway/Render)
- [ ] ✅ Database créée et schema appliqué
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ netlify.toml configuré avec URL backend
- [ ] ✅ _redirects créé dans public/
- [ ] ✅ .gitignore contient .env
- [ ] ✅ CORS configuré dans backend
- [ ] ✅ Compte Netlify créé
- [ ] ✅ Repo sur GitHub

---

## 🎉 FÉLICITATIONS !

Votre boutique e-commerce TinaBoutique est maintenant **en ligne** ! 🚀

**URL :** https://tinaboutique.netlify.app

**Prochaines étapes :**
1. ✅ Ajouter un domaine personnalisé
2. ✅ Configurer Google Analytics
3. ✅ Ajouter des produits réels
4. ✅ Tester les paiements en mode live
5. ✅ Marketing et lancement ! 🎊

---

**Besoin d'aide ? Consultez la documentation complète dans README.md** 📚
