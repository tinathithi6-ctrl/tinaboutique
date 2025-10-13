/* Script test simple pour fusion du panier
   Usage: node scripts/test-merge-cart.js
   Attends un serveur API local sur http://localhost:3001
*/

const fetch = require('node-fetch');

(async () => {
  try {
    // Remplacez ces identifiants par un compte de test existant
    const email = 'test@example.com';
    const password = 'Test1234!';

    console.log('Login...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed', loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('Token obtenu');

    const items = [
      { product_id: 1, quantity: 2 },
      { product_id: 3, quantity: 1 }
    ];

    console.log('POST /api/cart/merge');
    const mergeRes = await fetch('http://localhost:3001/api/cart/merge', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ items })
    });
    const mergeData = await mergeRes.json();
    console.log('Merge response:', mergeData);

    console.log('GET /api/cart');
    const cartRes = await fetch('http://localhost:3001/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
    const cart = await cartRes.json();
    console.log('Cart items:', cart);

  } catch (err) {
    console.error('Erreur test merge:', err);
  }
})();
