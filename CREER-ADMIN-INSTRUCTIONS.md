# 🔐 CRÉER UN COMPTE ADMINISTRATEUR

## MÉTHODE RAPIDE (Recommandée)

### Étape 1: Ouvrir PostgreSQL

```bash
psql -U postgres -d tinaboutique_db
```

### Étape 2: Copier-coller ce SQL

```sql
-- Supprimer ancien admin
DELETE FROM users WHERE email = 'admin@tinaboutique.com';

-- Créer nouvel admin
-- Mot de passe: admin123
INSERT INTO users (email, password_hash, full_name, role, preferred_currency)
VALUES (
  'admin@tinaboutique.com',
  '$2b$10$K9YGVBhHqDKhQxGJW9xJJOZ5dZ0JZxZ5dZ0JZxZ5dZ0JZxZ5dZ0JZe',
  'Administrateur Principal',
  'admin',
  'EUR'
);

-- Vérifier
SELECT id, email, full_name, role FROM users WHERE role = 'admin';
```

### Étape 3: Se connecter

1. Aller sur: **http://localhost:8080/auth**
2. Email: **admin@tinaboutique.com**
3. Mot de passe: **admin123**

---

## SI LE HASH NE FONCTIONNE PAS

Générez un nouveau hash:

```bash
node -p "require('bcrypt').hashSync('admin123', 10)"
```

Puis remplacez dans l'INSERT ci-dessus.

---

## APRÈS CONNEXION

1. Videz le cache du navigateur (F12 → Console):
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. Reconnectez-vous

3. Allez sur **/admin** - Les erreurs 401 devraient disparaître !
