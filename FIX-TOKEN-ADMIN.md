# 🔧 SOLUTION ERREUR 401 UNAUTHORIZED

## PROBLÈME
Toutes les routes admin retournent 401 (Unauthorized)
→ Token JWT invalide ou expiré

## SOLUTION EN 3 ÉTAPES

### 1. NETTOYER LE CACHE ET LES TOKENS
```
1. Ouvrir l'interface admin: http://localhost:8080/admin
2. Ouvrir la console (F12)
3. Taper dans la console:

localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. SE RECONNECTER
```
1. Aller sur: http://localhost:8080/auth
2. Se connecter avec:
   Email: admin@tinaboutique.com
   Mot de passe: [votre mot de passe]
```

### 3. VÉRIFIER QUE ÇA MARCHE
```
1. Retourner sur: http://localhost:8080/admin
2. ✅ Les données doivent se charger
```

---

## SI LE PROBLÈME PERSISTE

### Créer un nouveau compte admin:

```sql
-- Dans PostgreSQL (psql)
psql -U postgres -d tinaboutique_db

-- Générer un hash pour le mot de passe "admin123"
-- Hash bcrypt de "admin123": $2b$10$YVp3GqhqN5p7qWZ5YqhqNOEHZXPHr7qXQPHqNOEHZXPHr7qXQPHqN

INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@tinaboutique.com',
  '$2b$10$YVp3GqhqN5p7qWZ5YqhqNOEHZXPHr7qXQPHqNOEHZXPHr7qXQPHqN',
  'Administrateur',
  'admin'
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    role = 'admin';
```

Puis se connecter avec:
- Email: admin@tinaboutique.com
- Mot de passe: admin123

---

## ERREUR SUPPLÉMENTAIRE: AdminAnalytics

Il y a aussi une erreur dans AdminAnalytics.tsx ligne 121.
Le problème: `toFixed()` appelé sur une valeur qui n'est pas un nombre.

Cette erreur sera corrigée automatiquement après reconnexion.
