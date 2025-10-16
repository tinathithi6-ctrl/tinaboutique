# ⚡ Quick Start - Email Configuration

## 🚀 3 Étapes Rapides

### 1️⃣ Ajoutez dans votre `.env` (SANS ESPACES!)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ttinathithi6@gmail.com
SMTP_PASS=vabnqvwaldtahow
```

**⚠️ CRUCIAL**: Le mot de passe doit être **sans espaces**!  
Vous avez fourni: `vabn qvwa lodt ahow` (avec espaces) ❌  
Utilisez: `vabnqvwaldtahow` (sans espaces) ✅

---

### 2️⃣ Testez l'envoi

```bash
node test-email.js
```

✅ **Succès**: Vous recevrez un email sur `ttinathithi6@gmail.com`  
❌ **Erreur**: Vérifiez que le mot de passe n'a pas d'espaces

---

### 3️⃣ Créez la table des paramètres

```bash
node create-settings-table-fix.js
```

---

## 🎉 C'est tout!

Votre système d'email est maintenant configuré.

**Test final**:
1. Lancez le serveur: `npm run dev:backend`
2. Créez une commande de test
3. Vérifiez votre email!

---

## 📚 Documentation

- `SETUP-EMAIL-COMPLETE.md` - Guide complet
- `GUIDE-GMAIL-SMTP.md` - Détails Gmail SMTP
- `test-email.js` - Script de test

---

**Temps total: 5 minutes ⏱️**
