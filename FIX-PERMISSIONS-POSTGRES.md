# 🔧 CORRECTION PERMISSIONS POSTGRESQL

## PROBLÈME

```
❌ Erreur: doit être le propriétaire de la table activity_logs
```

L'utilisateur `tinaboutique_user` n'a pas les droits de modifier les tables.

---

## ✅ SOLUTION

### Ouvrir PostgreSQL en tant que superuser:

```bash
psql -U postgres -d tinaboutique_db
```

### Puis exécuter ces commandes:

```sql
-- Donner tous les droits à tinaboutique_user
ALTER TABLE activity_logs OWNER TO tinaboutique_user;
ALTER TABLE payment_logs OWNER TO tinaboutique_user;
ALTER TABLE currency_rates OWNER TO tinaboutique_user;
ALTER TABLE user_sessions OWNER TO tinaboutique_user;
ALTER TABLE admin_notifications OWNER TO tinaboutique_user;

-- Donner les droits sur toutes les tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tinaboutique_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tinaboutique_user;

-- Définir les droits par défaut pour les futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tinaboutique_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tinaboutique_user;

-- Vérifier
\dt

-- Quitter
\q
```

Après, redémarrez le serveur backend.
