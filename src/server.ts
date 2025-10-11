import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import expressValidator from 'express-validator';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant dans les variables d\'environnement');
  process.exit(1);
}

// Configuration des origines CORS autorisées
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'https://votredomaine.com']
  : ['http://localhost:8081', 'http://localhost:8080', 'http://10.235.227.207:8080'];

// --- MIDDLEWARES DE SÉCURITÉ ---

// Rate limiting pour les tentatives d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max par fenêtre
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par fenêtre
  message: { error: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware d'authentification JWT
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Vérifier si l'utilisateur existe toujours
    const userResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = {
      id: decoded.userId,
      role: userResult.rows[0].role
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
    // Bloquer les autres
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
    // TODO: Ajouter la logique de filtrage et de pagination
    const result = await pool.query('SELECT * FROM products WHERE is_active = true');
    const products = result.rows.map(product => ({
      ...product,
      // Ajouter les informations de prix calculées
      pricing: calculateProductPrice(product, 1)
    }));
    res.json(products);
  } catch (error) {
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
    const { name, description } = req.body;
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [name, description];
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
    const { name, description } = req.body;
    const query = `
      UPDATE categories
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [name, description, id];
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
    const query = `
      INSERT INTO products (name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [name, description, category_id, price_eur, price_usd, price_cdf, stock_quantity, images];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
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

    // Vérifier si la table cart_items existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'cart_items'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.json([]); // Retourner un panier vide si la table n'existe pas
    }

    const result = await pool.query(`
      SELECT
        ci.*,
        p.name,
        p.price_eur,
        p.price_usd,
        p.price_cdf,
        p.images[1] as image_url,
        p.sale_price_eur,
        p.sale_start_date,
        p.sale_end_date,
        p.bulk_discount_threshold,
        p.bulk_discount_percentage
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [userId]);

    // Calculer les prix pour chaque article du panier
    const cartItems = result.rows.map(item => {
      const pricing = calculateProductPrice({
        price_eur: item.price_eur,
        sale_price_eur: item.sale_price_eur,
        sale_start_date: item.sale_start_date,
        sale_end_date: item.sale_end_date,
        bulk_discount_threshold: item.bulk_discount_threshold,
        bulk_discount_percentage: item.bulk_discount_percentage
      }, item.quantity);

      return {
        ...item,
        pricing,
        totalPrice: pricing.finalPrice * item.quantity
      };
    });

    res.json(cartItems);
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

// Endpoint pour créer une commande
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, shipping_address, customer_info, items, currency, promo_code } = req.body;

  if (!user_id || !total_amount || !shipping_address || !customer_info || !items || items.length === 0) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculer la réduction si code promo
    let discount_amount = 0;
    if (promo_code) {
      const promoResult = await client.query(
        'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW())',
        [promo_code]
      );

      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];
        discount_amount = (total_amount * promo.discount_percentage) / 100;
      }
    }

    const final_amount = total_amount - discount_amount;

    // Insérer dans la table 'orders'
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, shipping_address, customer_info, status, currency)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      RETURNING id;
    `;
    const orderValues = [user_id, final_amount, shipping_address, customer_info, currency];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    // Insérer dans la table 'order_items'
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, name, quantity, price, image_url, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    for (const item of items) {
      const itemValues = [orderId, item.id, item.name, item.quantity, item.price, item.image_url, currency];
      await client.query(itemQuery, itemValues);
    }

    // Vider le panier après la commande
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Commande créée avec succès',
      orderId,
      discount_applied: discount_amount > 0,
      discount_amount,
      final_amount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});
