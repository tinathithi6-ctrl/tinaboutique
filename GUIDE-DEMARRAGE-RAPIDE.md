# 🚀 GUIDE DE DÉMARRAGE RAPIDE - SYSTÈME PROFESSIONNEL

## ✅ CE QUI A ÉTÉ CRÉÉ

### 📁 Fichiers Créés (9 fichiers)

1. **`src/db/migrations.ts`** - Migrations SQL automatiques
2. **`src/services/ActivityLogger.ts`** - Service de traçabilité
3. **`src/services/CurrencyService.ts`** - Service multi-devises
4. **`src/middleware/trackingMiddleware.ts`** - Middleware tracking
5. **`src/components/admin/ActivityLogs.tsx`** - Interface admin logs
6. **`src/components/admin/KPICard.tsx`** - Composant KPI
7. **`src/pages/admin/AdminDashboardPro.tsx`** - Dashboard professionnel
8. **`SYSTEME-TRACABILITE.md`** - Documentation complète
9. **`INITIALISATION-SYSTEME.bat`** - Script d'installation

---

## 🎯 ÉTAPE 1: INITIALISER LA BASE DE DONNÉES

### Option A: Script Automatique (Recommandé)
```bash
# Double-cliquer sur:
INITIALISATION-SYSTEME.bat

# Ou en ligne de commande:
.\INITIALISATION-SYSTEME.bat
```

### Option B: Manuel
```bash
# Ouvrir psql
psql -U postgres -d tinaboutique

# Copier-coller le contenu des migrations depuis:
# src/db/migrations.ts
```

**Tables créées:**
- ✅ `activity_logs` - Traçabilité complète
- ✅ `payment_logs` - Historique paiements
- ✅ `currency_rates` - Taux de change
- ✅ `user_sessions` - Sessions utilisateur
- ✅ `admin_notifications` - Alertes admin

---

## 🎯 ÉTAPE 2: AJOUTER LES SERVICES AU SERVEUR

### Modifier `src/server.ts`

**En haut du fichier, ajouter les imports:**

```typescript
import { runMigrations } from './db/migrations';
import { ActivityLogger, ActionTypes } from './services/ActivityLogger';
import { CurrencyService } from './services/CurrencyService';
import { injectActivityLogger, autoTrackMiddleware } from './middleware/trackingMiddleware';
```

**Après la création du pool, initialiser les services:**

```typescript
// Après: const pool = new Pool({ ... });

// Initialiser les services
const activityLogger = new ActivityLogger(pool);
const currencyService = new CurrencyService(pool);

// Exécuter les migrations au démarrage
runMigrations(pool).catch(err => {
  console.error('Erreur migrations:', err);
});

// Injecter les middlewares AVANT les routes
app.use(injectActivityLogger(activityLogger));
app.use(autoTrackMiddleware());
```

---

## 🎯 ÉTAPE 3: AJOUTER LES ROUTES API ADMIN

### Ajouter dans `src/server.ts`

```typescript
// Routes Admin - Activity Logs
app.get('/api/admin/activity-logs', authenticateToken, async (req, res) => {
  try {
    const { limit = '50', offset = '0', actionType } = req.query;
    
    const filters = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      actionType: actionType as string || undefined
    };
    
    const logs = await activityLogger.getAllActivities(filters);
    const total = await pool.query('SELECT COUNT(*) FROM activity_logs');
    
    res.json({
      logs,
      total: parseInt(total.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes Admin - Currency Management
app.get('/api/admin/currency-rates', authenticateToken, async (req, res) => {
  try {
    const rates = await currencyService.getAllRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/currency-rates', authenticateToken, async (req, res) => {
  try {
    const { rates } = req.body;
    await currencyService.updateRates(rates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route - Sélection devise utilisateur
app.get('/api/user/currency', authenticateToken, async (req, res) => {
  try {
    const currency = await currencyService.getUserPreferredCurrency(req.user.id);
    res.json({ currency });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/user/currency', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;
    await currencyService.setUserPreferredCurrency(req.user.id, currency);
    res.json({ success: true, currency });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

---

## 🎯 ÉTAPE 4: AJOUTER L'ONGLET LOGS DANS ADMIN

### Modifier `src/pages/Admin.tsx`

**1. Ajouter l'import:**
```typescript
import { ActivityLogs } from "@/components/admin/ActivityLogs";
```

**2. Ajouter l'onglet dans TabsList:**
```typescript
<TabsTrigger value="logs" className="flex items-center gap-2">
  <Activity className="h-4 w-4" />
  Logs d'Activité
</TabsTrigger>
```

**3. Ajouter le contenu de l'onglet:**
```typescript
<TabsContent value="logs" className="mt-6">
  <ActivityLogs />
</TabsContent>
```

---

## 🎯 ÉTAPE 5: CRÉER LE SÉLECTEUR DE DEVISE

### Créer `src/components/CurrencySelector.tsx`

```typescript
import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CurrencySelector = () => {
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    // Charger la devise préférée
    const loadCurrency = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/currency', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrency(data.currency);
          localStorage.setItem('preferredCurrency', data.currency);
        }
      } catch (error) {
        console.error('Erreur chargement devise:', error);
      }
    };

    loadCurrency();
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    
    try {
      await fetch('http://localhost:3001/api/user/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currency: newCurrency })
      });
    } catch (error) {
      console.error('Erreur sauvegarde devise:', error);
    }
    
    // Recharger la page pour mettre à jour les prix
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-gray-500" />
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EUR">€ EUR</SelectItem>
          <SelectItem value="USD">$ USD</SelectItem>
          <SelectItem value="CDF">FC CDF</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
```

### Ajouter dans Header.tsx

```typescript
import { CurrencySelector } from './CurrencySelector';

// Dans le header, ajouter:
<CurrencySelector />
```

---

## 🎯 ÉTAPE 6: TESTER LE SYSTÈME

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Vérifier les tables
```sql
-- Dans psql
SELECT COUNT(*) FROM activity_logs;
SELECT COUNT(*) FROM payment_logs;
SELECT * FROM currency_rates;
```

### 3. Tester le tracking
```
1. Aller sur http://localhost:8080
2. Se connecter
3. Voir un produit
4. Ajouter au panier
5. Aller sur http://localhost:8080/admin
6. Cliquer "Logs d'Activité"
7. ✅ Voir toutes vos actions !
```

### 4. Tester multi-devises
```
1. Sélectionner EUR dans le header
2. Noter un prix (ex: 50€)
3. Changer pour USD
4. ✅ Prix converti automatiquement (54$)
5. Changer pour CDF
6. ✅ Prix en francs congolais (150,000 FC)
```

---

## 📊 EXEMPLE LOGS D'ACTIVITÉ

```
[2024-10-12 18:23:45] LOGIN
  User: client@example.com
  IP: 102.45.67.89
  Location: Kinshasa, RDC
  Device: Chrome/Windows

[2024-10-12 18:24:12] VIEW_PRODUCT
  Product ID: 123
  Price: 50 EUR
  IP: 102.45.67.89

[2024-10-12 18:24:45] ADD_TO_CART
  Product ID: 123
  Quantity: 1
  Price: 50 EUR
  IP: 102.45.67.89

[2024-10-12 18:26:45] ORDER_PLACED
  Order ID: ORD-2024-001
  Amount: 50 EUR (54 USD / 150,000 CDF)
  IP: 102.45.67.89
```

---

## 🛡️ SÉCURITÉ

### Données sensibles masquées
```typescript
// Le middleware sanitize automatiquement:
password: "***MASKED***"
card_number: "***MASKED***"
cvv: "***MASKED***"
```

### Logs immuables
- ❌ Pas de modification possible
- ✅ Horodatage certifié
- ✅ Traçabilité complète

---

## 📈 DASHBOARD PRO

### Accéder au dashboard
```
http://localhost:8080/admin
→ Onglet "Tableau de Bord"
```

### Fonctionnalités
- ✅ 7 KPIs avec tendances
- ✅ 4 graphiques interactifs
- ✅ Top produits temps réel
- ✅ Dernières commandes
- ✅ Filtres période (7j/30j/90j)

---

## ❓ DÉPANNAGE

### Erreur: "Table activity_logs doesn't exist"
```bash
# Exécuter:
.\INITIALISATION-SYSTEME.bat
```

### Erreur: "Cannot find module ActivityLogger"
```bash
# Vérifier que les fichiers existent dans src/services/
# Redémarrer le serveur
```

### Les logs ne s'affichent pas
```bash
# Vérifier que le middleware est ajouté AVANT les routes
# Vérifier les permissions PostgreSQL
```

### Les prix ne se convertissent pas
```bash
# Vérifier la table currency_rates:
SELECT * FROM currency_rates;

# Si vide, exécuter INITIALISATION-SYSTEME.bat
```

---

## 📞 SUPPORT

### En cas de problème:

1. **Vérifier les logs serveur**
   ```bash
   # Dans le terminal où tourne npm run dev
   ```

2. **Vérifier PostgreSQL**
   ```bash
   psql -U postgres -d tinaboutique -c "\dt"
   ```

3. **Consulter la documentation**
   - `SYSTEME-TRACABILITE.md`
   - `PLAN-DASHBOARD-PRO.md`

---

## ✅ CHECKLIST FINALE

- [ ] Script INITIALISATION-SYSTEME.bat exécuté
- [ ] Tables créées dans PostgreSQL
- [ ] Services ajoutés à server.ts
- [ ] Routes API ajoutées
- [ ] Onglet Logs ajouté dans Admin
- [ ] CurrencySelector créé et ajouté au Header
- [ ] Serveur redémarré
- [ ] Tests effectués
- [ ] Dashboard accessible
- [ ] Logs visibles
- [ ] Multi-devises fonctionne

---

## 🎉 FÉLICITATIONS !

Vous disposez maintenant d'un système e-commerce ULTRA-PROFESSIONNEL avec:

✅ **Traçabilité complète** de toutes les actions  
✅ **Protection anti-fraude** avec preuves irréfutables  
✅ **Multi-devises** EUR/USD/CDF pour la RDC  
✅ **Dashboard professionnel** digne de Shopify/Stripe  
✅ **Conformité RGPD** et sécurité maximale  

**Votre site est prêt pour la RDC ! 🇨🇩**

---

Contact Développement: admin@tinaboutique.com  
Documentation: SYSTEME-TRACABILITE.md  
Version: 1.0.0 - Octobre 2024
