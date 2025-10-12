const bcrypt = require('bcrypt');

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('\n🔐 Hash généré pour le mot de passe "admin123":\n');
  console.log(hash);
  console.log('\n📋 Copiez ce hash et utilisez-le dans PostgreSQL:\n');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@tinaboutique.com';`);
  console.log('\n');
}).catch(err => {
  console.error('Erreur:', err);
});
