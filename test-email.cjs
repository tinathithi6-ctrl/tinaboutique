/**
 * 📧 SCRIPT DE TEST EMAIL GMAIL SMTP
 * Teste rapidement si vos identifiants Gmail fonctionnent
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n🔍 Vérification de la configuration...\n');

  // Vérifier les variables d'environnement
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variables manquantes dans .env:', missing.join(', '));
    console.log('\n📝 Ajoutez ces lignes dans votre fichier .env:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=votre_email@gmail.com');
    console.log('SMTP_PASS=votre_app_password');
    return;
  }

  console.log('✅ Configuration trouvée:');
  console.log('   Host:', process.env.SMTP_HOST);
  console.log('   Port:', process.env.SMTP_PORT);
  console.log('   User:', process.env.SMTP_USER);
  console.log('   Pass:', process.env.SMTP_PASS.substring(0, 4) + '****');
  console.log('');

  // Créer le transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true pour 465, false pour 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Ignore les erreurs de certificat (utile sur Windows)
    }
  });

  console.log('📧 Envoi d\'un email de test...\n');

  try {
    const info = await transporter.sendMail({
      from: `"TinaBoutique Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Envoi à vous-même pour tester
      subject: '✅ Test Gmail SMTP - TinaBoutique',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
          <div style="background: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #D4AF37; margin-top: 0;">🎉 Félicitations!</h1>
            <p style="font-size: 18px; color: #333;">Votre configuration <strong>Gmail SMTP</strong> fonctionne parfaitement!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${process.env.SMTP_USER}</p>
              <p style="margin: 5px 0;"><strong>🖥️ Host:</strong> ${process.env.SMTP_HOST}</p>
              <p style="margin: 5px 0;"><strong>🔌 Port:</strong> ${process.env.SMTP_PORT}</p>
              <p style="margin: 5px 0;"><strong>⏰ Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>

            <p style="color: #666;">Votre système de notifications par email est maintenant opérationnel! 🚀</p>
            
            <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
              <p style="margin: 0; color: #2e7d32;"><strong>✅ Prochaines étapes:</strong></p>
              <ul style="color: #2e7d32; margin: 10px 0;">
                <li>Créer la table site_settings</li>
                <li>Configurer WhatsApp Business</li>
                <li>Tester une vraie commande</li>
              </ul>
            </div>
          </div>
          
          <p style="text-align: center; color: white; margin-top: 20px; font-size: 12px;">
            TinaBoutique - Système de notifications
          </p>
        </div>
      `
    });

    console.log('✅ ✅ ✅ EMAIL ENVOYÉ AVEC SUCCÈS! ✅ ✅ ✅\n');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Destinataire:', process.env.SMTP_USER);
    console.log('');
    console.log('🔍 Vérifiez votre boîte mail:', process.env.SMTP_USER);
    console.log('💡 Si vous ne voyez rien, vérifiez le dossier SPAM/Courrier indésirable');
    console.log('');
    console.log('🎉 Votre configuration Gmail SMTP est parfaite!\n');

  } catch (error) {
    console.error('\n❌ ❌ ❌ ERREUR LORS DE L\'ENVOI ❌ ❌ ❌\n');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('');

    // Diagnostics
    if (error.code === 'EAUTH') {
      console.log('🔍 DIAGNOSTIC: Problème d\'authentification\n');
      console.log('Solutions possibles:');
      console.log('1. ⚠️  Vérifiez que SMTP_PASS est un App Password Gmail (16 caractères)');
      console.log('   → Pas votre mot de passe Gmail habituel!');
      console.log('');
      console.log('2. 🔐 Créez un App Password:');
      console.log('   → https://myaccount.google.com/security');
      console.log('   → Activez la vérification en 2 étapes');
      console.log('   → Créez un "Mot de passe des applications"');
      console.log('');
      console.log('3. ✏️  Copiez le code généré (16 caractères) dans SMTP_PASS');
      console.log('   → Retirez tous les espaces du code');
      console.log('');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.log('🔍 DIAGNOSTIC: Problème de connexion\n');
      console.log('Solutions possibles:');
      console.log('1. 🌐 Vérifiez votre connexion internet');
      console.log('2. 🔥 Vérifiez que votre firewall n\'bloque pas le port', process.env.SMTP_PORT);
      console.log('3. 🔄 Essayez de changer le port:');
      console.log('   → Port 587 (recommandé) ou 465');
      console.log('');
    } else {
      console.log('🔍 DIAGNOSTIC: Erreur inconnue\n');
      console.log('Vérifications:');
      console.log('1. ✅ Vérifiez toutes les variables dans .env');
      console.log('2. 🔄 Redémarrez le script après modification');
      console.log('3. 📝 Consultez GUIDE-GMAIL-SMTP.md pour plus d\'aide');
      console.log('');
    }

    console.log('📖 Pour plus d\'aide, consultez: GUIDE-GMAIL-SMTP.md\n');
  }
}

// Lancer le test
testEmail();
