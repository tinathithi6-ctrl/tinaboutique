# 🔧 CORRECTIONS BASE DE DONNÉES

**Basé sur l'analyse du dump du 12 Octobre 2025**

---

## 📊 ÉTAT ACTUEL

### ✅ Points Positifs
- ✅ 24 produits actifs
- ✅ Tous les produits ont category_id valide
- ✅ Images configurées correctement
- ✅ Prix en 3 devises (EUR, USD, CDF)
- ✅ Stock disponible

### ⚠️ Problèmes Détectés
1. ❌ Catégories en doublon (Homme/Hommes)
2. ❌ 2 catégories vides (Femmes, Hommes)
3. ⚠️ Index de performance manquants
4. ⚠️ 1 seul utilisateur (pas d'admin visible)

---

## 🔧 CORRECTION 1: Nettoyer les Catégories

### Problème
```
id=2  | "Homme"  | 8 produits
id=9  | "Femmes" | 0 produits (vide)
id=10 | "Hommes" | 0 produits (vide, doublon)
```

### Solution Automatique

**Exécutez:**
```powershell
scripts\nettoyer-categories.bat
```

**Ce script va:**
1. ✅ Supprimer "Femmes" (id=9) - vide
2. ✅ Supprimer "Hommes" (id=10) - vide

### Solution Manuelle

**Connexion à la DB:**
```powershell
psql -U tinaboutique_user -d tinaboutique_db
```

**Commandes SQL:**
```sql
-- Voir les catégories vides
SELECT c.id, c.name, COUNT(p.id) as nb_produits 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.id, c.name 
HAVING COUNT(p.id) = 0;

-- Supprimer les catégories vides
DELETE FROM categories WHERE id IN (9, 10);

-- Vérifier
SELECT id, name FROM categories ORDER BY id;
```

**Résultat attendu:**
```
 id |    name     
----+-------------
  1 | Robes
  2 | Homme
  3 | Enfants
  4 | Accessoires
```

---

## 🔧 CORRECTION 2: Appliquer les Index de Performance

### Problème
Requêtes lentes car index manquants sur:
- `products.category_id` - Pour filtrer par catégorie
- `products.is_active` - Pour filtrer produits actifs
- `products.created_at` - Pour trier par date

### Solution Automatique

**Exécutez:**
```powershell
scripts\appliquer-index.bat
```

**Mot de passe:** `abcd1234`

### Solution Manuelle

**Fichier déjà créé:** `database_indexes.sql`

**Commandes:**
```sql
-- Index pour filtrage rapide par catégorie
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products(category_id) 
WHERE is_active = true;

-- Index pour filtrage produits actifs
CREATE INDEX IF NOT EXISTS idx_products_is_active 
ON products(is_active);

-- Index pour tri par date
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- Index pour recherche par nom
CREATE INDEX IF NOT EXISTS idx_products_name 
ON products USING gin(to_tsvector('french', name));

-- Vérifier
\di
```

---

## 🔧 CORRECTION 3: Créer un Utilisateur Admin

### Problème
Utilisateur actuel: `odirussel@gmail.com` avec role = `user`

Pas de compte admin visible.

### Solution

**Option A - Promouvoir l'utilisateur existant:**
```sql
-- Se connecter à la DB
psql -U tinaboutique_user -d tinaboutique_db

-- Promouvoir en admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'odirussel@gmail.com';

-- Vérifier
SELECT email, role FROM users;
```

**Option B - Créer un nouveau compte admin:**

Via l'interface web:
1. Aller sur http://localhost:8080/auth
2. S'inscrire avec un email admin
3. Puis promouvoir en SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@tinaboutique.com';
```

---

## 🔧 CORRECTION 4: Ajouter Plus de Produits (Optionnel)

### Situation Actuelle
```
Robes: 8 produits ✅
Homme: 8 produits ✅
Enfants: 4 produits ⚠️
Accessoires: 4 produits ⚠️
```

### Recommandation
Ajouter au moins 8-10 produits par catégorie pour un meilleur rendu.

**Via l'interface admin:**
1. Se connecter en admin
2. Aller sur `/admin/products`
3. Cliquer "Ajouter un produit"
4. Remplir les informations

---

## ✅ PLAN D'ACTION COMPLET

### Étape 1: Nettoyer les Catégories (2 min)
```powershell
scripts\nettoyer-categories.bat
```

### Étape 2: Appliquer les Index (2 min)
```powershell
scripts\appliquer-index.bat
```

### Étape 3: Promouvoir en Admin (1 min)
```sql
psql -U tinaboutique_user -d tinaboutique_db
UPDATE users SET role = 'admin' WHERE email = 'odirussel@gmail.com';
\q
```

### Étape 4: Tester l'Application (5 min)
```powershell
npm run dev
```

**Vérifier:**
- [ ] http://localhost:8080/shop - Filtre catégories fonctionne
- [ ] http://localhost:8080/boutique - 4 catégories affichées
- [ ] http://localhost:8080/category/robes - 8 produits
- [ ] http://localhost:8080/category/homme - 8 produits
- [ ] http://localhost:8080/admin - Accès admin OK

---

## 📊 AVANT / APRÈS

### AVANT
```
Catégories: 6 (dont 2 vides)
Produits: 24 actifs
Index: 12 (basiques)
Performance: ⚠️ Lente sur filtrage
Admin: ❌ Aucun
```

### APRÈS
```
Catégories: 4 (toutes utilisées) ✅
Produits: 24 actifs ✅
Index: 16 (optimisés) ✅
Performance: ✅ Rapide
Admin: ✅ 1 compte
```

---

## 🧪 TESTS DE VALIDATION

### Test 1: Catégories Nettoyées
```sql
SELECT id, name FROM categories ORDER BY id;
```

**Attendu:** 4 lignes (Robes, Homme, Enfants, Accessoires)

### Test 2: Index Appliqués
```sql
\di
```

**Attendu:** Au moins 16 index (12 existants + 4 nouveaux)

### Test 3: Admin Créé
```sql
SELECT email, role FROM users WHERE role = 'admin';
```

**Attendu:** Au moins 1 ligne

### Test 4: Site Fonctionnel
- Ouvrir http://localhost:8080/shop
- Cliquer "Filtrer par catégorie"
- **Attendu:** 4 catégories (Robes, Homme, Enfants, Accessoires)

---

## 🚨 COMMANDES D'URGENCE

### Restaurer une Catégorie Supprimée par Erreur
```sql
-- Réinsérer
INSERT INTO categories (name, description) 
VALUES ('Femmes', 'Vêtements pour femmes');

-- Vérifier le nouvel ID
SELECT id, name FROM categories WHERE name = 'Femmes';

-- Assigner des produits à cette catégorie
UPDATE products SET category_id = <nouvel_id> WHERE id IN (1, 2, 3);
```

### Réinitialiser Tout (Attention!)
```sql
-- ATTENTION: Supprime TOUTES les catégories et produits
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Recréer les catégories
INSERT INTO categories (name, description) VALUES 
  ('Robes', 'Collection de robes'),
  ('Homme', 'Vêtements pour hommes'),
  ('Enfants', 'Vêtements pour enfants'),
  ('Accessoires', 'Accessoires de mode');
```

---

## 📝 NOTES IMPORTANTES

### Encodage des Caractères
Dans le terminal, vous voyez:
```
V├¬tements (au lieu de Vêtements)
compl├®ter (au lieu de compléter)
```

**C'est normal !** C'est juste l'affichage du terminal Windows.

Dans la base de données et sur le site, c'est correct: "Vêtements" ✅

### Ordre d'Exécution
1. **D'ABORD** nettoyer les catégories
2. **ENSUITE** appliquer les index
3. **ENFIN** créer l'admin

**Ne pas inverser l'ordre !**

### Backup Recommandé
Avant toute modification:
```powershell
scripts\backup-db.bat
```

---

## ✅ CHECKLIST FINALE

- [ ] Catégories nettoyées (4 au lieu de 6)
- [ ] Index de performance appliqués
- [ ] Utilisateur admin créé
- [ ] Site testé et fonctionnel
- [ ] Backup effectué

---

**Temps total estimé: 10 minutes**

**Prêt à commencer ?** 🚀
