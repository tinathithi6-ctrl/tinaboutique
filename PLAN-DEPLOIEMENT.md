# 🚀 PLAN DE DÉPLOIEMENT - TINABOUTIQUE

## ⚠️ STATUT ACTUEL
**APPLICATION NON PRÊTE - Corrections critiques requises avant déploiement**

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### 🔴 PHASE 1: CORRECTIONS CRITIQUES (48h)

#### Sécurité [URGENT]
- [ ] Révoquer toutes les clés API exposées (AWS, etc.)
- [ ] Générer nouvelles clés sécurisées
- [ ] Ajouter .env au .gitignore
- [ ] Créer .env.example
- [ ] Changer mot de passe DB (min 20 caractères)
- [ ] Vérifier aucun secret dans le code

#### Fonctionnalités Panier
- [ ] Corriger badge panier (utiliser cartCount du contexte)
- [ ] Rendre icône panier cliquable (Link vers /cart)
- [ ] Autoriser ajout panier sans connexion
- [ ] Implémenter synchronisation panier login

#### Bugs Navigation
- [ ] Retirer redirection admin forcée
- [ ] Implémenter recherche produits
- [ ] Vérifier tous les liens/boutons

#### Base de Données
- [ ] Créer tous les index recommandés
- [ ] Configurer backup automatique quotidien
- [ ] Tester restauration backup
- [ ] Importer au moins 20 produits

#### Backend
- [ ] Créer fichier payments.ts
- [ ] Vérification stock avant ajout panier
- [ ] Healthcheck avec test connexion DB

---

### ⚠️ PHASE 2: FONCTIONNALITÉS ESSENTIELLES (3-5 jours)

#### Paiements
- [ ] Configurer vraies API Mobile Money
- [ ] Tester Flutterwave en sandbox
- [ ] Tester Orange Money
- [ ] Tester Airtel Money
- [ ] Implémenter gestion échecs
- [ ] Webhook handlers complets
- [ ] Logs paiements exhaustifs

#### Emails
- [ ] Configurer service email (SendGrid/Mailgun)
- [ ] Email confirmation inscription
- [ ] Email confirmation commande
- [ ] Email suivi livraison
- [ ] Email récupération mot de passe

#### Authentification
- [ ] Système récupération mot de passe
- [ ] Vérification email obligatoire
- [ ] Changement mot de passe profil

#### UX Améliorations
- [ ] Pagination sur /shop
- [ ] Filtre prix min/max
- [ ] Lazy loading images
- [ ] Optimisation images (compression WebP)
- [ ] Messages d'erreur clairs

---

### ⚡ PHASE 3: OPTIMISATIONS (5-7 jours)

#### Performance
- [ ] Code splitting optimisé
- [ ] Cache API configuré
- [ ] Bundle size < 300KB
- [ ] Lighthouse score > 80
- [ ] Images responsive

#### SEO
- [ ] Meta tags dynamiques
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Schema.org markup
- [ ] URLs canoniques

#### Monitoring
- [ ] Intégrer Sentry (erreurs)
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Dashboard monitoring
- [ ] Analytics (Google/Plausible)

#### Tests
- [ ] Tests unitaires critiques
- [ ] Tests E2E parcours utilisateur
- [ ] Tests charge (k6)
- [ ] Tests sécurité (OWASP)

---

## 🏗️ ARCHITECTURE DÉPLOIEMENT

### Option A: Hébergement Simple (MVP - Budget limité)

**Infrastructure:**
```
- Frontend: Vercel/Netlify (Gratuit)
- Backend: Railway/Render (15-20€/mois)
- DB: Supabase/Railway PostgreSQL (Gratuit/10€)
- Storage: AWS S3 (5€/mois)
```

**Avantages:**
- ✅ Déploiement rapide
- ✅ Coût faible (20-35€/mois)
- ✅ SSL automatique
- ✅ CI/CD intégré

**Inconvénients:**
- ⚠️ Scaling limité
- ⚠️ Performance moyenne

**Coût total:** ~30€/mois

---

### Option B: VPS Professionnel (Production)

**Infrastructure:**
```
- VPS: DigitalOcean/Hetzner (20-40€/mois)
- DB: PostgreSQL managé (10-20€/mois)
- CDN: Cloudflare (Gratuit)
- Storage: AWS S3/Wasabi (5-10€/mois)
- Email: SendGrid (Gratuit <100/jour)
```

**Stack:**
```
- Nginx (reverse proxy)
- PM2 (process manager)
- Docker (containerisation)
- GitHub Actions (CI/CD)
```

**Avantages:**
- ✅ Contrôle total
- ✅ Scaling possible
- ✅ Performance optimale

**Inconvénients:**
- ⚠️ Configuration complexe
- ⚠️ Maintenance requise

**Coût total:** ~50-80€/mois

---

## 📦 PROCÉDURE DE DÉPLOIEMENT

### Étape 1: Préparation Environnement Production

```bash
# 1. Créer .env.production
cp .env.example .env.production

# 2. Configurer variables production
nano .env.production
```

**.env.production:**
```env
NODE_ENV=production
FRONTEND_URL=https://votredomaine.com
DB_HOST=votre-db-host
DB_PASSWORD=MOT_DE_PASSE_FORT_64_CHARS
JWT_SECRET=SECRET_64_CHARS
ENCRYPTION_KEY=KEY_64_CHARS

# APIs Production
FLUTTERWAVE_PUBLIC_KEY=LIVE_KEY
FLUTTERWAVE_SECRET_KEY=LIVE_SECRET

# Email
EMAIL_API_KEY=PROD_KEY
EMAIL_FROM=noreply@votredomaine.com
```

---

### Étape 2: Build Application

```bash
# Frontend
npm run build

# Backend
npm run build # Si TypeScript compilé
```

---

### Étape 3: Configuration Serveur (VPS)

```bash
# 1. Se connecter au serveur
ssh root@votre-serveur

# 2. Installer dépendances
apt update && apt upgrade -y
apt install -y nodejs npm nginx postgresql-client git

# 3. Installer PM2
npm install -g pm2

# 4. Configurer Nginx
nano /etc/nginx/sites-available/tinaboutique
```

**Configuration Nginx:**
```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    # Frontend
    location / {
        root /var/www/tinaboutique/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads {
        alias /var/www/tinaboutique/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 5. Activer site
ln -s /etc/nginx/sites-available/tinaboutique /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 6. SSL avec Certbot
apt install -y certbot python3-certbot-nginx
certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

---

### Étape 4: Déployer Application

```bash
# 1. Cloner repository
cd /var/www
git clone https://github.com/votre-repo/tinaboutique.git
cd tinaboutique

# 2. Installer dépendances
npm install --production

# 3. Build frontend
npm run build

# 4. Configurer .env
nano .env.production
# Copier les variables de production

# 5. Migrer DB
psql -h DB_HOST -U DB_USER -d DB_NAME -f database_schema_v2.sql
psql -h DB_HOST -U DB_USER -d DB_NAME -f database_indexes.sql

# 6. Importer produits (si seeds)
# psql -h DB_HOST -U DB_USER -d DB_NAME -f sample_data.sql

# 7. Lancer backend avec PM2
pm2 start src/server.ts --name tinaboutique-api --interpreter tsx
pm2 save
pm2 startup

# 8. Vérifier
pm2 status
pm2 logs tinaboutique-api
```

---

### Étape 5: Tests Post-Déploiement

```bash
# 1. Test healthcheck
curl https://votredomaine.com/api/health

# 2. Test API produits
curl https://votredomaine.com/api/products

# 3. Test frontend
curl https://votredomaine.com

# 4. Vérifier SSL
curl -I https://votredomaine.com | grep -i strict-transport-security

# 5. Test performance
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://votredomaine.com
```

---

## 🔧 MAINTENANCE CONTINUE

### Backups Automatiques

**Script cron:**
```bash
# Créer script backup
nano /root/backup-tinaboutique.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
DB_NAME="tinaboutique_db"

# Backup DB
pg_dump -h DB_HOST -U DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/tinaboutique/uploads

# Upload vers S3 (optionnel)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://votre-bucket/backups/

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

```bash
chmod +x /root/backup-tinaboutique.sh

# Ajouter au cron (tous les jours à 2h)
crontab -e
0 2 * * * /root/backup-tinaboutique.sh
```

---

### Monitoring

**1. PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**2. Alertes Email:**
```bash
# Installer postfix
apt install -y postfix mailutils

# Configurer alertes disque
nano /root/check-disk.sh
```

```bash
#!/bin/bash
THRESHOLD=80
CURRENT=$(df / | grep / | awk '{ print $5}' | sed 's/%//g')

if [ "$CURRENT" -gt "$THRESHOLD" ]; then
    echo "Alerte: Disque à ${CURRENT}%" | mail -s "Tinaboutique Alert" admin@votredomaine.com
fi
```

---

### Mises à jour

**Processus de mise à jour:**
```bash
# 1. Backup avant update
/root/backup-tinaboutique.sh

# 2. Pull dernières modifications
cd /var/www/tinaboutique
git pull origin main

# 3. Installer nouvelles dépendances
npm install --production

# 4. Rebuild frontend
npm run build

# 5. Redémarrer backend
pm2 restart tinaboutique-api

# 6. Vérifier
pm2 logs tinaboutique-api --lines 100
curl https://votredomaine.com/api/health

# 7. Tester application
# Navigation manuelle + tests critiques
```

---

## 📊 MONITORING & ANALYTICS

### Outils Recommandés

**1. Sentry (Erreurs):**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "VOTRE_DSN_SENTRY",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

**2. Google Analytics / Plausible:**
```html
<!-- index.html -->
<script defer data-domain="votredomaine.com" src="https://plausible.io/js/script.js"></script>
```

**3. Uptime Monitoring:**
- UptimeRobot (gratuit)
- Pingdom
- StatusCake

**4. Logs:**
```bash
# Centraliser avec Logtail/Papertrail
pm2 install pm2-logtail
pm2 set pm2-logtail:token VOTRE_TOKEN
```

---

## 🎯 CRITÈRES DE SUCCÈS

### Avant Lancement
- [ ] Tous les bugs critiques corrigés
- [ ] Tests E2E passés à 100%
- [ ] Lighthouse score > 80
- [ ] SSL configuré et actif
- [ ] Backup automatique fonctionnel
- [ ] Monitoring actif
- [ ] Au moins 50 produits en ligne
- [ ] Emails transactionnels testés
- [ ] Paiements testés (sandbox puis live)

### Métriques Cibles (Premier mois)
- **Uptime:** > 99.5%
- **Temps chargement:** < 3s
- **Taux conversion:** > 1%
- **Taux abandon panier:** < 70%
- **Erreurs:** < 0.1%

---

## 📞 SUPPORT & URGENCES

### Procédure d'urgence

**Si le site est down:**
```bash
# 1. Vérifier statut serveur
ssh root@votre-serveur
systemctl status nginx
pm2 status

# 2. Vérifier logs
pm2 logs tinaboutique-api --err
tail -f /var/log/nginx/error.log

# 3. Redémarrer si nécessaire
pm2 restart tinaboutique-api
systemctl restart nginx

# 4. Rollback si problème persistant
cd /var/www/tinaboutique
git reset --hard HEAD~1
npm install --production
npm run build
pm2 restart tinaboutique-api
```

---

## 💰 ESTIMATION COÛTS ANNUELS

### Option Budget (Railway/Netlify)
```
- Hébergement: 20€/mois × 12 = 240€
- Domaine: 15€/an
- Email (SendGrid): Gratuit
- CDN (Cloudflare): Gratuit
- Monitoring (UptimeRobot): Gratuit

TOTAL: ~255€/an
```

### Option Professional (VPS)
```
- VPS (DigitalOcean): 40€/mois × 12 = 480€
- DB managée: 20€/mois × 12 = 240€
- S3 Storage: 10€/mois × 12 = 120€
- Domaine: 15€/an
- Email (SendGrid): 50€/an
- Sentry: 30€/mois × 12 = 360€
- CDN (Cloudflare Pro): 20€/mois × 12 = 240€

TOTAL: ~1505€/an
```

---

## 🏁 GO/NO-GO CHECKLIST FINAL

### ✅ Critères Obligatoires

- [ ] Tous les bugs critiques (Top 10) corrigés
- [ ] Badge panier fonctionne
- [ ] Panier accessible et opérationnel
- [ ] Admin peut voir le site
- [ ] Recherche implémentée
- [ ] Clés API sécurisées
- [ ] Index DB créés
- [ ] Backup automatique configuré
- [ ] Au moins 20 produits en ligne
- [ ] Emails confirmation commande fonctionnels
- [ ] Un mode de paiement testé et opérationnel
- [ ] SSL configuré
- [ ] HTTPS forcé
- [ ] Tests E2E critiques passés
- [ ] Documentation déploiement complète

### Statut Actuel: ❌ NO-GO

**Actions requises:** Compléter Phase 1 (48h) avant reconsidération

---

## 📅 TIMELINE RECOMMANDÉ

```
Jour 1-2:   Corrections critiques
Jour 3-5:   Fonctionnalités essentielles
Jour 6-7:   Tests et optimisations
Jour 8:     Déploiement staging
Jour 9-10:  Tests utilisateurs beta
Jour 11:    Corrections bugs beta
Jour 12:    GO-LIVE Production
```

**Date de lancement recommandée:** Dans 12 jours minimum après corrections
