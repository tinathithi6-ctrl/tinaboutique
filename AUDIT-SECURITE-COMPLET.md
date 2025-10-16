# 🔒 AUDIT DE SÉCURITÉ COMPLET - TinaBoutique

## ✅ CE QUI EST DÉJÀ EN PLACE (Bien!)

### 1. Sécurité Backend ✅
- ✅ **Helmet.js** - Protection headers HTTP
- ✅ **Rate Limiting** - Limite les tentatives d'attaque
- ✅ **JWT Authentication** - Tokens sécurisés
- ✅ **Bcrypt** - Hashing de mots de passe
- ✅ **PBKDF2** - Hashing avancé (100,000 itérations)
- ✅ **CORS configuré** - Protection cross-origin
- ✅ **Sanitization** - Protection XSS
- ✅ **Encryption AES-256** - Données sensibles chiffrées

### 2. Fichier `security.ts` ✅
- Hash passwords avec PBKDF2 (SHA-256)
- Protection XSS (sanitizeInput)
- Masquage données sensibles dans logs
- Rate limiting en mémoire
- Validation cartes bancaires (Luhn)
- Chiffrement/déchiffrement AES-256

---

## ⚠️ VULNÉRABILITÉS CRITIQUES À CORRIGER

### 🔴 CRITIQUE 1: Rate Limiting trop permissif (DEV MODE)

**Problème actuel** (ligne 58-59 server.ts):
```typescript
max: 50,  // 50 tentatives en 1 minute! ❌
```

**Attaque possible**: Brute force sur les mots de passe

**Solution**:
```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 en prod, 50 en dev
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

### 🔴 CRITIQUE 2: Variables d'environnement sensibles

**Problème**: Clés dans `.env` sans rotation

**Variables à protéger**:
```bash
JWT_SECRET=XXXX          # ⚠️ Ne JAMAIS commiter
ENCRYPTION_KEY=XXXX      # ⚠️ Ne JAMAIS commiter
SMTP_PASS=XXXX           # ⚠️ App password Gmail
DB_PASSWORD=XXXX         # ⚠️ Base de données
```

**Solution**: 
1. Vérifier que `.env` est dans `.gitignore` ✅
2. Utiliser des secrets forts (32+ caractères)
3. Rotation tous les 90 jours

---

### 🟡 MOYENNE 1: Pas de protection CSRF

**Problème**: Formulaires non protégés contre CSRF

**Solution**: Ajouter tokens CSRF sur les formulaires sensibles
- Changement mot de passe
- Paiements
- Suppression compte

---

### 🟡 MOYENNE 2: Headers de sécurité incomplets

**Problème actuel**: Helmet.js configuré mais peut être amélioré

**Solution** (voir section Configuration ci-dessous)

---

## 🛡️ CONFIGURATION NETLIFY (IMPORTANTE!)

### 1. Firewall Traffic Rules

**À configurer sur Netlify**:

1. **Bloquer les pays à risque** (si vous ne vendez qu'en RDC):
   ```
   Rule: Block countries
   Countries: Tous SAUF RDC, France, Belgique
   Action: Block
   ```

2. **Bloquer les IPs suspectes**:
   ```
   Rule: Block known bad actors
   IP Lists: Use Netlify's threat intelligence
   Action: Block
   ```

---

### 2. Rate Limiting (Netlify)

**Configuration recommandée**:

```yaml
# netlify.toml
[[edge_functions]]
  path = "/api/*"
  function = "rate-limit"

[edge_functions.rate-limit]
  # Limite globale
  rate_limit = 100  # requêtes par minute
  
  # Limite auth
  [edge_functions.rate-limit.paths."/api/auth/*"]
    rate_limit = 10  # 10 tentatives/minute
```

---

### 3. Web Application Firewall (WAF)

**À activer sur Netlify** (Plan Pro):
- ✅ Protection SQL Injection
- ✅ Protection XSS
- ✅ Protection DDoS
- ✅ OWASP Top 10

**Si pas de plan Pro**: Les règles backend suffisent pour commencer

---

## 🔐 POLITIQUE DE MOTS DE PASSE

### Exigences actuelles (À RENFORCER)

**Minimum requis**:
- ✅ 8 caractères minimum
- ✅ 1 majuscule
- ✅ 1 minuscule
- ✅ 1 chiffre
- ✅ 1 caractère spécial

**À ajouter**:

```typescript
// src/utils/passwordPolicy.ts
export const PASSWORD_POLICY = {
  minLength: 12,              // ⬆️ Augmenter de 8 à 12
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true, // ➕ NOUVEAU
  preventUserInfo: true,        // ➕ NOUVEAU (email, nom)
  historyCount: 5,              // ➕ NOUVEAU (pas de réutilisation)
  expiryDays: 90                // ➕ NOUVEAU (changement obligatoire)
};

// Mots de passe communs à bloquer
const COMMON_PASSWORDS = [
  'password', 'Password123', '12345678', 'qwerty',
  'admin', 'letmein', 'welcome', 'monkey',
  'Password1!', 'Azerty123', 'Qwerty123'
];

export function validatePassword(password: string, userInfo?: {
  email?: string;
  name?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Longueur
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Minimum ${PASSWORD_POLICY.minLength} caractères requis`);
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Maximum ${PASSWORD_POLICY.maxLength} caractères`);
  }

  // Complexité
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Au moins 1 majuscule requise');
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Au moins 1 minuscule requise');
  }
  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Au moins 1 chiffre requis');
  }
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Au moins 1 caractère spécial requis (!@#$%^&*...)');
  }

  // Mots de passe communs
  if (PASSWORD_POLICY.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common.toLowerCase()))) {
      errors.push('Mot de passe trop commun, choisissez-en un plus unique');
    }
  }

  // Informations utilisateur
  if (PASSWORD_POLICY.preventUserInfo && userInfo) {
    if (userInfo.email && password.toLowerCase().includes(userInfo.email.split('@')[0].toLowerCase())) {
      errors.push('Le mot de passe ne doit pas contenir votre email');
    }
    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(' ');
      if (nameParts.some(part => part.length > 2 && password.toLowerCase().includes(part))) {
        errors.push('Le mot de passe ne doit pas contenir votre nom');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Générer un mot de passe fort
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*()';
  
  const all = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Au moins un de chaque
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Remplir le reste
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Mélanger
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
```

---

## 🔒 AUTHENTIFICATION À DEUX FACTEURS (2FA)

### Recommandation: Ajouter 2FA pour les admins

**Étapes**:
1. Installer `speakeasy` et `qrcode`
2. Générer secret 2FA à l'inscription admin
3. Scanner QR code avec Google Authenticator
4. Vérifier code à chaque login admin

**Priorité**: ⭐⭐ Moyenne (important pour admins)

---

## 🛠️ CORRECTIONS IMMÉDIATES

### 1. Améliorer Rate Limiting

**Fichier**: `src/server.ts`

```typescript
// Rate limiting pour auth (ligne 57-63)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (au lieu de 1)
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 en prod!
  message: { 
    error: 'Trop de tentatives de connexion. Compte temporairement bloqué.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Bloquer par IP
  keyGenerator: (req) => req.ip,
  // Handler personnalisé
  handler: (req, res) => {
    // Logger les tentatives suspectes
    console.warn(`🚨 Rate limit dépassé: ${req.ip} sur ${req.path}`);
    res.status(429).json({
      error: 'Trop de tentatives. Réessayez dans 15 minutes.',
      retryAfter: 900 // secondes
    });
  }
});
```

---

### 2. Headers de Sécurité Renforcés

**Fichier**: `src/server.ts` (après ligne 53)

```typescript
// Headers de sécurité renforcés
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  hidePoweredBy: true
}));

// Header personnalisé
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

---

### 3. Créer le fichier de politique de mots de passe

Créez: `src/utils/passwordPolicy.ts` (voir code complet ci-dessus)

---

### 4. Ajouter validation lors de l'inscription

**Fichier**: `src/server.ts` (route `/api/auth/register`)

```typescript
// Avant de hasher le mot de passe
const passwordValidation = validatePassword(password, {
  email,
  name: full_name
});

if (!passwordValidation.valid) {
  return res.status(400).json({
    error: 'Mot de passe non conforme',
    details: passwordValidation.errors
  });
}
```

---

## 📋 CHECKLIST SÉCURITÉ COMPLÈTE

### Urgent (À faire maintenant) 🔴

- [ ] **Modifier rate limiting** (5 tentatives auth en 15min)
- [ ] **Créer passwordPolicy.ts** avec règles strictes
- [ ] **Améliorer headers Helmet** (CSP, HSTS)
- [ ] **Vérifier .env dans .gitignore**
- [ ] **Générer nouveaux secrets** (JWT_SECRET, ENCRYPTION_KEY 32+ chars)
- [ ] **Activer HTTPS** sur Netlify (automatique)

### Important (Cette semaine) 🟡

- [ ] **Configurer Netlify Firewall** (bloquer pays hors RDC)
- [ ] **Activer logs Netlify** (surveillance attaques)
- [ ] **Ajouter historique mots de passe** (empêcher réutilisation)
- [ ] **Implémenter CSRF tokens** (formulaires sensibles)
- [ ] **Tester pénétration** (OWASP ZAP)

### Recommandé (Ce mois) ⭐

- [ ] **2FA pour admins** (Google Authenticator)
- [ ] **WAF Netlify** (si budget disponible)
- [ ] **Backup automatique DB** (chaque jour)
- [ ] **Monitoring sécurité** (Sentry, LogRocket)
- [ ] **Audit externe** (pentester professionnel)

---

## 🌐 CONFIGURATION NETLIFY (Interface Web)

### Comment configurer sur Netlify:

1. **Allez sur**: https://app.netlify.com
2. **Sélectionnez**: Projet "boutique-tina"
3. **Menu**: Security → Web Security

### Firewall Traffic Rules

**Cliquez sur "Configure"**:

```yaml
Rule 1: Block suspicious countries
  Type: Country
  Action: Block
  Countries: Sélectionner TOUS sauf:
    ✅ Congo (RDC)
    ✅ France
    ✅ Belgique
    ✅ USA (facultatif)

Rule 2: Rate limit auth endpoints
  Type: Path
  Path: /api/auth/*
  Rate: 10 requests/minute per IP
  Action: Block
```

### Rate Limiting

**Cliquez sur "Configure"**:

```yaml
Global rate limit
  Limit: 100 requests/minute
  Per: IP address
  
Endpoint-specific limits:
  /api/auth/login:
    Limit: 5 requests/15min
    Action: Block 15 minutes
    
  /api/auth/register:
    Limit: 3 requests/hour
    Action: Block 1 hour
    
  /api/orders/*:
    Limit: 20 requests/minute
    Action: Throttle
```

---

## 💰 COÛTS SÉCURITÉ

| Feature | Gratuit | Pro | Coût |
|---------|---------|-----|------|
| HTTPS SSL | ✅ | ✅ | Gratuit |
| Basic Firewall | ✅ | ✅ | Gratuit |
| Rate Limiting | ❌ | ✅ | 19$/mois |
| WAF | ❌ | ✅ | 19$/mois |
| DDoS Protection | Basique | Avancé | 19$/mois |
| Log Drains | ❌ | ✅ | 19$/mois |

**Recommandation**: 
- Commencez avec le plan gratuit ✅
- Passez au Pro si vous avez >1000 utilisateurs/jour

---

## 🚨 INCIDENTS DE SÉCURITÉ - PROCÉDURE

### Si vous détectez une attaque:

1. **Immédiat** (< 5 min):
   - Bloquer l'IP suspecte sur Netlify
   - Vérifier les logs d'activité (`activity_logs`)
   - Vérifier les paiements suspects (`payment_logs`)

2. **Court terme** (< 1h):
   - Révoquer tous les tokens JWT actifs
   - Forcer déconnexion utilisateurs
   - Changer JWT_SECRET
   - Notifier les utilisateurs impactés

3. **Moyen terme** (< 24h):
   - Audit complet de la base de données
   - Restaurer backup si nécessaire
   - Enquête forensique (logs)
   - Rapport d'incident

4. **Long terme** (< 7j):
   - Renforcer les règles qui ont échoué
   - Formation équipe
   - Mise à jour documentation
   - Communication publique si nécessaire (RGPD)

---

## 📞 RESSOURCES & OUTILS

### Tests de sécurité:

- **OWASP ZAP**: https://www.zaproxy.org (scan vulnérabilités)
- **SSL Labs**: https://www.ssllabs.com/ssltest/ (tester HTTPS)
- **Security Headers**: https://securityheaders.com (tester headers)
- **Have I Been Pwned**: https://haveibeenpwned.com/Passwords (mots de passe)

### Monitoring:

- **Sentry**: https://sentry.io (erreurs + attaques)
- **LogRocket**: https://logrocket.com (sessions utilisateurs)
- **Netlify Analytics**: https://www.netlify.com/products/analytics/

---

## ✅ RÉSUMÉ EXÉCUTIF

### État actuel: 7/10 🟢

**Points forts**:
- ✅ Hashing passwords PBKDF2 (excellent)
- ✅ JWT + Bcrypt (bon)
- ✅ Helmet.js + CORS (bon)
- ✅ Encryption AES-256 (excellent)
- ✅ XSS protection (bon)

**Faiblesses**:
- ❌ Rate limiting trop permissif (CRITIQUE)
- ❌ Pas de 2FA admins (important)
- ❌ Politique mots de passe faible (moyenne)
- ❌ Pas de CSRF protection (moyenne)

**Actions prioritaires** (2-3 heures):
1. Modifier rate limiting (5 min)
2. Créer passwordPolicy.ts (30 min)
3. Améliorer headers Helmet (15 min)
4. Configurer Netlify Firewall (30 min)
5. Générer nouveaux secrets forts (10 min)

**Après corrections**: 9/10 🟢 (Excellent!)

---

**🚀 Voulez-vous que j'implémente ces corrections maintenant?**
