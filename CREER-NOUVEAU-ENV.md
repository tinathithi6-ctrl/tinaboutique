# 🔐 CRÉER UN NOUVEAU .env SÉCURISÉ

**Temps: 3 minutes**

---

## ÉTAPE 1: Générer les Secrets (1 min)

**Exécutez ce script:**
```powershell
cd "c:\Users\ODIA RUSSELL\Desktop\tinaboutique"
scripts\generer-secrets.bat
```

**Vous obtiendrez 2 secrets aléatoires:**
```
JWT_SECRET: TGpX4k9mR3vY8nH2...
ENCRYPTION_KEY: Qa7sW9dF3gH5jK1...
```

**Copiez-les quelque part !**

---

## ÉTAPE 2: Créer le fichier .env (1 min)

**Créez un nouveau fichier `.env` à la racine:**
```
c:\Users\ODIA RUSSELL\Desktop\tinaboutique\.env
```

**Copiez-y ce contenu:**
```env
# ============================================
# CONFIGURATION TINABOUTIQUE - .env
# ============================================

# --- BASE DE DONNÉES POSTGRESQL ---
DB_USER=tinaboutique_user
DB_PASSWORD=abcd1234
DB_HOST=localhost
DB_DATABASE=tinaboutique_db
DB_PORT=5432

# --- SÉCURITÉ ---
JWT_SECRET=COLLEZ_ICI_LE_SECRET_GENERE
ENCRYPTION_KEY=COLLEZ_ICI_LE_SECRET_GENERE

# --- CONFIGURATION SUPABASE ---
VITE_SUPABASE_URL=https://lsqznjhvevmbxvepbxnp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique

# --- PAIEMENTS (OPTIONNEL POUR L'INSTANT) ---
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-dev
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-dev

# --- ENVIRONNEMENT ---
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
PAYMENT_ENV=sandbox
```

---

## ÉTAPE 3: Remplacer les Secrets (1 min)

**Dans le fichier `.env` que vous venez de créer:**

1. Remplacez `COLLEZ_ICI_LE_SECRET_GENERE` par les secrets générés à l'étape 1

**Exemple:**
```env
JWT_SECRET=TGpX4k9mR3vY8nH2...
ENCRYPTION_KEY=Qa7sW9dF3gH5jK1...
```

2. **Sauvegardez** le fichier (Ctrl+S)

---

## ✅ VÉRIFICATION

**Le fichier .env doit contenir:**
- ✅ Configuration DB (tinaboutique_user, abcd1234, etc.)
- ✅ JWT_SECRET avec une longue chaîne aléatoire
- ✅ ENCRYPTION_KEY avec une longue chaîne aléatoire
- ✅ VITE_SUPABASE_URL
- ✅ NODE_ENV=development

**⚠️ IMPORTANT:**
- ❌ **AUCUNE** clé AWS (pas utilisé dans ce projet)
- ❌ **PAS** de vraies clés paiement (pour l'instant)
- ✅ Seulement les configurations de base

---

## 🔒 SÉCURITÉ

**Ce fichier .env est maintenant:**
- ✅ **Ignoré** par Git (ne sera pas commité)
- ✅ **Sécurisé** avec de nouveaux secrets
- ✅ **Sans clés exposées** AWS

---

## 📝 MÉTHODE RAPIDE (Copier-Coller)

**Ou utilisez cette version prête:**

```env
DB_USER=tinaboutique_user
DB_PASSWORD=abcd1234
DB_HOST=localhost
DB_DATABASE=tinaboutique_db
DB_PORT=5432

JWT_SECRET=REMPLACER_PAR_SECRET_GENERE
ENCRYPTION_KEY=REMPLACER_PAR_SECRET_GENERE

VITE_SUPABASE_URL=https://lsqznjhvevmbxvepbxnp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcXpuamh2ZXZtYnh2ZXBieG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDk3NjEsImV4cCI6MjA1MTUyNTc2MX0.FUBdqrNJvyiKk_vFp4kgfDdCKIKZ88iy08qQzLZ3FqA

NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

**N'oubliez pas de remplacer JWT_SECRET et ENCRYPTION_KEY !**

---

## ✅ C'EST FAIT ?

**Vérifiez:**
```powershell
# Le fichier .env existe ?
Test-Path .env

# Le fichier .env n'est PAS tracké par Git ?
git status
# Vous ne devez PAS voir .env dans la liste
```

**Si tout est OK, continuez vers l'étape suivante !** 👉 Index DB

---

**Temps total: 3 minutes**
