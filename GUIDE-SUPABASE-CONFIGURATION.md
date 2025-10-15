# 🎯 Guide de Configuration Supabase pour TinaBoutique

## ✅ Ce qui a été fait

1. ✅ Fichier `src/db.ts` mis à jour pour supporter Supabase
2. ✅ Fichier `.env.supabase` créé avec la configuration de base
3. ✅ Code serveur conservé (compatible avec PostgreSQL via Supabase)

## 📋 Actions requises (5 minutes)

### Étape 1 : Obtenir l'URL de connexion PostgreSQL depuis Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **tinaboutique** (jlbobyenpyetkxvybyda)
3. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
4. Cliquez sur **Database**
5. Trouvez la section **"Connection string"**
6. Sélectionnez l'onglet **"Transaction pooler"** (recommandé pour les déploiements)
7. Copiez l'URL qui ressemble à :
   ```
   postgresql://postgres.jlbobyenpyetkxvybyda:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
8. **IMPORTANT** : Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données Supabase

### Étape 2 : Mettre à jour votre fichier `.env` local

1. Ouvrez votre fichier `.env` dans VS Code
2. Copiez TOUT le contenu du fichier `.env.supabase`
3. Collez-le dans `.env` (remplacez tout l'ancien contenu)
4. Remplacez la ligne :
   ```env
   DATABASE_URL="REMPLACEZ_PAR_VOTRE_URL_POSTGRESQL_SUPABASE"
   ```
   Par l'URL que vous avez copiée à l'étape 1, par exemple :
   ```env
   DATABASE_URL="postgresql://postgres.jlbobyenpyetkxvybyda:votre_vrai_mot_de_passe@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   ```

### Étape 3 : Configurer les variables sur Render (CRITIQUE)

1. Allez sur https://dashboard.render.com/
2. Sélectionnez votre service backend
3. Allez dans **Environment**
4. Ajoutez les variables suivantes (cliquez sur "Add Environment Variable" pour chacune) :

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | `https://jlbobyenpyetkxvybyda.supabase.co` |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYm9ieWVucHlldGt4dnlieWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDc3NjIsImV4cCI6MjA3NjAyMzc2Mn0._0pLTHJK7COAMeVCLY4_zedD447mKuV4NggSajRfhqQ` |
   | `DATABASE_URL` | (L'URL PostgreSQL que vous avez obtenue à l'étape 1) |
   | `JWT_SECRET` | `pXPBUdPXzIbRYDyIJmLixxPH30PBrBlwv8TbdouAb1g=` |
   | `NODE_ENV` | `production` |

5. Cliquez sur **"Save Changes"**
6. Render redémarrera automatiquement votre service

### Étape 4 : Configurer les variables sur Netlify

1. Allez sur https://app.netlify.com
2. Sélectionnez votre site `sparkling-biscotti-defcce`
3. Allez dans **Site configuration** > **Environment variables**
4. Ajoutez les variables suivantes :

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://tinaboutique.onrender.com` |
   | `VITE_SUPABASE_URL` | `https://jlbobyenpyetkxvybyda.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYm9ieWVucHlldGt4dnlieWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDc3NjIsImV4cCI6MjA3NjAyMzc2Mn0._0pLTHJK7COAMeVCLY4_zedD447mKuV4NggSajRfhqQ` |

5. Cliquez sur **"Save"**
6. Allez dans **Deploys** et cliquez sur **"Trigger deploy"** > **"Clear cache and deploy site"**

### Étape 5 : Pousser les modifications sur GitHub

Dans votre terminal VS Code :

```bash
git add .
git commit -m "Configuration Supabase complète"
git push
```

Cela déclenchera un nouveau déploiement sur Render.

## 🔍 Vérification

### Vérifier les logs sur Render

Une fois le déploiement terminé (5-10 minutes) :

1. Allez dans l'onglet **Logs** de votre service Render
2. Vous devriez voir ces messages de succès :
   ```
   ✅ Client Supabase (API) initialisé
   ✅ Pool PostgreSQL (SQL direct) connecté à Supabase
   ℹ️ Services initialisés.
   💱 Cache des devises initialisé.
   🚀 Le serveur écoute sur le port 10000
   ```

3. **Aucune erreur `ECONNREFUSED`** ne devrait apparaître

### Tester votre site

1. Allez sur https://sparkling-biscotti-defcce.netlify.app/boutique
2. Les produits devraient s'afficher sans erreur
3. Vous ne devriez plus voir l'erreur `r.map is not a function` dans la console

## ❌ En cas de problème

### Erreur "Cannot read properties of null"
➡️ Vérifiez que `DATABASE_URL` est bien configurée sur Render

### Erreur "ECONNREFUSED"
➡️ Vérifiez que l'URL PostgreSQL est correcte (avec le bon mot de passe)

### Les produits ne s'affichent pas
➡️ Vérifiez que `VITE_API_URL` est bien configurée sur Netlify

## 📞 Besoin d'aide ?

Copiez-collez les logs de Render dans le chat si vous rencontrez des problèmes.

---

**Une fois terminé, votre application utilisera Supabase comme base de données unique ! 🎉**
