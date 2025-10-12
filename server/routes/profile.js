const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/profile - Récupérer le profil utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, email, full_name, phone, shipping_address, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/profile - Mettre à jour le profil
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, shipping_address } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, phone = $2, shipping_address = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [full_name, phone, shipping_address, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/profile/stats - Statistiques utilisateur (NOUVEAU)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Compter le nombre total de commandes
    const ordersCountResult = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [userId]
    );
    const totalOrders = parseInt(ordersCountResult.rows[0].total) || 0;

    // 2. Calculer le montant total dépensé
    const totalSpentResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM orders 
       WHERE user_id = $1 AND status IN ('paid', 'shipped', 'delivered')`,
      [userId]
    );
    const totalSpent = parseFloat(totalSpentResult.rows[0].total) || 0;

    // 3. Calculer les points de fidélité (1 point = 1€ dépensé)
    const loyaltyPoints = Math.floor(totalSpent);

    // 4. Déterminer le tier basé sur le montant dépensé
    let tier = 'bronze';
    if (totalSpent >= 1000) {
      tier = 'platinum';
    } else if (totalSpent >= 500) {
      tier = 'gold';
    } else if (totalSpent >= 100) {
      tier = 'silver';
    }

    // 5. Retourner les statistiques
    res.json({
      totalOrders,
      totalSpent,
      loyaltyPoints,
      tier
    });

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/profile/password - Changer le mot de passe (NOUVEAU)
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier le mot de passe actuel
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
