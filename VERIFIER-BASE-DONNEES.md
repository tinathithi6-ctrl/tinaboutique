# 🔍 VÉRIFIER LE CONTENU DE LA BASE DE DONNÉES

**Temps: 2-3 minutes**

---

## 🚀 MÉTHODE RAPIDE (Automatique)

### Option 1: Vérification Rapide
```powershell
cd "c:\Users\ODIA RUSSELL\Desktop\tinaboutique"
scripts\verifier-db.bat
```

**Mot de passe:** `abcd1234`

**Vous verrez:**
- ✅ Liste des tables
- ✅ Nombre de produits
- ✅ Liste des 10 premiers produits
- ✅ Nombre de catégories
- ✅ Liste des catégories
- ✅ Nombre d'utilisateurs

---

### Option 2: Dump Complet (Tout voir)
```powershell
cd "c:\Users\ODIA RUSSELL\Desktop\tinaboutique"
scripts\dump-db-complet.bat
```

**Mot de passe:** `abcd1234`

**Vous verrez TOUT:**
- ✅ Structure de toutes les tables
- ✅ Contenu de toutes les tables
- ✅ Statistiques (produits par catégorie, etc.)
- ✅ Index existants

---

## 💻 MÉTHODE MANUELLE (Ligne de commande)

### Se connecter à la base de données

```powershell
psql -U tinaboutique_user -d tinaboutique_db
```

**Mot de passe:** `abcd1234`

---

### Commandes utiles une fois connecté

```sql
-- Lister toutes les tables
\dt

-- Voir la structure d'une table
\d products
\d categories
\d users

-- Compter les produits
SELECT COUNT(*) FROM products;

-- Voir tous les produits
SELECT * FROM products;

-- Voir toutes les catégories
SELECT * FROM categories;

-- Produits par catégorie
SELECT 
  c.name as categorie, 
  COUNT(p.id) as nb_produits 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.name;

-- Voir les index
\di

-- Quitter
\q
```

---

## 🔍 VÉRIFICATIONS IMPORTANTES

### 1. Vérifier que les catégories existent

```sql
SELECT id, name FROM categories;
```

**Résultat attendu:**
```
 id |    name     
----+-------------
  1 | Vêtements
  2 | Accessoires
  3 | Chaussures
  4 | Bijoux
```

**⚠️ Si vide:** Vous devez créer des catégories!

---

### 2. Vérifier que les produits existent

```sql
SELECT id, name, category_id, price_eur FROM products LIMIT 5;
```

**Résultat attendu:**
```
 id |      name       | category_id | price_eur 
----+-----------------+-------------+-----------
  1 | Robe élégante   |           1 |    129.99
  2 | Sac à main      |           2 |     89.99
  3 | Baskets         |           3 |     79.99
```

**⚠️ Si vide:** Vous devez ajouter des produits!

---

### 3. Vérifier les relations catégories-produits

```sql
SELECT 
  c.name as categorie,
  COUNT(p.id) as nb_produits
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY nb_produits DESC;
```

**Résultat attendu:**
```
   categorie   | nb_produits 
---------------+-------------
 Vêtements     |          15
 Accessoires   |          10
 Chaussures    |           8
 Bijoux        |           5
```

**⚠️ Si certaines catégories ont 0 produits:**
- Normal si vous venez de créer la catégorie
- Ajoutez des produits via l'admin

---

### 4. Vérifier les produits actifs

```sql
SELECT 
  is_active, 
  COUNT(*) as nombre 
FROM products 
GROUP BY is_active;
```

**Résultat attendu:**
```
 is_active | nombre 
-----------+--------
 t         |     25   (produits actifs)
 f         |      3   (produits inactifs)
```

**⚠️ Si tous les produits sont inactifs (is_active = false):**
- Ils ne s'afficheront PAS sur le site
- Activez-les via l'admin ou en SQL

---

### 5. Vérifier la structure des images

```sql
SELECT id, name, images FROM products LIMIT 3;
```

**Résultat attendu:**
```
 id |      name       |              images                
----+-----------------+------------------------------------
  1 | Robe élégante   | {"/uploads/product1.jpg"}
  2 | Sac à main      | {"/uploads/product2.jpg","/uploads/product2b.jpg"}
```

**Format correct:** `{"/url/image1.jpg", "/url/image2.jpg"}`

**⚠️ Si format incorrect:** Les images ne s'afficheront pas

---

## 🛠️ PROBLÈMES COURANTS

### Problème 1: Aucune catégorie

**Symptôme:** Page /shop vide, filtre catégorie vide

**Solution:** Créer des catégories
```sql
INSERT INTO categories (name) VALUES 
  ('Vêtements'),
  ('Accessoires'),
  ('Chaussures'),
  ('Bijoux');
```

---

### Problème 2: Aucun produit

**Symptôme:** Toutes les pages produits vides

**Solution:** Ajouter via l'admin `/admin/products`

---

### Problème 3: Produits ne s'affichent pas

**Causes possibles:**
1. `is_active = false`
2. `category_id` invalide
3. Images manquantes

**Vérification:**
```sql
SELECT id, name, is_active, category_id, images 
FROM products 
WHERE is_active = false;
```

**Solution:**
```sql
-- Activer tous les produits
UPDATE products SET is_active = true;
```

---

### Problème 4: Catégories sans produits

**Symptôme:** Certaines catégories vides sur /category/:name

**Vérification:**
```sql
SELECT 
  c.id,
  c.name,
  COUNT(p.id) as nb_produits
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING COUNT(p.id) = 0;
```

**Solution:** Ajouter des produits à ces catégories

---

### Problème 5: Filtre catégorie ne fonctionne pas

**Causes:**
1. `category_id` NULL dans products
2. `category_id` ne correspond à aucune catégorie

**Vérification:**
```sql
-- Produits sans catégorie
SELECT id, name, category_id 
FROM products 
WHERE category_id IS NULL;

-- Produits avec category_id invalide
SELECT p.id, p.name, p.category_id
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL AND p.category_id IS NOT NULL;
```

**Solution:**
```sql
-- Assigner une catégorie par défaut
UPDATE products 
SET category_id = 1 
WHERE category_id IS NULL;
```

---

## 📊 EXEMPLE DE BASE DE DONNÉES CORRECTE

### Catégories (4 catégories)
```
 id |    name     
----+-------------
  1 | Vêtements
  2 | Accessoires
  3 | Chaussures
  4 | Bijoux
```

### Produits (exemple avec 3 produits)
```
 id |      name       | category_id | price_eur | is_active |           images                
----+-----------------+-------------+-----------+-----------+---------------------------
  1 | Robe élégante   |           1 |    129.99 | t         | {"/uploads/robe1.jpg"}
  2 | Sac à main      |           2 |     89.99 | t         | {"/uploads/sac1.jpg"}
  3 | Baskets Nike    |           3 |     79.99 | t         | {"/uploads/basket1.jpg"}
```

### Statistiques
```
   categorie   | nb_produits | prix_moyen
---------------+-------------+------------
 Vêtements     |          15 |      89.50
 Accessoires   |          10 |      65.00
 Chaussures    |           8 |      95.00
 Bijoux        |           5 |     120.00
```

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] PostgreSQL est démarré (services.msc)
- [ ] Base de données `tinaboutique_db` existe
- [ ] Utilisateur `tinaboutique_user` existe
- [ ] Au moins 1 catégorie existe
- [ ] Au moins 1 produit existe
- [ ] Tous les produits ont `is_active = true`
- [ ] Tous les produits ont un `category_id` valide
- [ ] Les images sont au bon format (array)
- [ ] Les relations catégories-produits sont correctes

---

## 🚀 COMMANDES D'URGENCE

### Réinitialiser les données de test

```sql
-- Supprimer tous les produits
DELETE FROM products;

-- Supprimer toutes les catégories
DELETE FROM categories;

-- Créer des catégories
INSERT INTO categories (name) VALUES 
  ('Vêtements'),
  ('Accessoires'),
  ('Chaussures'),
  ('Bijoux');

-- Créer des produits de test
INSERT INTO products (name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, is_active, images)
VALUES 
  ('Robe Élégante', 'Belle robe pour soirée', 1, 129.99, 135, 260000, 10, true, '{"/placeholder.svg"}'),
  ('Sac à Main', 'Sac en cuir premium', 2, 89.99, 95, 180000, 15, true, '{"/placeholder.svg"}'),
  ('Baskets Sport', 'Chaussures confortables', 3, 79.99, 85, 160000, 20, true, '{"/placeholder.svg"}'),
  ('Collier Or', 'Bijou en or 18 carats', 4, 199.99, 210, 400000, 5, true, '{"/placeholder.svg"}');
```

---

## 📞 AIDE SUPPLÉMENTAIRE

**Si problème de connexion:**
```powershell
# Vérifier que PostgreSQL tourne
services.msc
# Chercher "PostgreSQL" → doit être "Démarré"
```

**Si mot de passe incorrect:**
- Mot de passe par défaut: `abcd1234`
- Changer dans pgAdmin si besoin

---

**Maintenant, exécutez le script de vérification !** 🚀

```powershell
scripts\verifier-db.bat
```

**ou**

```powershell
scripts\dump-db-complet.bat
```
