import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { pool, supabase } from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import expressValidator from 'express-validator';
import morgan from 'morgan';
import { ActivityLogger, ActionTypes } from './services/ActivityLogger';
import { CurrencyService } from './services/CurrencyService';
import { notificationService } from './services/NotificationService';
import { injectActivityLogger, autoTrackMiddleware, logAction } from './middleware/trackingMiddleware';
import { validatePassword as validatePasswordPolicy, PASSWORD_POLICY } from './utils/passwordPolicy';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant dans les variables d\'environnement');
  process.exit(1);
}

// 🚀 INITIALISER LES SERVICES DE TRAÇABILITÉ ET MULTI-DEVISES
const activityLogger = new ActivityLogger(pool);
const currencyService = new CurrencyService(pool);

// Initialiser le cache des devises au démarrage
currencyService.reloadCache().then(() => {
  console.log('💱 Cache des devises initialisé.');
}).catch(err => {
  console.error('Erreur initialisation cache devises:', err);
});

console.log('ℹ️ Services initialisés.');

// Configuration des origines CORS autorisées
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://sparkling-biscotti-defcce.netlify.app',
    'https://tinaboutique.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean) // Enlever les undefined
  : ['http://localhost:8081', 'http://localhost:8080', 'http://10.235.227.207:8080'];

console.log('🌐 CORS - Origines autorisées:', allowedOrigins);

// --- MIDDLEWARES DE SÉCURITÉ ---

// Rate limiting pour les tentatives d'authentification
// 🔒 SÉCURITÉ RENFORCÉE: 5 tentatives en 15 minutes (production)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 en prod, 50 en dev
  message: {
    error: 'Trop de tentatives de connexion. Compte temporairement bloqué.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // keyGenerator: (req) => req.ip, // Utilise le défaut (req.ip) pour éviter les erreurs IPv6
  handler: (req, res) => {
    console.warn(`🚨 SÉCURITÉ: Rate limit dépassé - IP: ${req.ip} - Path: ${req.path}`);
    res.status(429).json({
      error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      retryAfter: 900 // secondes
    });
  }
});

// Rate limiting général
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requêtes (très permissif pour dev)
  message: { error: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
      };
    }
  }
}

// Middleware d'authentification JWT
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Vérifier si l'utilisateur existe toujours
    const userResult = await pool.query('SELECT id, role, email FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = {
      id: decoded.userId,
      role: userResult.rows[0].role,
      email: userResult.rows[0].email
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expiré' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware d'autorisation admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
};

// Middleware de validation des entrées
const validateInput = (req: any, res: any, next: any) => {
  // Sanitisation basique des entrées
  const sanitize = (obj: any) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Échapper les caractères HTML dangereux
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].replace(/<[^>]*>/g, '');
        // Limiter la longueur
        if (obj[key].length > 1000) {
          obj[key] = obj[key].substring(0, 1000);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: Postman, apps mobiles)
    if (!origin) {
      return callback(null, true);
    }

    // Autoriser si l'origine est dans la liste blanche
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Autoriser tous les domaines de prévisualisation Netlify (avec hash)
    if (origin.includes('--sparkling-biscotti-defcce.netlify.app') ||
      origin.endsWith('.netlify.app')) {
      console.log('✅ Domaine Netlify autorisé:', origin);
      return callback(null, true);
    }

    // Bloquer les autres
    console.warn('❌ Domaine bloqué par CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Autoriser les cookies et les en-têtes d'autorisation
};

// Configuration multer pour l'upload d'images
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' })); // Limiter la taille du body
app.use('/uploads', express.static(uploadsDir));

// 🔍 MIDDLEWARES DE TRAÇABILITÉ AUTOMATIQUE
app.use(injectActivityLogger(activityLogger));
app.use(autoTrackMiddleware());

// --- ENDPOINT DE SANTÉ (Monitoring) ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- APPLICATION DES MIDDLEWARES DE SÉCURITÉ ---

// Headers de sécurité (OWASP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Logging des requêtes (sécurisé)
app.use(morgan('combined', {
  skip: (req, res) => {
    // Ne pas logger les requêtes de santé/statiques
    return req.url === '/health' || req.url.startsWith('/uploads/');
  }
}));

// Rate limiting général
app.use('/api/', generalLimiter);

// Validation des entrées sur toutes les routes
app.use('/api/', validateInput);

// --- API D'AUTHENTIFICATION ---

// Validation du mot de passe (OWASP)
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return { isValid: errors.length === 0, errors };
};

// Validation email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Inscription avec sécurité renforcée
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { email, password, fullName } = req.body;

  // Validation des entrées
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, mot de passe et nom complet requis.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide.' });
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return res.status(400).json({ error: 'Le nom doit contenir entre 2 et 100 caractères.' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      error: 'Mot de passe trop faible.',
      details: passwordValidation.errors
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Augmenter le coût de hachage
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, 'user']
    );

    // Logger l'inscription (sans le mot de passe)
    console.log(`Nouvel utilisateur inscrit: ${email} (ID: ${newUser.rows[0].id})`);

    res.status(201).json({
      id: newUser.rows[0].id,
      email: newUser.rows[0].email,
      fullName: newUser.rows[0].full_name,
      role: newUser.rows[0].role
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
  }
});

// Connexion avec sécurité renforcée
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Validation des entrées
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide.' });
  }

  try {
    const result = await pool.query('SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Logger les tentatives de connexion échouées
      console.log(`Tentative de connexion échouée pour: ${email}`);
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'tinaboutique-api',
        audience: 'tinaboutique-client'
      }
    );

    // Logger la connexion réussie
    console.log(`Connexion réussie: ${email} (ID: ${user.id})`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Fonction utilitaire pour calculer le prix final d'un produit
function calculateProductPrice(product: any, quantity: number = 1) {
  let finalPrice = product.price_eur;
  let discountApplied = false;
  let discountType = null;
  let discountAmount = 0;

  // Vérifier les promotions actives
  if (product.sale_price_eur &&
    product.sale_start_date &&
    product.sale_end_date &&
    new Date() >= new Date(product.sale_start_date) &&
    new Date() <= new Date(product.sale_end_date)) {
    finalPrice = product.sale_price_eur;
    discountApplied = true;
    discountType = 'promotion';
    discountAmount = product.price_eur - product.sale_price_eur;
  }

  // Appliquer les réductions par quantité si applicable
  if (product.bulk_discount_threshold &&
    product.bulk_discount_percentage &&
    quantity >= product.bulk_discount_threshold) {
    const bulkDiscount = (finalPrice * product.bulk_discount_percentage) / 100;
    finalPrice = finalPrice - bulkDiscount;
    discountApplied = true;
    if (discountType === 'promotion') {
      discountType = 'promotion+bulk';
    } else {
      discountType = 'bulk';
    }
    discountAmount += bulkDiscount;
  }

  return {
    originalPrice: product.price_eur,
    finalPrice: Math.max(0, finalPrice), // Assurer que le prix ne soit pas négatif
    discountApplied,
    discountType,
    discountAmount,
    currency: 'EUR'
  };
}

// --- API PUBLIQUE ---

// Obtenir tous les produits (avec filtres optionnels)
app.get('/api/products', async (req, res) => {
  try {
    // Utiliser Supabase au lieu de PostgreSQL direct
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    // Ajouter les informations de prix calculées
    const productsWithPricing = products.map(product => ({
      ...product,
      pricing: calculateProductPrice(product, 1)
    }));

    res.json(productsWithPricing);
  } catch (error) {
    console.error('Erreur API products:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir un seul produit par son ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    const product = result.rows[0];
    const pricing = calculateProductPrice(product, parseInt(quantity as string));
    res.json({
      ...product,
      pricing
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Calculer le prix d'un produit pour une quantité donnée
app.get('/api/products/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;

    const result = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    const product = result.rows[0];
    const pricing = calculateProductPrice(product, parseInt(quantity as string));

    res.json({
      productId: id,
      quantity: parseInt(quantity as string),
      pricing
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir toutes les catégories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Créer une catégorie
app.post('/api/admin/categories', async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const query = `
      INSERT INTO categories (name, description, image_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, description, image_url];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour une catégorie
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    const query = `
      UPDATE categories
      SET name = $1, description = $2, image_url = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, description, image_url, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer une catégorie
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});


// --- API D'ADMINISTRATION (SÉCURISÉES) ---

// Créer un produit (ADMIN UNIQUEMENT)
app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, images } = req.body;

    // Utiliser Supabase au lieu de PostgreSQL direct
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        category_id,
        price_eur,
        price_usd,
        price_cdf,
        stock_quantity,
        images,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur API admin products:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour un produit (ADMIN UNIQUEMENT)
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, images, is_active } = req.body;
    const query = `
      UPDATE products
      SET name = $1, description = $2, category_id = $3, price_eur = $4, price_usd = $5, price_cdf = $6, stock_quantity = $7, images = $8, is_active = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `;
    const values = [name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, images, is_active, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer un produit (ADMIN UNIQUEMENT)
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API DE RAPPORTS (ADMIN UNIQUEMENT) ---

// Obtenir des statistiques de ventes générales (ADMIN UNIQUEMENT)
app.get('/api/admin/reports/sales-summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalRevenue = await pool.query(`
      SELECT 
        SUM(CASE WHEN currency = 'EUR' THEN total_amount ELSE 0 END) as total_eur,
        SUM(CASE WHEN currency = 'USD' THEN total_amount ELSE 0 END) as total_usd,
        SUM(CASE WHEN currency = 'CDF' THEN total_amount ELSE 0 END) as total_cdf
      FROM orders WHERE status = 'completed';
    `);

    const totalOrders = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'completed';");
    const totalProductsSold = await pool.query('SELECT SUM(quantity) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = \'completed\');');

    res.json({
      total_revenue: totalRevenue.rows[0],
      total_orders: parseInt(totalOrders.rows[0].count, 10),
      total_products_sold: parseInt(totalProductsSold.rows[0].sum, 10) || 0,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé des ventes:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir les ventes mensuelles pour un graphique
app.get('/api/admin/reports/monthly-sales', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN currency = 'EUR' THEN total_amount ELSE 0 END) as revenue_eur,
        SUM(CASE WHEN currency = 'USD' THEN total_amount ELSE 0 END) as revenue_usd,
        SUM(CASE WHEN currency = 'CDF' THEN total_amount ELSE 0 END) as revenue_cdf
      FROM orders 
      WHERE status = 'completed'
      GROUP BY month
      ORDER BY month;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes mensuelles:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir les ventes sur une période (trimestrielle, annuelle)
app.get('/api/admin/reports/sales-over-time', async (req, res) => {
  const { period = 'monthly' } = req.query as { period: string };
  try {
    let format;

    switch (period) {
      case 'quarterly':
        format = 'YYYY-"Q"Q';
        break;
      case 'yearly':
        format = 'YYYY';
        break;
      default:
        format = 'YYYY-MM';
        break;
    }

    const query = `
      SELECT 
        TO_CHAR(created_at, '${format}') as period,
        SUM(CASE WHEN currency = 'EUR' THEN total_amount ELSE 0 END) as revenue_eur,
        SUM(CASE WHEN currency = 'USD' THEN total_amount ELSE 0 END) as revenue_usd,
        SUM(CASE WHEN currency = 'CDF' THEN total_amount ELSE 0 END) as revenue_cdf
      FROM orders 
      WHERE status = 'completed'
      GROUP BY period
      ORDER BY period;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(`Erreur lors de la récupération des ventes (${period}):`, error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir les clients les plus fidèles
app.get('/api/admin/reports/loyal-customers', async (req, res) => {
  try {
    const limit = req.query.limit || 10; // Par défaut, on prend les 10 meilleurs clients
    const result = await pool.query(`
      SELECT
        customer_info ->> 'email' as email,
        customer_info ->> 'name' as name,
        COUNT(id) as total_orders,
        SUM(total_amount) as total_spent_eur -- Suppose que la devise principale pour le classement est l'EUR
      FROM orders
      WHERE status = 'completed' AND customer_info ->> 'email' IS NOT NULL
      GROUP BY email, name
      ORDER BY total_orders DESC, total_spent_eur DESC
      LIMIT $1;
    `, [limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients fidèles:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir les produits les plus vendus
app.get('/api/admin/reports/top-products', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.price_eur,
        p.price_usd,
        p.price_cdf,
        p.images[1] as image_url,
        c.name as category_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name, p.price_eur, p.price_usd, p.price_cdf, p.images, c.name
      ORDER BY total_sold DESC
      LIMIT $1;
    `, [limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits populaires:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API CHATBOT (INTELLIGENCE ARTIFICIELLE) ---

app.post('/api/chatbot', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Clé API Gemini manquante sur le serveur' });
  }

  const { messages } = req.body;
  const lastMessage = messages?.length ? messages[messages.length - 1]?.text ?? '' : '';

  if (!lastMessage) {
    return res.json({ reply: "Je n'ai pas reçu de message." });
  }

  try {
    // 1. Recherche de contexte (Produits)
    const searchTerm = lastMessage.split(' ').slice(0, 5).join(' ');
    const productQuery = `
      SELECT name, description, price_eur, stock_quantity 
      FROM products 
      WHERE is_active = true 
      AND (name ILIKE $1 OR description ILIKE $1)
      LIMIT 3
    `;
    const productsResult = await pool.query(productQuery, [`%${searchTerm}%`]);
    const products = productsResult.rows;

    // 2. Recherche de contexte (Catégories)
    let categories = [];
    const categoryKeywords = ['catégories', 'articles', 'types', 'sections', 'gamme', 'chaussures', 'talons'];
    const containsCategoryKeyword = categoryKeywords.some(keyword => lastMessage.toLowerCase().includes(keyword));

    if (containsCategoryKeyword) {
      const allCategories = await pool.query('SELECT name, description FROM categories');
      categories = allCategories.rows;
    } else {
      const categoryQuery = `
        SELECT name, description 
        FROM categories 
        WHERE name ILIKE $1 OR description ILIKE $1
        LIMIT 3
      `;
      const categoriesResult = await pool.query(categoryQuery, [`%${searchTerm}%`]);
      categories = categoriesResult.rows;
    }

    // 3. Prompt pour Gemini
    const systemPrompt = `Tu es un assistant clientèle amical, expert en mode pour 'Boutique Tina la New-Yorkaise'.
    Ton objectif est de guider les clients et répondre à leurs questions sur nos produits.
    
    CONTEXTE:
    Produits pertinents: ${JSON.stringify(products)}
    Catégories pertinentes: ${JSON.stringify(categories)}
    
    HISTORIQUE:
    ${JSON.stringify(messages)}
    
    Réponds poliment et utilement au dernier message. Sois concis.`;

    // 4. Appel API Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const botResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je ne peux pas répondre pour le moment.";

    // 5. Réponse
    res.json({ reply: botResponse });

  } catch (error: any) {
    console.error('Erreur Chatbot:', error);
    res.status(500).json({ reply: "Désolé, j'ai rencontré une erreur technique." });
  }
});

// Port d'écoute
app.listen(port, () => {
  console.log(`🚀 Le serveur écoute sur le port ${port}`);
});


// Obtenir les statistiques de commandes par catégorie
app.get('/api/admin/reports/orders-by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.name as category_name,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status = 'completed'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats par catégorie:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Changer le statut d'une commande
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Statut requis' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- APIs PROFILS UTILISATEURS ---

// Obtenir le profil de l'utilisateur connecté
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      shipping_address: user.shipping_address,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
app.put('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { full_name, phone, shipping_address } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, phone = $2, shipping_address = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [full_name, phone, shipping_address, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: result.rows[0].id,
      email: result.rows[0].email,
      full_name: result.rows[0].full_name,
      phone: result.rows[0].phone,
      shipping_address: result.rows[0].shipping_address,
      role: result.rows[0].role,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// GET /api/profile/stats - Statistiques utilisateur
app.get('/api/profile/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const ordersCountResult = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [userId]
    );
    const totalOrders = parseInt(ordersCountResult.rows[0].total) || 0;

    const totalSpentResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM orders 
       WHERE user_id = $1 AND status IN ('paid', 'shipped', 'delivered')`,
      [userId]
    );
    const totalSpent = parseFloat(totalSpentResult.rows[0].total) || 0;

    const loyaltyPoints = Math.floor(totalSpent);

    let tier = 'bronze';
    if (totalSpent >= 1000) tier = 'platinum';
    else if (totalSpent >= 500) tier = 'gold';
    else if (totalSpent >= 100) tier = 'silver';

    res.json({ totalOrders, totalSpent, loyaltyPoints, tier });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/profile/password - Changer le mot de passe
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Champs requis' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Min 8 caractères' });

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Mot de passe modifié' });
  } catch (error) {
    console.error('Erreur password:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/orders - Récupérer les commandes
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const result = await pool.query(
      'SELECT id, created_at, total_amount, currency, status, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur orders:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- APIs UTILISATEURS ADMIN (ADMIN UNIQUEMENT) ---

// Obtenir tous les utilisateurs (avec recherche) (ADMIN UNIQUEMENT)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT id, email, full_name, role, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- APIs PANIERS ABANDONNÉS ---

// Obtenir les paniers abandonnés
app.get('/api/admin/abandoned-carts', async (req, res) => {
  try {
    // Vérifier si la table cart_items existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cart_items'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }

    const { days = 30, limit = 50 } = req.query;

    const result = await pool.query(`
      SELECT
        ci.*,
        p.name as product_name,
        p.price_eur,
        p.price_usd,
        p.price_cdf,
        p.images[1] as image_url,
        u.email as user_email,
        u.full_name as user_name,
        EXTRACT(EPOCH FROM (NOW() - ci.added_at)) / 86400 as days_old
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON ci.user_id::uuid = u.id
      WHERE ci.added_at < NOW() - INTERVAL '${days} days'
      ORDER BY ci.added_at DESC
      LIMIT $1;
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des paniers abandonnés:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Statistiques des paniers abandonnés
app.get('/api/admin/abandoned-carts/stats', async (req, res) => {
  try {
    // Vérifier si la table cart_items existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cart_items'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json({
        total_abandoned_carts: 0,
        total_abandoned_value: 0,
        carts_last_24h: 0,
        carts_last_7d: 0,
        carts_last_30d: 0,
        avg_cart_age: 0
      });
    }

    const stats = await pool.query(`
      SELECT
        COUNT(DISTINCT ci.user_id) as total_abandoned_carts,
        COALESCE(SUM(ci.quantity * p.price_eur), 0) as total_abandoned_value,
        COUNT(DISTINCT CASE WHEN ci.added_at > NOW() - INTERVAL '24 hours' THEN ci.user_id END) as carts_last_24h,
        COUNT(DISTINCT CASE WHEN ci.added_at > NOW() - INTERVAL '7 days' THEN ci.user_id END) as carts_last_7d,
        COUNT(DISTINCT CASE WHEN ci.added_at > NOW() - INTERVAL '30 days' THEN ci.user_id END) as carts_last_30d,
        COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - ci.added_at)) / 86400), 0) as avg_cart_age
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.added_at < NOW() - INTERVAL '1 day';
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Erreur lors du calcul des stats paniers abandonnés:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Nettoyer les paniers abandonnés (expiration automatique)
app.delete('/api/admin/abandoned-carts/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.query; // Par défaut 90 jours

    const result = await pool.query(`
      DELETE FROM cart_items
      WHERE added_at < NOW() - INTERVAL '${days} days';
    `);

    res.json({
      message: `${result.rowCount} paniers abandonnés supprimés`,
      deleted_count: result.rowCount
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des paniers abandonnés:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir les commandes filtrées
app.get('/api/admin/orders/filtered', async (req, res) => {
  try {
    // Vérifier si la table orders existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'orders'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }

    const { status, category, minPrice, maxPrice, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`o.total_amount >= $${paramIndex}`);
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`o.total_amount <= $${paramIndex}`);
      params.push(maxPrice);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`o.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`o.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Requête simplifiée pour commencer
    const query = `
      SELECT
        o.*,
        u.full_name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id::uuid = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    params.push(limit, offset);

    console.log('Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes filtrées:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});


// Obtenir toutes les commandes (ADMIN UNIQUEMENT)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Vérifier d'abord si la table orders existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'orders'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json([]); // Retourner un tableau vide si la table n'existe pas
    }

    const result = await pool.query(`
      SELECT
        o.*,
        u.full_name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id::uuid = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour le statut d'une commande (Admin)
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir tous les utilisateurs (Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour le rôle d'un utilisateur (ADMIN UNIQUEMENT)
app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role, created_at',
      [role, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Créer un nouvel utilisateur admin (ADMIN UNIQUEMENT)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, full_name, role = 'admin' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
      [email, hashedPassword, full_name || email.split('@')[0], role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création utilisateur admin:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer un utilisateur (ADMIN UNIQUEMENT)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.userId;

    // Empêcher l'admin de se supprimer lui-même
    if (id === adminId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte depuis cette interface.' });
    }

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query('SELECT email, role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userEmail = userCheck.rows[0].email;
    const userName = userCheck.rows[0].full_name;

    // Supprimer l'utilisateur
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    // Logger l'action
    console.log(`Admin ${adminId} a supprimé l'utilisateur ${userEmail}`);

    // 🔔 Notification de suppression
    notificationService.send({
      email: userEmail,
      templateName: 'account_deleted',
      data: {
        customerName: userName || 'Client'
      },
      channels: ['email']
    }).catch(err => console.error('Erreur notification suppression:', err));

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer son propre compte (Utilisateur)
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis pour confirmer la suppression' });
    }

    // Vérifier le mot de passe
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Récupérer les infos avant suppression
    const userData = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userData.rows[0];

    // Supprimer toutes les données associées (cascade)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // 🔔 Notification d'auto-suppression
    if (user) {
      notificationService.send({
        email: user.email,
        templateName: 'account_deleted',
        data: {
          customerName: user.full_name || 'Client'
        },
        channels: ['email']
      }).catch(err => console.error('Erreur notification auto-suppression:', err));
    }

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Demander la réinitialisation du mot de passe
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Vérifier que l'utilisateur existe
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const user = userResult.rows[0];

    // Générer un token de réinitialisation unique
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la DB
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour l'instant, on retourne le token (à enlever en production!)
    const resetLink = `${process.env.FRONTEND_URL || 'https://sparkling-biscotti-defcce.netlify.app'}/reset-password?token=${resetToken}&email=${email}`;

    console.log(`🔐 Lien de réinitialisation pour ${email}: ${resetLink}`);

    res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // TEMPORAIRE pour test - à enlever en production
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Réinitialiser le mot de passe
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token et nouveau mot de passe requis' });
    }

    // Vérifier que le token est valide
    const userResult = await pool.query(
      'SELECT id, reset_token, reset_token_expiry FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].reset_token) {
      return res.status(400).json({ error: 'Token de réinitialisation invalide ou expiré' });
    }

    const user = userResult.rows[0];

    // Vérifier l'expiration
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'Token de réinitialisation expiré' });
    }

    // Vérifier le token
    const isTokenValid = await bcrypt.compare(token, user.reset_token);
    if (!isTokenValid) {
      return res.status(400).json({ error: 'Token de réinitialisation invalide' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour le statut de commande et ajouter tracking (ADMIN UNIQUEMENT)
app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, carrier } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide. Statuts valides: ' + validStatuses.join(', ')
      });
    }

    // Construire la requête de mise à jour
    let query = 'UPDATE orders SET status = $1';
    const params: any[] = [status];
    let paramIndex = 2;

    if (tracking_number) {
      query += `, tracking_number = $${paramIndex}`;
      params.push(tracking_number);
      paramIndex++;
    }

    if (carrier) {
      query += `, carrier = $${paramIndex}`;
      params.push(carrier);
      paramIndex++;
    }

    if (status === 'shipped') {
      query += `, shipped_at = NOW()`;
    } else if (status === 'delivered') {
      query += `, delivered_at = NOW()`;
    }

    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const order = result.rows[0];

    // 🔔 Notification automatique si expédition
    if (status === 'shipped' && tracking_number) {
      const userInfo = await pool.query('SELECT email, phone, full_name FROM users WHERE id = $1', [order.user_id]);
      if (userInfo.rows.length > 0) {
        const user = userInfo.rows[0];
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        notificationService.send({
          email: user.email,
          phone: user.phone,
          templateName: 'shipment_tracking',
          data: {
            customerName: user.full_name || 'Client',
            orderId: id,
            trackingNumber: tracking_number,
            carrier: carrier || 'Transporteur',
            estimatedDelivery: estimatedDelivery.toLocaleDateString('fr-FR')
          },
          channels: ['email', 'whatsapp']
        }).catch(err => console.error('Erreur notification expédition:', err));
      }
    }

    res.json({
      message: 'Statut de commande mis à jour',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir le suivi d'une commande (Utilisateur ou Admin)
app.get('/api/orders/:id/tracking', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const isAdmin = (req as any).user.role === 'admin';

    // Requête selon le rôle
    let query = `
      SELECT 
        id, 
        status, 
        tracking_number, 
        carrier,
        created_at,
        shipped_at,
        delivered_at,
        total_amount,
        currency
      FROM orders 
      WHERE id = $1
    `;
    const params = [id];

    // Si pas admin, vérifier que c'est sa commande
    if (!isAdmin) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const order = result.rows[0];

    // Créer l'historique de suivi
    const trackingHistory = [];

    if (order.created_at) {
      trackingHistory.push({
        status: 'pending',
        label: 'Commande créée',
        date: order.created_at,
        completed: true
      });
    }

    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      trackingHistory.push({
        status: 'processing',
        label: 'En préparation',
        date: order.created_at,
        completed: true
      });
    }

    if (order.shipped_at) {
      trackingHistory.push({
        status: 'shipped',
        label: 'Expédiée',
        date: order.shipped_at,
        completed: true
      });
    }

    if (order.delivered_at) {
      trackingHistory.push({
        status: 'delivered',
        label: 'Livrée',
        date: order.delivered_at,
        completed: true
      });
    }

    if (order.status === 'cancelled') {
      trackingHistory.push({
        status: 'cancelled',
        label: 'Annulée',
        date: order.created_at,
        completed: true
      });
    }

    res.json({
      orderId: order.id,
      currentStatus: order.status,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      trackingHistory,
      estimatedDelivery: order.shipped_at ?
        new Date(new Date(order.shipped_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() :
        null
    });
  } catch (error) {
    console.error('Erreur récupération suivi:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// 🔧 ADMIN: Récupérer les paramètres du site
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY setting_key');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// 🔧 ADMIN: Mettre à jour les paramètres du site
app.post('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const settings = req.body;

    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'boolean' ? String(value) : String(value);

      await pool.query(`
        INSERT INTO site_settings (setting_key, setting_value, updated_by, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()
      `, [key, stringValue, userId]);
    }

    // Vérifier si les services sont configurés
    const sendgridConfigured = !!(process.env.SENDGRID_API_KEY);
    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    await pool.query(`
      UPDATE site_settings 
      SET setting_value = $1 
      WHERE setting_key = 'sendgrid_configured'
    `, [String(sendgridConfigured)]);

    await pool.query(`
      UPDATE site_settings 
      SET setting_value = $1 
      WHERE setting_key = 'twilio_configured'
    `, [String(twilioConfigured)]);

    const result = await pool.query('SELECT * FROM site_settings ORDER BY setting_key');
    res.json({ message: 'Paramètres enregistrés', settings: result.rows });
  } catch (error) {
    console.error('Erreur mise à jour settings:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// 📱 ADMIN: Tester l'envoi WhatsApp
app.post('/api/admin/test-whatsapp', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Numéro destinataire requis' });
    }

    // Vérifier configuration Twilio
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(400).json({
        error: 'Twilio non configuré. Ajoutez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN dans les variables d\'environnement.'
      });
    }

    // Envoyer message de test
    await notificationService.send({
      phone: to,
      templateName: 'new_arrivals',
      data: {
        description: 'Test de configuration WhatsApp Business - TinaBoutique',
        shopLink: process.env.FRONTEND_URL || 'https://sparkling-biscotti-defcce.netlify.app'
      },
      channels: ['whatsapp']
    });

    res.json({ message: 'Message de test envoyé avec succès !' });
  } catch (error: any) {
    console.error('Erreur test WhatsApp:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'envoi du test WhatsApp'
    });
  }
});

// 📢 ADMIN: Envoyer une notification broadcast (soldes, nouveautés)
app.post('/api/admin/broadcast', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, title, message, discount, shopLink } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type et message requis' });
    }

    // Récupérer tous les utilisateurs actifs
    const usersResult = await pool.query('SELECT email, phone, full_name FROM users WHERE role = $1', ['user']);
    const recipients = usersResult.rows.map(u => ({ email: u.email, phone: u.phone }));

    let templateName = '';
    let data: any = { message, shopLink: shopLink || process.env.FRONTEND_URL + '/shop' };

    if (type === 'sale') {
      templateName = 'sale_announcement';
      data.discount = discount || 30;
    } else if (type === 'new_arrivals') {
      templateName = 'new_arrivals';
      data.description = message;
    }

    if (!templateName) {
      return res.status(400).json({ error: 'Type de broadcast invalide (sale ou new_arrivals)' });
    }

    // Envoyer en masse
    await notificationService.sendBroadcast(recipients, templateName, data, ['email', 'whatsapp']);

    res.json({
      message: `Broadcast envoyé à ${recipients.length} destinataires`,
      count: recipients.length
    });
  } catch (error) {
    console.error('Erreur envoi broadcast:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// 🛒 Rappel automatique pour paniers abandonnés (Cron job ou manuel)
app.post('/api/admin/remind-abandoned-carts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Trouver les paniers abandonnés (non modifiés depuis 24h minimum)
    const abandonedCartsQuery = `
      SELECT 
        u.id as user_id,
        u.email,
        u.phone,
        u.full_name,
        COUNT(ci.id) as item_count
      FROM users u
      INNER JOIN cart_items ci ON ci.user_id = u.id
      WHERE ci.updated_at < NOW() - INTERVAL '24 hours'
      GROUP BY u.id, u.email, u.phone, u.full_name
      HAVING COUNT(ci.id) > 0
    `;

    const result = await pool.query(abandonedCartsQuery);
    const abandonedCarts = result.rows;

    // Envoyer une notification à chacun
    for (const cart of abandonedCarts) {
      await notificationService.send({
        email: cart.email,
        phone: cart.phone,
        templateName: 'abandoned_cart',
        data: {
          customerName: cart.full_name || 'Client',
          itemCount: cart.item_count,
          cartLink: process.env.FRONTEND_URL + '/cart'
        },
        channels: ['email', 'whatsapp']
      }).catch(err => console.error('Erreur notification panier abandonné:', err));
    }

    res.json({
      message: `Rappels envoyés à ${abandonedCarts.length} utilisateurs`,
      count: abandonedCarts.length
    });
  } catch (error) {
    console.error('Erreur rappel paniers abandonnés:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Upload d'images pour les produits
app.post('/api/admin/upload-images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'Aucune image uploadée' });
    }

    const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/${file.filename}`,
      path: file.path
    }));

    res.json({
      message: 'Images uploadées avec succès',
      images: uploadedFiles
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
  }
});

// Obtenir les images existantes par catégorie
app.get('/api/admin/images/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Pour l'instant, on retourne toutes les images du dossier uploads
    // Plus tard, on pourra les organiser par catégories
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(uploadsDir)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file: string) => ({
        filename: file,
        url: `/uploads/${file}`
      }));

    res.json({ images });
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- APIs PANIERS PERSISTANTS ---

// Obtenir le panier d'un utilisateur
app.get('/api/cart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    // Utiliser Supabase au lieu de PostgreSQL direct
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          name,
          price_eur,
          price_usd,
          price_cdf,
          images
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase cart:', error);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    // Formater les données pour compatibilité
    const formattedItems = cartItems.map(item => ({
      ...item,
      name: item.products?.name,
      price_eur: item.products?.price_eur,
      price_usd: item.products?.price_usd,
      price_cdf: item.products?.price_cdf,
      image_url: item.products?.images?.[0],
      totalPrice: (item.products?.price_eur || 0) * item.quantity
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Ajouter un produit au panier
app.post('/api/cart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'ID produit requis' });
    }

    // Vérifier si le produit existe et est actif
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND is_active = true',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Insérer ou mettre à jour l'article du panier
    const result = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, added_at = NOW()
      RETURNING *
    `, [userId, product_id, quantity]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Merge du panier (accepte un tableau d'items) - opération atomique
app.post('/api/cart/merge', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requis' });
  }

  const token = authHeader.substring(7);
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const userId = decoded.userId;
  const { items } = req.body; // items: [{ product_id, quantity }, ...]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Aucun item à fusionner' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const it of items) {
      const productId = it.product_id;
      const qty = parseInt(it.quantity, 10) || 0;
      if (!productId || qty <= 0) continue;

      // Vérifier que le produit existe et est actif
      const prod = await client.query('SELECT id FROM products WHERE id = $1 AND is_active = true', [productId]);
      if (prod.rows.length === 0) continue;

      // Insérer ou augmenter la quantité
      await client.query(`
        INSERT INTO cart_items (user_id, product_id, quantity, added_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, added_at = NOW();
      `, [userId, productId, qty]);
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors du merge du panier:', error);
    res.status(500).json({ error: 'Erreur lors de la fusion du panier' });
  } finally {
    client.release();
  }
});

// Modifier la quantité d'un article du panier
app.put('/api/cart/:productId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Supprimer l'article si quantité <= 0
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.json({ message: 'Article supprimé du panier' });
    }

    const result = await pool.query(`
      UPDATE cart_items
      SET quantity = $1, added_at = NOW()
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `, [quantity, userId, productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la modification du panier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer un article du panier
app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { productId } = req.params;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    }

    res.json({ message: 'Article supprimé du panier' });
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Vider le panier
app.delete('/api/cart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    res.json({ message: 'Panier vidé' });
  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API CODES PROMO ---

// Obtenir tous les codes promo
app.get('/api/admin/promo-codes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des codes promo:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Créer un code promo
app.post('/api/admin/promo-codes', async (req, res) => {
  try {
    const { code, discount_percentage, valid_until } = req.body;
    const query = `
      INSERT INTO promo_codes (code, discount_percentage, valid_until)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [code, discount_percentage, valid_until];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du code promo:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour un code promo
app.put('/api/admin/promo-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount_percentage, valid_until, is_active } = req.body;
    const query = `
      UPDATE promo_codes
      SET code = $1, discount_percentage = $2, valid_until = $3, is_active = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [code, discount_percentage, valid_until, is_active, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du code promo:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer un code promo
app.delete('/api/admin/promo-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM promo_codes WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du code promo:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API PROMOTIONS ---

// Obtenir toutes les promotions
app.get('/api/admin/promotions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pr.name as product_name
      FROM promotions p
      LEFT JOIN products pr ON p.product_id = pr.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Créer une promotion
app.post('/api/admin/promotions', async (req, res) => {
  try {
    const { product_id, discount_percentage, start_date, end_date } = req.body;
    const query = `
      INSERT INTO promotions (product_id, discount_percentage, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [product_id, discount_percentage, start_date, end_date];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Mettre à jour une promotion
app.put('/api/admin/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, discount_percentage, start_date, end_date, is_active } = req.body;
    const query = `
      UPDATE promotions
      SET product_id = $1, discount_percentage = $2, start_date = $3, end_date = $4, is_active = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [product_id, discount_percentage, start_date, end_date, is_active, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la promotion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Supprimer une promotion
app.delete('/api/admin/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM promotions WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Vérifier un code promo
app.post('/api/verify-promo-code', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await pool.query(
      'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW())',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Code promo invalide ou expiré.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la vérification du code promo:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API PAIEMENTS (PCI DSS Compliant) ---

// Créer un intent de paiement
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, orderId, paymentMethod, metadata } = req.body;

    if (!amount || !currency || !orderId || !paymentMethod) {
      return res.status(400).json({ error: 'Données de paiement incomplètes' });
    }

    // Importer le service de paiement
    const { paymentService } = await import('./payments.js');

    const intent = await paymentService.createPaymentIntent({
      amount,
      currency,
      orderId,
      customerId: req.user.id,
      paymentMethod,
      metadata
    });

    res.json({
      intentId: intent.id,
      clientSecret: intent.id, // En production, générer un vrai client_secret
      expiresAt: intent.expiresAt
    });

  } catch (error) {
    console.error('Erreur création intent:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
});

// Traiter un paiement
app.post('/api/payments/process', authenticateToken, async (req, res) => {
  try {
    const { intentId, paymentData } = req.body;

    if (!intentId || !paymentData) {
      return res.status(400).json({ error: 'Données de paiement manquantes' });
    }

    const { paymentService } = await import('./payments.js');

    const result = await paymentService.processPayment(intentId, paymentData);

    res.json(result);

  } catch (error) {
    console.error('Erreur traitement paiement:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du paiement' });
  }
});

// Paiement Mobile Money
app.post('/api/payments/mobile-money', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, orderId, phone, provider } = req.body;

    // Logique spécifique Mobile Money
    // Intégration avec MTN Mobile Money, Orange Money, etc.

    res.json({
      success: true,
      transactionId: 'mm_' + crypto.randomBytes(16).toString('hex'),
      message: 'Paiement Mobile Money initié. Veuillez confirmer sur votre téléphone.'
    });

  } catch (error) {
    console.error('Erreur paiement mobile:', error);
    res.status(500).json({ error: 'Erreur lors du paiement mobile' });
  }
});

// Virement bancaire
app.post('/api/payments/bank-transfer', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;

    // Générer les instructions de virement
    const instructions = {
      bankName: 'Banque Centrale',
      accountNumber: 'XXXX-XXXX-XXXX-XXXX',
      accountName: 'TinaBoutique SARL',
      reference: `ORDER-${orderId}`,
      amount: amount,
      currency: currency,
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72h
    };

    res.json({
      success: true,
      transactionId: 'bt_' + crypto.randomBytes(16).toString('hex'),
      instructions
    });

  } catch (error) {
    console.error('Erreur virement bancaire:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des instructions' });
  }
});

// Webhook pour confirmer les paiements
app.post('/api/payments/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-webhook-signature'] as string;
    const payload = req.body;

    const { paymentService } = await import('./payments.js');

    const isValid = await paymentService.handleWebhook(provider, signature, payload);

    if (isValid) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Webhook invalide' });
    }

  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// Endpoint pour créer une commande
app.post('/api/orders', authenticateToken, async (req, res) => {
  // Contract: client may send items array and desired currency. Server recalculates totals in EUR then converts.
  const { shipping_address, customer_info, items, currency = 'EUR', promo_code } = req.body;

  if (!shipping_address || !customer_info || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  const userId = parseInt((req.user && req.user.id) as any, 10);
  if (!userId) return res.status(401).json({ error: 'Utilisateur non authentifié.' });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Recalculer les totaux côté serveur en EUR
    let items_total_eur = 0;
    const itemDetails: Array<any> = [];

    for (const it of items) {
      const productRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [it.id]);
      if (productRes.rows.length === 0) {
        throw new Error(`Produit introuvable: ${it.id}`);
      }

      const product = productRes.rows[0];
      const qty = parseInt(it.quantity, 10) || 1;

      // Vérifier le stock
      const available = parseInt(product.stock_quantity, 10);
      if (available < qty) {
        throw new Error(`Stock insuffisant pour le produit ${it.id}. Disponible: ${available}, demandé: ${qty}`);
      }

      // Calculer le prix unitaire effectif en EUR côté serveur
      const pricing = calculateProductPrice(product, qty);
      const unit_price_eur = pricing.finalPrice; // prix par unité en EUR

      items_total_eur += unit_price_eur * qty;

      itemDetails.push({ product, qty, unit_price_eur, image_url: product.images?.[0] || null });
    }

    // Calculer la réduction en EUR si code promo
    let discount_amount_eur = 0;
    if (promo_code) {
      const promoResult = await client.query(
        'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW())',
        [promo_code]
      );

      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];
        discount_amount_eur = (items_total_eur * promo.discount_percentage) / 100;
      }
    }

    const final_amount_eur = Math.max(0, items_total_eur - discount_amount_eur);

    // Convertir dans les devises supportées
    const converted = await currencyService.convertToAll(final_amount_eur, 'EUR');
    const currencyUpper = (currency || 'EUR').toUpperCase();
    const total_in_currency = currencyUpper === 'EUR' ? converted.eur : currencyUpper === 'USD' ? converted.usd : converted.cdf;

    // Insérer dans la table 'orders' en enregistrant les montants dans chaque devise
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, amount_eur, amount_usd, amount_cdf, shipping_address, customer_info, status, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      RETURNING id;
    `;
    const orderValues = [userId, total_in_currency, converted.eur, converted.usd, converted.cdf, shipping_address, customer_info, currencyUpper];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    // Insérer order_items et décrémenter le stock (déjà locké via FOR UPDATE)
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, name, quantity, price, image_url, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    for (const d of itemDetails) {
      // Décrémenter le stock
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [d.qty, d.product.id]);

      const price_in_currency = await currencyService.convert(d.unit_price_eur, 'EUR', currencyUpper);
      const itemValues = [orderId, d.product.id, d.product.name, d.qty, price_in_currency, d.image_url, currencyUpper];
      await client.query(itemQuery, itemValues);
    }

    // Vider le panier après la commande
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // Récupérer les infos utilisateur pour notification
    const userInfo = await client.query('SELECT email, phone, full_name FROM users WHERE id = $1', [userId]);
    const user = userInfo.rows[0];

    await client.query('COMMIT');

    // 🔔 Envoyer notification de confirmation d'achat
    if (user) {
      notificationService.send({
        email: user.email,
        phone: user.phone,
        templateName: 'purchase_confirmation',
        data: {
          customerName: user.full_name || customer_info.name || 'Client',
          orderId,
          amount: total_in_currency.toFixed(2),
          currency: currencyUpper
        },
        channels: ['email', 'whatsapp']
      }).catch(err => console.error('Erreur notification achat:', err));
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      orderId,
      discount_applied: discount_amount_eur > 0,
      discount_amount_eur,
      final_amount_eur,
      amounts: converted,
      currency: currencyUpper,
      total_in_currency
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  } finally {
    client.release();
  }
});

// ========================================
// 📊 ROUTES API TRAÇABILITÉ & MULTI-DEVISES
// ========================================

// Routes Admin - Activity Logs
app.get('/api/admin/activity-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = '50', offset = '0', actionType, userId } = req.query;

    const filters = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      actionType: actionType as string || undefined,
      userId: userId ? parseInt(userId as string) : undefined
    };

    const logs = await activityLogger.getAllActivities(filters);
    const totalResult = await pool.query('SELECT COUNT(*) FROM activity_logs');

    res.json({
      logs,
      total: parseInt(totalResult.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route Admin - Stats Dashboard
app.get('/api/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Récupérer les stats réelles depuis la base
    const [ordersResult, productsResult, usersResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders WHERE status = $1', ['completed']),
      pool.query('SELECT COUNT(*) as total FROM products'),
      pool.query('SELECT COUNT(*) as total FROM users WHERE role = $1', ['user'])
    ]);

    const totalOrders = parseInt(ordersResult.rows[0].total) || 0;
    const totalRevenue = parseFloat(ordersResult.rows[0].revenue) || 0;
    const totalProducts = parseInt(productsResult.rows[0].total) || 0;
    const totalCustomers = parseInt(usersResult.rows[0].total) || 0;

    // Calcul panier moyen
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculer les tendances (mois en cours vs mois précédent)
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentMonthOrders, previousMonthOrders] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders WHERE created_at >= $1 AND status = $2',
        [currentMonth.toISOString().slice(0, 7) + '-01', 'completed']
      ),
      pool.query(
        'SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders WHERE created_at >= $1 AND created_at < $2 AND status = $3',
        [previousMonth.toISOString().slice(0, 7) + '-01', currentMonth.toISOString().slice(0, 7) + '-01', 'completed']
      )
    ]);

    const currentRevenue = parseFloat(currentMonthOrders.rows[0].revenue) || 0;
    const previousRevenue = parseFloat(previousMonthOrders.rows[0].revenue) || 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentOrders = parseInt(currentMonthOrders.rows[0].total) || 0;
    const previousOrders = parseInt(previousMonthOrders.rows[0].total) || 0;
    const ordersGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue,
      conversionRate: 3.2, // À calculer avec vraies données
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      ordersGrowth: parseFloat(ordersGrowth.toFixed(1)),
      customersGrowth: 12.5 // À calculer avec vraies données
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes Admin - Currency Management
app.get('/api/admin/currency-rates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rates = await currencyService.getAllRates();
    res.json(rates);
  } catch (error) {
    console.error('Erreur récupération taux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Historique des modifications
app.get('/api/admin/currency-rates/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM currency_rate_history ORDER BY created_at DESC LIMIT 200`);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération historique taux:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Propositions en cache (issues du scheduler/fetchLiveRates)
app.get('/api/admin/currency-rates/proposals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const proposals = currencyService.getCachedProposals();
    res.json(proposals);
  } catch (err) {
    console.error('Erreur récupération propositions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Appliquer des propositions (admin)
app.post('/api/admin/currency-rates/apply', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { proposals, reason } = req.body;
    if (!Array.isArray(proposals) || proposals.length === 0) return res.status(400).json({ error: 'Proposals invalides' });

    // Appliquer dans une transaction et écrire l'historique
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const p of proposals) {
        const from = (p.from as string).toUpperCase();
        const to = (p.to as string).toUpperCase();
        const numeric = Number(p.rate);

        const oldRow = await client.query('SELECT rate FROM currency_rates WHERE base_currency = $1 AND target_currency = $2 FOR UPDATE', [from, to]);
        const oldRate = oldRow.rows.length ? oldRow.rows[0].rate : null;

        await client.query(`
          INSERT INTO currency_rates (base_currency, target_currency, rate, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (base_currency, target_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = CURRENT_TIMESTAMP
        `, [from, to, numeric]);

        // écrire historique
        await client.query(`INSERT INTO currency_rate_history (admin_user_id, admin_email, base_currency, target_currency, old_rate, new_rate, change_reason, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [req.user ? Number(req.user.id) : null, (req.user && (req.user as any).email) || null, from, to, oldRate, numeric, reason || 'apply_proposals', JSON.stringify({ applied_by_ip: req.ip })]);
      }
      await client.query('COMMIT');
      await currencyService.reloadCache();
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erreur apply proposals:', err);
      res.status(500).json({ error: 'Erreur lors de l\'application des propositions' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/currency-rates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rates, reason } = req.body;
    if (!Array.isArray(rates) || rates.length === 0) return res.status(400).json({ error: 'Rates invalides' });

    // Validation basique: taux positifs et non nuls
    for (const r of rates) {
      const { from, to, rate } = r;
      if (!from || !to || typeof rate === 'undefined') return res.status(400).json({ error: 'Format rate invalide' });
      const numeric = Number(rate);
      if (isNaN(numeric) || numeric <= 0) return res.status(400).json({ error: 'Les taux doivent être des nombres > 0' });
      // Optional: sanity check large variation (par ex. 50% par rapport à DB)
      const current = await currencyService.getRate((from as string).toUpperCase(), (to as string).toUpperCase());
      if (current) {
        const changePct = Math.abs((numeric - Number(current)) / Number(current));
        if (changePct > 2) { // 200% change unexpectedly large
          return res.status(400).json({ error: `Variation trop grande pour ${from}->${to}. Utilisez un contrôle manuel.` });
        }
      }
    }

    // Mise à jour et audit dans une transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const r of rates) {
        const from = (r.from as string).toUpperCase();
        const to = (r.to as string).toUpperCase();
        const numeric = Number(r.rate);

        // Lire l'ancien taux
        const oldRow = await client.query('SELECT rate FROM currency_rates WHERE base_currency = $1 AND target_currency = $2 FOR UPDATE', [from, to]);
        const oldRate = oldRow.rows.length ? oldRow.rows[0].rate : null;

        // Upsert nouveau taux
        await client.query(`
          INSERT INTO currency_rates (base_currency, target_currency, rate, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (base_currency, target_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = CURRENT_TIMESTAMP
        `, [from, to, numeric]);

        // Insérer historique
        await client.query(`
          INSERT INTO currency_rate_history (admin_user_id, admin_email, base_currency, target_currency, old_rate, new_rate, change_reason, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [req.user ? Number(req.user.id) : null, (req.user && (req.user as any).email) || null, from, to, oldRate, numeric, reason || null, JSON.stringify({ updated_by_ip: req.ip })]);
      }

      await client.query('COMMIT');

      // Recharger le cache interne du service
      await currencyService.reloadCache();

      await logAction(req, ActionTypes.ADMIN_LOGIN, 'Mise à jour des taux de change (manuelle)', { rates, reason });
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erreur transaction mise à jour taux:', err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour des taux' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur mise à jour taux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Scheduler: proposer la mise à jour des taux toutes les 12 heures (non appliquée automatiquement)
async function scheduleFetchLiveRates() {
  try {
    const ok = await currencyService.fetchLiveRates();
    if (ok) {
      // Construire une notification admin pour revoir les taux proposés
      const message = 'Nouvelles propositions de taux récupérées automatiquement. Vérifiez et appliquez depuis la page Admin.';
      await pool.query(`INSERT INTO admin_notifications (type, title, message, severity, metadata) VALUES ($1,$2,$3,$4,$5)`, ['currency', 'Propositions taux de change', message, 'info', JSON.stringify({ when: new Date().toISOString() })]);
      console.log('Scheduler: propositions de taux créées (admin review)');
    }
  } catch (err) {
    console.error('Scheduler erreur fetchLiveRates:', err);
  }
}

// Lancer le scheduler si en production ou si variable d'env explicitement activée
if (process.env.ENABLE_CURRENCY_SCHEDULER === 'true' || process.env.NODE_ENV === 'production') {
  // Première exécution au démarrage
  scheduleFetchLiveRates().catch(err => {
    console.log('Scheduler: première exécution ignorée (permissions)', err.message);
  });
  // Toutes les 12 heures
  setInterval(() => {
    scheduleFetchLiveRates().catch(err => {
      console.log('Scheduler: exécution périodique ignorée (permissions)', err.message);
    });
  }, 12 * 60 * 60 * 1000);
}

// Route - Sélection devise utilisateur
app.get('/api/user/currency', authenticateToken, async (req, res) => {
  try {
    const currency = await currencyService.getUserPreferredCurrency(parseInt(req.user!.id));
    res.json({ currency });
  } catch (error) {
    console.error('Erreur récupération devise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/user/currency', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;
    const success = await currencyService.setUserPreferredCurrency(parseInt(req.user!.id), currency);

    if (success) {
      await logAction(req, 'CURRENCY_CHANGE', `Changement devise vers ${currency}`, { currency });
      res.json({ success: true, currency });
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    console.error('Erreur sauvegarde devise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint public de conversion simple (client-side peut l'utiliser)
app.get('/api/convert', async (req, res) => {
  try {
    const { amount, from = 'EUR', to } = req.query;
    if (!amount || !to) return res.status(400).json({ error: 'amount et to sont requis' });

    const numeric = parseFloat(amount as string);
    if (isNaN(numeric)) return res.status(400).json({ error: 'amount invalide' });

    const rate = await currencyService.getRate((from as string).toUpperCase(), (to as string).toUpperCase());
    const converted = numeric * rate;

    res.json({ amount: converted, currency: (to as string).toUpperCase(), rate });
  } catch (error) {
    console.error('Erreur conversion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route - Conversion prix
app.post('/api/convert-price', async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const convertedAmount = await currencyService.convert(amount, from, to);
    res.json({ amount: convertedAmount, currency: to });
  } catch (error) {
    console.error('Erreur conversion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// 📊 ROUTES DASHBOARD DONNÉES RÉELLES
// ========================================

// Ventes par jour (7 derniers jours)
app.get('/api/admin/sales-by-day', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;

    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Dy') as name,
        COALESCE(SUM(total_amount), 0) as ventes,
        COUNT(*) as commandes
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND status = 'completed'
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Dy')
      ORDER BY DATE(created_at)
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur ventes par jour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ventes par catégorie
app.get('/api/admin/sales-by-category', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.name,
        COALESCE(SUM(oi.price * oi.quantity), 0) as value,
        COUNT(DISTINCT o.id) as orders
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed' OR o.status IS NULL
      GROUP BY c.name
      ORDER BY value DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur ventes par catégorie:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Stats méthodes de paiement
app.get('/api/admin/payment-methods-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        payment_method as name,
        COUNT(*) as count
      FROM orders
      WHERE status = 'completed'
      AND payment_method IS NOT NULL
      GROUP BY payment_method
    `);

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

    const colors = {
      'card': '#3B82F6',
      'mobile_money': '#10B981',
      'paypal': '#F59E0B',
      'bank_transfer': '#8B5CF6'
    };

    const formatted = result.rows.map(row => ({
      name: row.name === 'card' ? 'Carte Bancaire' :
        row.name === 'mobile_money' ? 'Mobile Money' :
          row.name === 'paypal' ? 'PayPal' : row.name,
      value: Math.round((parseInt(row.count) / total) * 100),
      color: colors[row.name as keyof typeof colors] || '#6B7280'
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur stats paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dernières commandes
app.get('/api/admin/recent-orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const result = await pool.query(`
      SELECT 
        id,
        full_name as customer,
        total_amount as amount,
        status,
        EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
      FROM orders
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    const formatted = result.rows.map(row => ({
      id: row.id.toString().slice(0, 8),
      customer: row.customer || 'Client anonyme',
      amount: parseFloat(row.amount),
      status: row.status === 'completed' ? 'Livrée' :
        row.status === 'pending' ? 'En cours' :
          row.status === 'paid' ? 'Payée' : row.status,
      time: row.minutes_ago < 60
        ? `${Math.floor(row.minutes_ago)} min`
        : `${Math.floor(row.minutes_ago / 60)} h`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur dernières commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Top produits
app.get('/api/admin/top-products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;

    const result = await pool.query(`
      SELECT 
        p.name,
        COUNT(oi.id) as sales,
        SUM(oi.price * oi.quantity) as revenue
      FROM products p
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows.map(row => ({
      name: row.name,
      sales: parseInt(row.sales),
      revenue: parseFloat(row.revenue)
    })));
  } catch (error) {
    console.error('Erreur top produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Le serveur écoute sur le port ${port}`);
    console.log(`📊 Système de traçabilité activé`);
    console.log(`💱 Multi-devises EUR/USD/CDF activé`);
  });
}

export default app;
