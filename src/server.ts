import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { pool } from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-secret'; // À mettre dans .env !

const allowedOrigins = ['http://localhost:8081', 'http://localhost:8080', 'http://10.235.227.207:8080'];

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

app.use(cors(corsOptions));
app.use(bodyParser.json());

// --- API D'AUTHENTIFICATION ---

// Inscription
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ error: 'Cet email est peut-être déjà utilisé.' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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

// --- API PUBLIQUE ---

// Obtenir tous les produits (avec filtres optionnels)
app.get('/api/products', async (req, res) => {
  try {
    // TODO: Ajouter la logique de filtrage et de pagination
    const result = await pool.query('SELECT * FROM products WHERE is_active = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Obtenir un seul produit par son ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json(result.rows[0]);
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


// --- API D'ADMINISTRATION (TODO: Sécuriser ces routes) ---

// Créer un produit
app.post('/api/admin/products', async (req, res) => {
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

// Mettre à jour un produit
app.put('/api/admin/products/:id', async (req, res) => {
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

// Supprimer un produit (soft delete)
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// --- API DE RAPPORTS (TODO: Sécuriser ces routes) ---

// Obtenir des statistiques de ventes générales
app.get('/api/admin/reports/sales-summary', async (req, res) => {
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


// Endpoint pour créer une commande
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, shipping_address, customer_info, items, currency } = req.body;

  if (!user_id || !total_amount || !shipping_address || !customer_info || !items || items.length === 0) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insérer dans la table 'orders'
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, shipping_address, customer_info, status, currency)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      RETURNING id;
    `;
    const orderValues = [user_id, total_amount, shipping_address, customer_info, currency];
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

    await client.query('COMMIT');
    res.status(201).json({ message: 'Commande créée avec succès', orderId });

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
