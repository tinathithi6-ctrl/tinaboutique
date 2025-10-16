# 📧 Guide Configuration Gmail SMTP pour TinaBoutique

## ✅ Configuration Terminée!

Vos identifiants Gmail SMTP ont été intégrés avec succès. Ce guide vous explique comment ça fonctionne et comment tester.

---

## 📋 Vos Identifiants

Vous avez fourni les identifiants suivants (déjà ajoutés dans votre `.env`):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ttinathithi6@gmail.com
SMTP_PASS=vabn qvwa lodt ahow  # App Password Gmail
```

---

## 🔐 Qu'est-ce qu'un "App Password" Gmail ?

Le mot de passe que vous avez fourni (`vabn qvwa lodt ahow`) est un **App Password** Gmail, différent de votre mot de passe habituel.

### Comment obtenir un App Password Gmail (si besoin):

1. Allez sur https://myaccount.google.com/security
2. Activez la **vérification en deux étapes** (2FA) si ce n'est pas déjà fait
3. Dans **Sécurité**, cherchez "Mots de passe des applications"
4. Créez un nouveau mot de passe pour "Mail" ou "Autre application"
5. Gmail génèrera un code de 16 caractères (comme celui que vous avez fourni)
6. Utilisez ce code dans `SMTP_PASS`

---

## ⚙️ Configuration dans votre `.env`

Assurez-vous que votre fichier `.env` contient exactement ceci:

```bash
# --- NOTIFICATIONS EMAIL (Gmail SMTP) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ttinathithi6@gmail.com
SMTP_PASS=vabn qvwa lodt ahow
```

**IMPORTANT**: Retirez les espaces si vous les avez copiés avec des espaces!

---

## 🧪 Test de la Configuration

### Option 1: Tester depuis l'interface Admin

1. **Démarrez votre serveur**:
   ```bash
   npm run dev:backend
   ```

2. **Connectez-vous comme admin** sur votre site

3. **Allez dans "Paramètres"** (onglet Settings dans le dashboard admin)

4. **Activez les notifications Email** avec le toggle

5. **Entrez votre numéro WhatsApp** (pour tester plus tard)

6. **Cliquez sur "Tester WhatsApp"** - pour l'instant ça ne fera que vérifier la config

### Option 2: Tester avec un script Node.js

Créez un fichier `test-email.js` à la racine:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour port 465, false pour 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  console.log('📧 Test d\'envoi d\'email...');

  try {
    const info = await transporter.sendMail({
      from: `"TinaBoutique Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Envoi à vous-même pour tester
      subject: '✅ Test Gmail SMTP - TinaBoutique',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #D4AF37;">🎉 Ça fonctionne!</h1>
          <p>Votre configuration Gmail SMTP est correcte!</p>
          <p><strong>Email:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>Host:</strong> ${process.env.SMTP_HOST}</p>
          <p><strong>Port:</strong> ${process.env.SMTP_PORT}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">TinaBoutique - Système de notifications</p>
        </div>
      `
    });

    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Vérifiez votre boîte mail:', process.env.SMTP_USER);
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n⚠️  Problème d\'authentification:');
      console.log('1. Vérifiez que SMTP_USER et SMTP_PASS sont corrects');
      console.log('2. Vérifiez que vous utilisez un App Password (pas le mot de passe Gmail normal)');
      console.log('3. Vérifiez que la 2FA est activée sur votre compte Gmail');
    }
  }
}

testEmail();
```

Puis lancez:
```bash
node test-email.js
```

---

## 📬 Quand les emails sont envoyés automatiquement?

Votre système enverra des emails automatiquement dans ces cas:

### 1. **Achat confirmé** 🎉
- Email de confirmation avec numéro de commande
- Montant payé
- Message de remerciement

### 2. **Panier abandonné** 🛒
- Rappel après 24h d'inactivité
- Lien pour finaliser l'achat
- Liste des articles abandonnés

### 3. **Colis expédié** 📦
- Numéro de suivi
- Transporteur
- Date de livraison estimée

### 4. **Compte suspendu/supprimé** ⚠️
- Notification de suspension
- Raison de la suspension
- Contact support

### 5. **Nouveautés & Soldes** 🎁
- Annonces de nouvelles collections
- Promotions exclusives
- Diffusion groupée aux clients

---

## 🔍 Vérifications Importantes

### ✅ Checklist avant d'utiliser en production:

- [ ] App Password Gmail créé et testé
- [ ] Email de test reçu avec succès
- [ ] Vérification en deux étapes activée sur Gmail
- [ ] `.env` bien configuré (sans espaces inutiles)
- [ ] Serveur backend redémarré après modification du `.env`
- [ ] Table `site_settings` créée dans la base de données

---

## ⚠️ Limitations Gmail SMTP

### Quotas d'envoi Gmail:
- **500 emails/jour** pour un compte Gmail gratuit
- **2000 emails/jour** pour Google Workspace (payant)

### Si vous dépassez ces limites:
- Passez à **SendGrid** (100 emails/jour gratuit, puis payant)
- Ou **Amazon SES** (très bon rapport qualité/prix)
- Ou **Mailgun**, **Postmark**, etc.

### Recommandation:
- Pour un petit site (< 50 commandes/jour): Gmail SMTP suffit ✅
- Pour un site moyen/grand: Utilisez SendGrid ou Amazon SES

---

## 🚀 Prochaines Étapes

### 1. Créer la table des paramètres

Lancez le script de création de table:
```bash
node create-settings-table-fix.js
```

### 2. Configurer WhatsApp Business (GRATUIT)

Consultez le guide: `GUIDE-WHATSAPP-GRATUIT-META.md`

### 3. Tester en conditions réelles

- Créez une commande de test
- Vérifiez la réception de l'email
- Testez le broadcast de nouveautés

---

## 🆘 Dépannage

### Erreur: "Invalid login"
- Vérifiez que vous utilisez un **App Password**, pas votre mot de passe Gmail normal
- Assurez-vous que la 2FA est activée

### Erreur: "Connection timeout"
- Vérifiez votre connexion internet
- Essayez le port 465 au lieu de 587
- Vérifiez que votre firewall n'bloque pas SMTP

### Emails non reçus
- Vérifiez votre dossier **Spam/Courrier indésirable**
- Attendez quelques minutes (délai de livraison)
- Vérifiez les logs du serveur backend

### Erreur: "Daily sending limit exceeded"
- Vous avez dépassé la limite de 500 emails/jour
- Attendez 24h ou passez à SendGrid

---

## 📝 Logs et Monitoring

Quand un email est envoyé, vous verrez dans la console backend:

```
✅ Email SMTP configuré: ttinathithi6@gmail.com
✅ Email envoyé via SMTP: client@example.com
```

En cas d'erreur:
```
❌ Erreur envoi email: [détails de l'erreur]
```

---

## 🎯 Résumé

✅ **Gmail SMTP configuré** avec vos identifiants  
✅ **Nodemailer installé** et intégré  
✅ **Service de notifications** mis à jour  
✅ **Templates email** prêts (confirmation, panier abandonné, etc.)  

**Tout est prêt!** Il ne reste plus qu'à:
1. Tester l'envoi d'email
2. Créer la table `site_settings`
3. Configurer WhatsApp Business (optionnel mais recommandé)

---

**Besoin d'aide?** Consultez les autres guides:
- `CONFIGURATION-NOTIFICATIONS.md` - Vue d'ensemble
- `GUIDE-WHATSAPP-GRATUIT-META.md` - WhatsApp Business gratuit
- `GUIDE-TWILIO-WHATSAPP.md` - Alternative Twilio (payant)
