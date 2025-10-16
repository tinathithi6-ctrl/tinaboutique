# 📊 Guide Supabase - Création Tables

## ❌ Erreur Rencontrée

```
ERROR: 42703: column "slug" does not exist
```

**Cause**: Le script original contenait des colonnes `slug` qui causaient des erreurs.

**Solution**: Script corrigé créé → `SUPABASE-SCHEMA-CORRIGE.txt`

---

## 🚀 OPTION 1: Créer les tables (Premier lancement)

### Si vous N'AVEZ PAS encore de tables:

1. **Ouvrez Supabase**:
   - https://supabase.com/dashboard
   - Sélectionnez votre projet TinaBoutique

2. **Allez dans SQL Editor**:
   - Menu de gauche → SQL Editor
   - Cliquez sur "New Query"

3. **Copiez le fichier**:
   - Ouvrez: `SUPABASE-SCHEMA-CORRIGE.txt`
   - Copiez TOUT le contenu
   - Collez dans l'éditeur SQL

4. **Lancez**:
   - Cliquez sur "RUN" (ou Ctrl+Enter)
   - Attendez 5-10 secondes

5. **Vérifiez**:
   ```
   ✅ SCRIPT TERMINÉ! 13 tables créées avec succès!
   ```

---

## 🔄 OPTION 2: Recommencer à zéro (Reset complet)

### Si vous avez DÉJÀ des tables avec des erreurs:

1. **D'abord, supprimez les tables**:
   - SQL Editor → New Query
   - Copiez le contenu de: `SUPABASE-RESET.txt`
   - Cliquez sur "RUN"
   - Résultat: `🗑️ TOUTES LES TABLES ONT ÉTÉ SUPPRIMÉES!`

2. **Ensuite, créez les nouvelles tables**:
   - SQL Editor → New Query
   - Copiez le contenu de: `SUPABASE-SCHEMA-CORRIGE.txt`
   - Cliquez sur "RUN"
   - Résultat: `✅ SCRIPT TERMINÉ! 13 tables créées`

---

## 📋 Tables Créées (13 au total)

| # | Table | Description |
|---|-------|-------------|
| 1 | `users` | Utilisateurs et admins |
| 2 | `categories` | Catégories de produits |
| 3 | `products` | Produits de la boutique |
| 4 | `cart_items` | Panier d'achat |
| 5 | `orders` | Commandes |
| 6 | `order_items` | Articles des commandes |
| 7 | `site_settings` | Paramètres (email, WhatsApp) |
| 8 | `activity_logs` | Logs d'activité utilisateurs |
| 9 | `payment_logs` | Logs de paiement |
| 10 | `currency_rates` | Taux de change (EUR, USD, CDF) |
| 11 | `user_sessions` | Sessions utilisateur |
| 12 | `admin_notifications` | Notifications admin |
| 13 | `currency_rate_history` | Historique des taux |

---

## ✅ Vérification

### Après avoir lancé le script, vérifiez:

1. **Allez dans "Table Editor"** (Supabase)

2. **Vous devriez voir 13 tables**:
   - users ✅
   - categories ✅
   - products ✅
   - cart_items ✅
   - orders ✅
   - order_items ✅
   - site_settings ✅
   - activity_logs ✅
   - payment_logs ✅
   - currency_rates ✅
   - user_sessions ✅
   - admin_notifications ✅
   - currency_rate_history ✅

3. **Vérifiez la table `site_settings`**:
   - Cliquez sur la table `site_settings`
   - Vous devriez voir 6 lignes:
     - email_notifications_enabled = true ✅
     - whatsapp_enabled = false
     - whatsapp_business_number = +243837352401 ✅
     - sendgrid_configured = false
     - smtp_configured = true ✅
     - twilio_configured = false

4. **Vérifiez la table `currency_rates`**:
   - Cliquez sur la table `currency_rates`
   - Vous devriez voir 6 taux de change:
     - EUR → USD: 1.08 ✅
     - EUR → CDF: 3000.00 ✅
     - USD → EUR: 0.93 ✅
     - USD → CDF: 2780.00 ✅
     - CDF → EUR: 0.00033 ✅
     - CDF → USD: 0.00036 ✅

---

## 🛠️ Modifications Apportées

### Par rapport au script original:

**Colonnes `slug` supprimées**:
- ❌ `categories.slug` → Supprimé (causait l'erreur)
- ❌ `products.slug` → Supprimé (causait l'erreur)

**Raison**: Les slugs sont utiles pour les URLs (ex: `/produit/robe-elegante`), mais ils causaient des erreurs. On peut les ajouter plus tard si nécessaire.

**Ajouté**:
- ✅ `site_settings.smtp_configured = true` (Gmail configuré)

---

## 🔍 Dépannage

### Erreur: "relation already exists"
**Cause**: Une table existe déjà  
**Solution**: 
- Option 1: Ignorez l'erreur (table déjà créée)
- Option 2: Lancez `SUPABASE-RESET.txt` puis recommencez

### Erreur: "permission denied"
**Cause**: Pas les droits admin sur Supabase  
**Solution**: Assurez-vous d'être connecté comme propriétaire du projet

### Erreur: "column does not exist"
**Cause**: Mauvais script  
**Solution**: Utilisez `SUPABASE-SCHEMA-CORRIGE.txt` (pas l'ancien)

---

## 📝 Prochaines Étapes

### Une fois les tables créées:

1. **Créez votre compte admin**:
   ```sql
   INSERT INTO users (email, password_hash, full_name, role) VALUES
   ('admin@tinaboutique.com', '$2a$10$...', 'Admin TinaBoutique', 'admin');
   ```
   ⚠️ Remplacez le password_hash par un vrai hash bcrypt

2. **Ajoutez des catégories**:
   ```sql
   INSERT INTO categories (name, description) VALUES
   ('Robes', 'Robes élégantes pour toutes occasions'),
   ('Accessoires', 'Sacs, bijoux, et accessoires'),
   ('Chaussures', 'Chaussures tendance');
   ```

3. **Ajoutez des produits** (via votre interface admin)

4. **Testez une commande** de bout en bout

---

## 🚀 Commandes Utiles

### Voir toutes les tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Compter les enregistrements:
```sql
SELECT 
  'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

### Voir les paramètres:
```sql
SELECT * FROM site_settings ORDER BY key;
```

### Voir les taux de change:
```sql
SELECT * FROM currency_rates ORDER BY base_currency, target_currency;
```

---

## ✅ Résumé

**Fichiers créés**:
1. `SUPABASE-SCHEMA-CORRIGE.txt` - Script de création (corrigé) ⭐
2. `SUPABASE-RESET.txt` - Script de suppression (reset)
3. `GUIDE-SUPABASE-TABLES.md` - Ce guide

**Action immédiate**:
1. Lancez `SUPABASE-SCHEMA-CORRIGE.txt` sur Supabase SQL Editor
2. Vérifiez que les 13 tables sont créées
3. Testez la connexion depuis votre backend

**Temps estimé**: 5 minutes ⏱️

---

**Besoin d'aide?** Si vous avez une erreur, copiez le message exact et je vous aiderai! 🚀
