# 📱 WHATSAPP BUSINESS API GRATUIT (Meta)

## 🎉 POURQUOI C'EST MIEUX QUE TWILIO

| Critère | Twilio | **Meta WhatsApp** |
|---------|--------|-------------------|
| **Coût** | 0,005€/msg | **GRATUIT** 1000 conv/mois ✅ |
| **Setup** | 15 min | 1-2 heures |
| **Sandbox** | Oui (limite) | Non (production directe) ✅ |
| **Templates** | Non | Oui (approuvés Meta) ✅ |
| **Professionnel** | Moyen | Très professionnel ✅ |
| **Analytics** | Basique | Avancés ✅ |

**1000 conversations = ~3000 messages gratuits/mois !** 🎁

---

## 🚀 CONFIGURATION META WHATSAPP (1-2 HEURES)

### Prérequis
- ✅ Compte Facebook personnel
- ✅ Numéro WhatsApp Business : **+243 837 352 401**
- ✅ Email vérifiable
- ✅ Informations entreprise (nom, adresse)

---

## ÉTAPE 1 : Créer Meta Business Account (15 min)

### 1.1 Créer le compte

```
1. Allez sur : https://business.facebook.com/
2. Cliquez "Créer un compte"
3. Remplissez :
   - Nom entreprise : TinaBoutique
   - Votre nom
   - Email professionnel
4. Vérifiez votre email
5. Confirmez votre identité
```

### 1.2 Configurer le compte

```
1. Paramètres Business
2. Informations sur l'entreprise :
   - Nom : TinaBoutique
   - Site web : https://sparkling-biscotti-defcce.netlify.app
   - Secteur : E-commerce / Mode
   - Pays : Congo (RDC)
3. Enregistrer
```

---

## ÉTAPE 2 : Ajouter WhatsApp Business (20 min)

### 2.1 Créer l'app

```
1. Dans Meta Business Suite
2. Menu gauche → Tous les outils
3. Cliquez "WhatsApp"
4. Cliquez "Commencer"
5. Nom de l'app : "TinaBoutique Notifications"
6. Créer l'app
```

### 2.2 Configurer WhatsApp

```
1. Dans l'app créée
2. WhatsApp → Démarrage rapide
3. Ajouter un numéro de téléphone :
   
   Numéro : +243 837 352 401
   
4. Méthode de vérification : SMS ou Appel
5. Entrez le code reçu
6. ✅ Numéro vérifié !
```

### 2.3 Récupérer les credentials

```
1. WhatsApp → Configuration
2. Vous voyez :

   Phone Number ID : 123456789012345
   WhatsApp Business Account ID : 987654321098765
   
3. Onglet "Accès à l'API"
4. Générer un token d'accès :
   
   - Durée : Permanent (recommandé)
   - Permissions : whatsapp_business_messaging
   
5. COPIEZ LE TOKEN (commence par EAA...)
```

**Exemple :**
```
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ID=987654321098765
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxx
```

---

## ÉTAPE 3 : Créer Templates de Messages (30 min)

WhatsApp exige des templates pré-approuvés pour messages promotionnels.

### 3.1 Créer un template

```
1. WhatsApp → Gestionnaire de messages
2. Templates de messages
3. Créer un template
```

### 3.2 Template : Confirmation Achat

```
Nom : order_confirmation
Catégorie : Transactionnel (approuvé instantanément)
Langue : Français

Message :
---
Merci {{1}} ! 🎉

Votre commande #{{2}} est confirmée ✅

Montant : {{3}} {{4}}

Nous préparons votre colis avec soin ❤️

- TinaBoutique
---

Variables :
1. Nom client
2. Numéro commande
3. Montant
4. Devise
```

### 3.3 Template : Colis Expédié

```
Nom : order_shipped
Catégorie : Transactionnel

Message :
---
📦 Votre colis est en route !

Commande #{{1}}
Transporteur : {{2}}
Suivi : {{3}}

Livraison estimée : {{4}}

✨ TinaBoutique
---
```

### 3.4 Template : Nouveautés (Marketing)

```
Nom : new_arrivals
Catégorie : Marketing (nécessite approbation ~24h)

Message :
---
🎁 Nouveautés TinaBoutique !

{{1}}

Découvrez-les : {{2}}

✨ L'élégance new-yorkaise
---

⚠️ Ce template nécessite approbation Meta (24-48h)
```

---

## ÉTAPE 4 : Configurer le Code (30 min)

### 4.1 Variables d'environnement Render

```
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ID=987654321098765
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxx
WHATSAPP_API_VERSION=v18.0
```

### 4.2 Modifier NotificationService.ts

Remplacez la fonction `sendWhatsApp` :

```typescript
private async sendWhatsApp(payload: NotificationPayload): Promise<void> {
  // Utiliser Meta WhatsApp Business API
  const whatsappConfig = this.buildWhatsAppTemplate(payload);
  
  const response = await fetch(
    `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappConfig.to,
        type: 'template',
        template: {
          name: this.getTemplateName(payload.templateName),
          language: { code: 'fr' },
          components: this.buildTemplateComponents(payload)
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp error: ${JSON.stringify(error)}`);
  }

  console.log('✅ WhatsApp envoyé:', whatsappConfig.to);
}

private getTemplateName(templateName: string): string {
  const mapping: Record<string, string> = {
    'purchase_confirmation': 'order_confirmation',
    'shipment_tracking': 'order_shipped',
    'new_arrivals': 'new_arrivals'
  };
  return mapping[templateName] || templateName;
}

private buildTemplateComponents(payload: NotificationPayload): any[] {
  // Construire les paramètres selon le template
  const data = payload.data;
  
  if (payload.templateName === 'purchase_confirmation') {
    return [{
      type: 'body',
      parameters: [
        { type: 'text', text: data.customerName },
        { type: 'text', text: data.orderId },
        { type: 'text', text: data.amount },
        { type: 'text', text: data.currency }
      ]
    }];
  }
  
  // Autres templates...
  return [];
}
```

---

## ÉTAPE 5 : Tester (15 min)

### 5.1 Test via Curl

```bash
curl -X POST \
  "https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "243837352401",
    "type": "template",
    "template": {
      "name": "order_confirmation",
      "language": { "code": "fr" },
      "components": [{
        "type": "body",
        "parameters": [
          {"type": "text", "text": "Client Test"},
          {"type": "text", "text": "12345"},
          {"type": "text", "text": "100"},
          {"type": "text", "text": "EUR"}
        ]
      }]
    }
  }'
```

### 5.2 Test depuis Dashboard Admin

```
1. Dashboard Admin → Paramètres
2. WhatsApp activé
3. Enregistrer
4. Cliquer "Envoyer test"
5. Vérifier WhatsApp ! 📱
```

---

## 💰 COÛTS RÉELS

### Gratuit (1000 conversations/mois)

```
1 conversation = discussion avec 1 client dans 24h

Exemples :
- 1 client achète → 1 conversation (confirmation)
- Même client : expédition 2h après → MÊME conversation (gratuit)
- Même client : nouveau message 25h après → 2ème conversation

Calcul mensuel :
- 100 clients différents × 3 messages = 100 conversations ✅ GRATUIT
- Broadcast 500 clients × 1 msg = 500 conversations ✅ GRATUIT
```

### Au-delà de 1000 (payant)

| Région | Prix/conversation |
|--------|------------------|
| Afrique | 0,016€ |
| Europe | 0,0333€ |

**Estimation : 1500 conversations = 500 × 0,016€ = 8€**

---

## 📊 COMPARAISON FINALE

### Mois avec 200 clients actifs

**Notifications :**
- 50 achats
- 50 expéditions  
- 30 paniers abandonnés
- 2 broadcasts (200 clients × 2)

**Avec Twilio :**
- 530 messages × 0,005€ = **2,65€**

**Avec Meta WhatsApp :**
- 530 conversations
- 1000 gratuites
- = **GRATUIT** ✅

---

## ✅ AVANTAGES META

1. ✅ **1000 conversations gratuites/mois**
2. ✅ **Professionnel** (badge vérifié)
3. ✅ **Templates approuvés** (conformité)
4. ✅ **Analytics détaillés**
5. ✅ **Pas de sandbox**
6. ✅ **Évolutif** (jusqu'à 10K+ messages)

---

## ❌ INCONVÉNIENTS

1. ❌ Configuration plus longue (1-2h vs 15min)
2. ❌ Templates doivent être approuvés (24-48h)
3. ❌ Plus technique à implémenter
4. ❌ Besoin compte Meta Business

---

## 🎯 MA RECOMMANDATION

### Pour démarrer rapidement : **Twilio**
- Setup 15 minutes
- Sandbox gratuit illimité
- Parfait pour tests

### Pour production long terme : **Meta WhatsApp**
- 1000 gratuites/mois
- Plus professionnel
- Meilleur ROI

### Solution hybride : **Les deux !**
```
1. Commencez avec Twilio (test)
2. Migrez vers Meta (production)
3. Code compatible avec les deux
```

---

## 📞 RESSOURCES

- Meta Business : https://business.facebook.com
- WhatsApp API Docs : https://developers.facebook.com/docs/whatsapp
- Pricing : https://developers.facebook.com/docs/whatsapp/pricing
- Templates : https://business.facebook.com/wa/manage/message-templates

---

## 🆘 SUPPORT

Besoin d'aide ?
- Support Meta : https://business.facebook.com/business/help
- Community : https://developers.facebook.com/community

**Prêt à économiser des milliers d'euros en notifications ? 🚀**
