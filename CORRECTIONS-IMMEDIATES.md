# ⚡ CORRECTIONS IMMÉDIATES À APPLIQUER

## 🎯 OBJECTIF
Rendre l'application fonctionnelle et sécurisée en 48h

---

## 🔴 CORRECTION #1: Badge Panier Dynamique

**Fichier:** `src/components/Header.tsx`

**Ligne 1:** Ajouter l'import du hook
```typescript
import { useCart } from "@/contexts/CartContext";
```

**Ligne 12:** Ajouter après `const { user, signOut } = useAuth();`
```typescript
const { cartCount } = useCart();
```

**Ligne 156-158:** Remplacer
```typescript
// ❌ AVANT
<span className="...">
  0
</span>

// ✅ APRÈS
<span className="...">
  {cartCount}
</span>
```

---

## 🔴 CORRECTION #2: Icône Panier Cliquable

**Fichier:** `src/components/Header.tsx`

**Ligne 150-159:** Remplacer
```typescript
// ❌ AVANT
<button className={...}>
  <ShoppingBag className="h-5 w-5" />
  <span className="...">{cartCount}</span>
</button>

// ✅ APRÈS
<Link to="/cart">
  <button className={...}>
    <ShoppingBag className="h-5 w-5" />
    <span className="...">{cartCount}</span>
  </button>
</Link>
```

---

## 🔴 CORRECTION #3: Retirer Redirection Admin Forcée

**Fichier:** `src/App.tsx`

**Ligne 39-54:** SUPPRIMER complètement le composant
```typescript
// ❌ SUPPRIMER TOUT CECI
const AdminRedirector = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !roleLoading && user && isAdmin) {
      if (!location.pathname.startsWith("/admin")) {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, location, navigate]);

  return null;
};
```

**Ligne 67:** Supprimer l'utilisation
```typescript
// ❌ SUPPRIMER
<AdminRedirector />
```

---

## 🔴 CORRECTION #4: Recherche Fonctionnelle

**Fichier:** `src/components/Header.tsx`

**Ligne 99-105:** Remplacer
```typescript
// ❌ AVANT
<button className={...}>
  <Search className="h-5 w-5" />
</button>

// ✅ APRÈS
<Link to="/search">
  <button className={...}>
    <Search className="h-5 w-5" />
  </button>
</Link>
```

---

## 🔴 CORRECTION #5: Panier Sans Connexion

**Fichier:** `src/pages/ProductDetails.tsx`

**Ligne 58-66:** Remplacer la fonction complète
```typescript
// ❌ AVANT
const handleAddToCart = (productData, quantity = 1) => {
  if (!user) {
    toast.info('Veuillez vous connecter...');
    navigate('/auth');
    return;
  }
  addToCart(productData, quantity);
  toast.success(`${quantity} x ${productData.name} ajouté !`);
};

// ✅ APRÈS
const handleAddToCart = (productData, quantity = 1) => {
  // Le CartContext gère déjà les utilisateurs non connectés via localStorage
  addToCart(productData, quantity);
  toast.success(`${quantity} x ${productData.name} ajouté au panier !`);
  
  if (!user) {
    toast.info('Connectez-vous pour sauvegarder votre panier', {
      autoClose: 5000,
    });
  }
};
```

**Appliquer la même correction dans:**
- `src/pages/Shop.tsx` ligne 124-136
- `src/pages/CategoryPage.tsx`
- `src/pages/Search.tsx`
- `src/components/boutique/FeaturedProducts.tsx`

---

## 🔴 CORRECTION #6: Index Base de Données

**Créer fichier:** `database_indexes.sql`

```sql
-- Index pour améliorer les performances

-- Produits
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price_eur ON products(price_eur);

-- Commandes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);

-- Panier
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_added ON cart_items(added_at DESC);

-- Utilisateurs
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Articles de commande
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Logs paiement
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user ON payment_logs(user_id);
```

**Exécuter:**
```bash
psql -U tinaboutique_user -d tinaboutique_db -f database_indexes.sql
```

---

## 🔴 CORRECTION #7: Créer .gitignore Complet

**Fichier:** `.gitignore`

```
# Fichiers sensibles
.env
.env.local
.env.production

# Node
node_modules/
npm-debug.log
yarn-error.log
package-lock.json
yarn.lock
.pnpm-debug.log

# Build
dist/
build/
*.tsbuildinfo

# Uploads
uploads/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Tests
coverage/
.nyc_output/

# Backup
*.sql
backup_*
```

---

## 🔴 CORRECTION #8: Créer .env.example

**Fichier:** `.env.example`

```env
# Base de données PostgreSQL
DB_USER=tinaboutique_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_FORT
DB_HOST=localhost
DB_DATABASE=tinaboutique_db
DB_PORT=5432

# JWT Secret (générer avec: openssl rand -hex 32)
JWT_SECRET=VOTRE_JWT_SECRET_64_CARACTERES

# Clé de chiffrement RGPD (générer avec: openssl rand -hex 32)
ENCRYPTION_KEY=VOTRE_ENCRYPTION_KEY_64_CARACTERES

# Paiements Mobile Money RDC
FLUTTERWAVE_PUBLIC_KEY=VOTRE_CLE_PUBLIQUE_FLUTTERWAVE
FLUTTERWAVE_SECRET_KEY=VOTRE_CLE_SECRETE_FLUTTERWAVE
FLUTTERWAVE_WEBHOOK_SECRET=VOTRE_WEBHOOK_SECRET

ORANGE_MONEY_API_KEY=VOTRE_CLE_ORANGE
ORANGE_MONEY_API_SECRET=VOTRE_SECRET_ORANGE
ORANGE_MONEY_MERCHANT_ID=VOTRE_MERCHANT_ID

AIRTEL_MONEY_API_KEY=VOTRE_CLE_AIRTEL
AIRTEL_MONEY_API_SECRET=VOTRE_SECRET_AIRTEL
AIRTEL_MONEY_MERCHANT_ID=VOTRE_MERCHANT_ID

# Configuration environnement
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
PAYMENT_ENV=sandbox

# AWS (optionnel - pour stockage images)
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY

# Email (optionnel - SendGrid, Mailgun, etc.)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=VOTRE_CLE_API_EMAIL
EMAIL_FROM=noreply@votredomaine.com
```

---

## 🔴 CORRECTION #9: Script Backup DB

**Créer fichier:** `scripts/backup-db.sh`

```bash
#!/bin/bash

# Configuration
DB_NAME="tinaboutique_db"
DB_USER="tinaboutique_user"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Créer dossier backups si inexistant
mkdir -p $BACKUP_DIR

# Backup
echo "🔄 Backup de la base de données..."
pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compression
echo "📦 Compression..."
gzip $BACKUP_FILE

# Nettoyage (garder seulement les 7 derniers jours)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup terminé: $BACKUP_FILE.gz"
```

**Rendre exécutable:**
```bash
chmod +x scripts/backup-db.sh
```

**Ajouter au cron (Linux/Mac):**
```bash
crontab -e
# Ajouter:
0 2 * * * /chemin/vers/projet/scripts/backup-db.sh
```

---

## 🔴 CORRECTION #10: Créer Service Paiement Basique

**Créer fichier:** `src/payments.ts`

```typescript
import crypto from 'crypto';
import { pool } from './db';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expiresAt: Date;
  createdAt: Date;
}

class PaymentService {
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    orderId: string;
    customerId: string;
    paymentMethod: string;
    metadata?: any;
  }): Promise<PaymentIntent> {
    const intentId = 'pi_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Logger dans payment_logs
    await pool.query(`
      INSERT INTO payment_logs (
        transaction_id, order_id, user_id, payment_method,
        amount, currency, status, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      intentId,
      data.orderId,
      data.customerId,
      data.paymentMethod,
      data.amount,
      data.currency,
      'pending',
      'create_intent',
      JSON.stringify(data.metadata || {})
    ]);

    return {
      id: intentId,
      amount: data.amount,
      currency: data.currency,
      orderId: data.orderId,
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      expiresAt,
      createdAt: new Date(),
    };
  }

  async processPayment(intentId: string, paymentData: any): Promise<any> {
    // TODO: Implémenter vraies intégrations selon paymentMethod
    // Pour l'instant, simulation de succès

    await pool.query(`
      UPDATE payment_logs
      SET status = 'completed', action = 'process_payment'
      WHERE transaction_id = $1
    `, [intentId]);

    // Mettre à jour le statut de la commande
    const log = await pool.query(`
      SELECT order_id FROM payment_logs WHERE transaction_id = $1
    `, [intentId]);

    if (log.rows.length > 0) {
      await pool.query(`
        UPDATE orders SET status = 'completed' WHERE id = $1
      `, [log.rows[0].order_id]);
    }

    return {
      success: true,
      transactionId: intentId,
      status: 'completed',
      message: 'Paiement traité avec succès (mode test)'
    };
  }

  async handleWebhook(provider: string, signature: string, payload: any): Promise<boolean> {
    // TODO: Vérifier la signature selon le provider
    // TODO: Traiter le payload
    
    console.log(`Webhook reçu de ${provider}`);
    
    return true; // Temporaire
  }
}

export const paymentService = new PaymentService();
```

---

## 🔐 CORRECTION #11: Sécuriser les Clés

### Étape 1: Révoquer les clés AWS actuelles
1. Se connecter à AWS Console
2. IAM → Utilisateurs → Votre utilisateur
3. Onglet "Security credentials"
4. "Make inactive" puis "Delete" pour la clé exposée

### Étape 2: Générer de nouvelles clés
```bash
# JWT Secret
openssl rand -hex 32

# Encryption Key
openssl rand -hex 32

# Nouveau mot de passe DB
openssl rand -base64 32
```

### Étape 3: Mettre à jour .env avec les nouvelles valeurs
```env
JWT_SECRET="NOUVELLE_VALEUR_GENEREE"
ENCRYPTION_KEY="NOUVELLE_VALEUR_GENEREE"
DB_PASSWORD="NOUVEAU_MOT_DE_PASSE"
AWS_ACCESS_KEY_ID="NOUVELLE_CLE_AWS"
AWS_SECRET_ACCESS_KEY="NOUVEAU_SECRET_AWS"
```

### Étape 4: Ajouter .env au .gitignore
```bash
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "security: Remove .env from version control"
```

---

## 📋 ORDRE D'APPLICATION

### Phase 1 (30 min)
1. ✅ Correction #11 (Sécurité - URGENT)
2. ✅ Correction #7 (.gitignore)
3. ✅ Correction #8 (.env.example)

### Phase 2 (2h)
4. ✅ Correction #1 (Badge panier)
5. ✅ Correction #2 (Icône cliquable)
6. ✅ Correction #3 (Redirection admin)
7. ✅ Correction #4 (Recherche)

### Phase 3 (3h)
8. ✅ Correction #5 (Panier sans connexion)
9. ✅ Correction #10 (Service paiement)
10. ✅ Correction #6 (Index DB)
11. ✅ Correction #9 (Backup)

---

## ✅ TEST APRÈS CORRECTIONS

### Test 1: Badge Panier
1. Démarrer l'app
2. Ajouter un produit au panier
3. Vérifier que le badge affiche "1"
4. Ajouter un autre produit
5. Vérifier que le badge affiche "2"

### Test 2: Navigation Panier
1. Cliquer sur l'icône panier dans le header
2. Vérifier la redirection vers /cart
3. Vérifier l'affichage des articles

### Test 3: Admin
1. Se connecter en tant qu'admin
2. Naviguer vers /boutique
3. Vérifier que la navigation fonctionne

### Test 4: Recherche
1. Cliquer sur l'icône de recherche
2. Vérifier la redirection vers /search

### Test 5: Panier Anonyme
1. Se déconnecter (ou mode incognito)
2. Ajouter un produit au panier
3. Vérifier l'ajout réussi
4. Vérifier localStorage

---

## 🎉 RÉSULTAT ATTENDU

Après ces corrections:
- ✅ Panier fonctionnel à 100%
- ✅ Navigation fluide
- ✅ Sécurité renforcée
- ✅ Performance améliorée
- ✅ Admin peut tester le site

**L'application sera prête pour des tests utilisateurs en environnement de staging.**
