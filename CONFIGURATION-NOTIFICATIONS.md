# 🔔 CONFIGURATION DES NOTIFICATIONS - Guide Complet

## 🎯 PRINCIPE IMPORTANT : WhatsApp est 100% OPTIONNEL

### ✅ Comment ça fonctionne :

```
Client S'INSCRIT
   │
   ├─ Email : ✅ OBLIGATOIRE (pour le compte)
   │
   └─ Téléphone : ❌ OPTIONNEL (pour WhatsApp)
       │
       ├─ SI client donne son numéro
       │    → Reçoit Email + WhatsApp ✅
       │
       └─ SI client ne donne PAS son numéro
            → Reçoit SEULEMENT Email ✅
```

### 🔒 Conformité RGPD

Le système est conçu pour respecter :
- ✅ Consentement explicite (champ optionnel)
- ✅ Droit de refus (pas obligatoire)
- ✅ Transparence (on explique l'usage)
- ✅ Révocable (client peut retirer son numéro)

---

## 📧 CONFIGURATION EMAIL (SendGrid - GRATUIT)

### Pourquoi SendGrid ?
- ✅ **Gratuit** : 100 emails/jour à vie
- ✅ **Fiable** : 99% délivrabilité
- ✅ **Simple** : 10 minutes setup
- ✅ **Analytics** : Tracking ouvertures/clics
- ✅ **Professionnel** : Utilisé par Spotify, Uber, Airbnb

---

### 🚀 SETUP SENDGRID (10 MINUTES)

#### Étape 1 : Créer un compte (3 min)

```
1. Ouvrez : https://signup.sendgrid.com/
2. Email : votre@email.com
3. Nom : TinaBoutique
4. Créer le compte
5. Vérifier votre email
```

#### Étape 2 : Vérifier votre identité (2 min)

SendGrid demande quelques infos pour éviter le spam :
```
- Pays : Congo (ou votre pays)
- Site web : tinaboutique.netlify.app
- Utilisation : Transactionnel (confirmations commandes)
- Nombre d'emails : < 1000/mois
```

#### Étape 3 : Créer une API Key (2 min)

```
1. Dans SendGrid Dashboard
2. Settings (en bas à gauche)
3. API Keys
4. Create API Key
5. Nom : "TinaBoutique Production"
6. Permissions : Full Access
7. Create & View

⚠️ COPIEZ LA CLÉ MAINTENANT ! 
Elle s'affiche qu'une seule fois !

Exemple : SG.abcdefghijklmnopqrstuvwxyz123456789
```

#### Étape 4 : Configurer sur Render (3 min)

```
1. Allez sur : https://dashboard.render.com
2. Cliquez sur votre service backend "tinaboutique"
3. Environment → Add Environment Variable
4. Ajoutez :

   Name: SENDGRID_API_KEY
   Value: SG.votrecléici123456789
   
   Name: SENDGRID_FROM_EMAIL
   Value: noreply@tinaboutique.com
   
5. Save Changes
6. Le service redémarrera automatiquement
```

#### Étape 5 : Installer la dépendance

Sur votre ordinateur :

```bash
cd "C:\Users\ODIA RUSSELL\Desktop\tinaboutique"
npm install @sendgrid/mail
```

#### Étape 6 : Activer dans le code

Le code est déjà prêt ! Vous devez juste décommenter.

Ouvrez `src/services/NotificationService.ts` et remplacez :

```typescript
// AVANT (mode dev)
private async sendEmail(payload: NotificationPayload): Promise<void> {
  if (!this.emailEnabled) {
    console.log('📧 EMAIL (Mode développement):', payload.templateName);
    return;
  }
  // ...
}
```

Par :

```typescript
// APRÈS (mode production)
private async sendEmail(payload: NotificationPayload): Promise<void> {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const emailConfig = this.buildEmailTemplate(payload);
  
  try {
    await sgMail.send({
      to: emailConfig.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: emailConfig.subject,
      html: emailConfig.html
    });
    
    console.log('✅ Email envoyé:', emailConfig.to);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
}
```

#### Étape 7 : Tester

Créez un fichier `test-sendgrid.js` :

```javascript
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'votre@email.com', // Votre vrai email
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Test TinaBoutique',
  html: '<h1>🎉 Ça fonctionne !</h1><p>SendGrid est configuré correctement.</p>',
};

sgMail.send(msg)
  .then(() => console.log('✅ Email de test envoyé !'))
  .catch(error => console.error('❌ Erreur:', error));
```

Testez :
```bash
node test-sendgrid.js
```

Si vous recevez l'email → **C'EST BON !** ✅

---

## 📱 CONFIGURATION WHATSAPP (Twilio - 10€/mois)

### Pourquoi WhatsApp ?
- 📊 **98% taux d'ouverture** (vs 20% email)
- ⏱️ **Lecture en 3 min** (vs 6h email)
- 💬 **Réponse client facile** (conversation)
- ✅ **Plus personnel** et moderne

---

### 🚀 SETUP TWILIO WHATSAPP (15 MINUTES)

#### Étape 1 : Créer compte Twilio (5 min)

```
1. Ouvrez : https://www.twilio.com/try-twilio
2. Créer un compte
3. Vérifier votre email
4. Vérifier votre numéro de téléphone personnel
5. Terminer le questionnaire :
   - Produit : WhatsApp
   - Utilisation : Notifications
   - Langage : Node.js
```

Vous obtenez **15$ de crédit gratuit !** (~300 messages)

#### Étape 2 : Activer WhatsApp Sandbox (Test) (3 min)

```
1. Dans Console Twilio
2. Messaging → Try it out → Send a WhatsApp message
3. Un QR code s'affiche
4. Ouvrez WhatsApp sur votre téléphone
5. Scanner le QR code
6. Envoyer le code demandé (ex: "join abc-def")
7. Vous recevez : "You are all set! ✅"
```

Maintenant vous pouvez envoyer des tests GRATUITS !

#### Étape 3 : Récupérer les credentials (2 min)

Dans Twilio Console :

```
Account Info (en haut à droite) :

Account SID : ACxxxxxxxxxxxxx
Auth Token : [Cliquez "Show" pour voir]
```

Dans WhatsApp Sandbox Settings :

```
Sandbox Number : +14155238886
```

#### Étape 4 : Configurer sur Render (2 min)

```
Render Dashboard → Service → Environment :

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### Étape 5 : Installer dépendance

```bash
npm install twilio
```

#### Étape 6 : Activer dans le code

Dans `src/services/NotificationService.ts` :

```typescript
private async sendWhatsApp(payload: NotificationPayload): Promise<void> {
  const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const whatsappConfig = this.buildWhatsAppTemplate(payload);
  
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${whatsappConfig.to}`,
      body: whatsappConfig.message
    });

    console.log('✅ WhatsApp envoyé:', whatsappConfig.to);
  } catch (error) {
    console.error('❌ Erreur WhatsApp:', error);
    throw error;
  }
}
```

#### Étape 7 : Tester

Créez `test-whatsapp.js` :

```javascript
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  to: 'whatsapp:+33612345678', // VOTRE numéro WhatsApp
  body: '🎉 Test TinaBoutique - WhatsApp fonctionne !'
})
.then(message => console.log('✅ WhatsApp envoyé ! SID:', message.sid))
.catch(error => console.error('❌ Erreur:', error));
```

⚠️ **IMPORTANT** : Votre numéro doit avoir rejoint le sandbox !

```bash
node test-whatsapp.js
```

Si vous recevez le message → **C'EST BON !** ✅

---

## 🎯 COMMENT LE SYSTÈME GÈRE L'OPTIONNEL

### Code Intelligent Déjà en Place

Dans `NotificationService.ts`, la fonction `send()` :

```typescript
async send(payload: NotificationPayload): Promise<void> {
  const channels = payload.channels || ['email', 'whatsapp'];
  const promises: Promise<any>[] = [];

  // ✅ Envoie email si l'adresse existe
  if (channels.includes('email') && payload.email) {
    promises.push(this.sendEmail(payload));
  }

  // ✅ Envoie WhatsApp SEULEMENT si numéro existe
  if (channels.includes('whatsapp') && payload.phone) {
    promises.push(this.sendWhatsApp(payload));
  }

  // Execute en parallèle, ignore les erreurs individuelles
  await Promise.allSettled(promises);
}
```

### Exemples Concrets

#### Client AVEC téléphone :
```javascript
notificationService.send({
  email: 'client@email.com',
  phone: '+33612345678', // ✅ Numéro présent
  templateName: 'purchase_confirmation',
  data: { ... }
});

// Résultat : Email + WhatsApp envoyés ✅
```

#### Client SANS téléphone :
```javascript
notificationService.send({
  email: 'client@email.com',
  phone: null, // ❌ Pas de numéro
  templateName: 'purchase_confirmation',
  data: { ... }
});

// Résultat : SEULEMENT Email envoyé ✅
```

#### Forcer seulement Email :
```javascript
notificationService.send({
  email: 'client@email.com',
  phone: '+33612345678',
  templateName: 'purchase_confirmation',
  data: { ... },
  channels: ['email'] // ⚙️ Seulement email
});

// Résultat : SEULEMENT Email envoyé ✅
```

---

## 🔐 PAGE PROFIL - Gérer les Préférences

Le client peut modifier son numéro dans son profil.

**À ajouter dans `src/pages/Profile.tsx`** (section Préférences) :

```tsx
<div className="space-y-2">
  <Label htmlFor="phone">
    Numéro WhatsApp (Optionnel)
  </Label>
  <Input
    id="phone"
    type="tel"
    placeholder="+33612345678"
    value={userPhone}
    onChange={(e) => setUserPhone(e.target.value)}
  />
  <p className="text-xs text-gray-600">
    Recevez des confirmations et suivis par WhatsApp
  </p>
  
  <Button onClick={savePreferences}>
    Enregistrer
  </Button>
</div>
```

Le client peut :
- ✅ Ajouter son numéro plus tard
- ✅ Modifier son numéro
- ✅ Supprimer son numéro (met à null)

---

## 💰 COÛTS RÉELS

### SendGrid (Email)
- **Gratuit** : 100 emails/jour = 3000/mois
- **15$/mois** : 40 000 emails/mois
- **Réalité** : Gratuit suffisant pour démarrer !

### Twilio WhatsApp
- **Sandbox (Test)** : Gratuit illimité
- **Production** : ~0,005€ par message
  - 100 messages = 0,50€
  - 1000 messages = 5€
  - 2000 messages = 10€

### Exemple Budget Mois 1
```
Clients : 50
Achats : 20
Paniers abandonnés : 10
Broadcasts : 2

Emails :
- Confirmations achats : 20
- Expéditions : 20
- Paniers : 10
- Broadcasts : 100
= 150 emails → GRATUIT ✅

WhatsApp (50% ont un numéro = 25 clients) :
- Confirmations : 10 × 0,005€ = 0,05€
- Expéditions : 10 × 0,005€ = 0,05€
- Paniers : 5 × 0,005€ = 0,025€
- Broadcasts : 50 × 0,005€ = 0,25€
= 0,375€ ~0,40€

TOTAL MOIS 1 : 0,40€ 🎉
```

---

## ✅ CHECKLIST CONFIGURATION

### Email (SendGrid)
- [ ] Compte créé
- [ ] API Key récupérée
- [ ] Variables env sur Render
- [ ] npm install @sendgrid/mail
- [ ] Code activé
- [ ] Test réussi

### WhatsApp (Twilio)
- [ ] Compte créé
- [ ] Sandbox activé
- [ ] Credentials récupérés
- [ ] Variables env sur Render
- [ ] npm install twilio
- [ ] Code activé
- [ ] Test réussi

### Frontend
- [x] Téléphone optionnel ✅
- [ ] Message explicatif
- [ ] Page profil - modifier numéro
- [ ] Consentement RGPD

---

## 🆘 DÉPANNAGE

### ❌ Email non reçu
1. Vérifier spam/promotions
2. Vérifier SENDGRID_API_KEY correct
3. Vérifier FROM_EMAIL vérifié sur SendGrid
4. Voir logs Render

### ❌ WhatsApp non reçu
1. Vérifier numéro a rejoint sandbox
2. Format : +33612345678 (avec +)
3. Vérifier crédit Twilio
4. Voir logs Render

### ❌ "Module not found"
```bash
npm install @sendgrid/mail twilio
git add package.json package-lock.json
git commit -m "Add notification dependencies"
git push
```

---

## 🎓 RÉSUMÉ POUR VOUS

### Ce qui est OBLIGATOIRE
- ✅ Email (pour le compte)
- ✅ Configuration SendGrid (gratuit)

### Ce qui est OPTIONNEL
- ❌ Numéro WhatsApp du client
- ❌ Configuration WhatsApp (mais recommandé !)

### Votre client peut
- ✅ S'inscrire sans numéro → Reçoit emails
- ✅ Ajouter son numéro → Reçoit email + WhatsApp
- ✅ Retirer son numéro → Reçoit seulement emails

**C'est transparent, optionnel, et conforme RGPD !** ✅
