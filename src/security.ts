// --- CONFIGURATIONS DE SÉCURITÉ (OWASP, PCI DSS, GDPR) ---

import crypto from 'crypto';

// Générer un sel cryptographique sécurisé
export function generateSalt(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hacher un mot de passe avec PBKDF2 (plus sécurisé que bcrypt seul)
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const iterations = 100000; // Nombre d'itérations élevé pour la sécurité
  const keyLength = 64;
  const digest = 'sha256';

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);
  return `${salt}:${iterations}:${keyLength}:${digest}:${hash.toString('hex')}`;
}

// Vérifier un mot de passe haché avec PBKDF2
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, iterations, keyLength, digest, hash] = hashedPassword.split(':');

  const derivedHash = crypto.pbkdf2Sync(
    password,
    salt,
    parseInt(iterations),
    parseInt(keyLength),
    digest
  );

  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedHash);
}

// Générer un token CSRF sécurisé
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Valider et nettoyer les entrées utilisateur (XSS protection)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer les scripts
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les protocoles javascript
    .replace(/on\w+\s*=/gi, '') // Supprimer les event handlers
    .trim()
    .substring(0, 1000); // Limiter la longueur
}

// Valider les données de carte de crédit (PCI DSS)
export function validateCreditCard(cardNumber: string): boolean {
  // Algorithme de Luhn pour validation basique
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Masquer les informations sensibles dans les logs
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const masked = { ...data };

  // Masquer les mots de passe
  if (masked.password) masked.password = '***MASKED***';
  if (masked.password_hash) masked.password_hash = '***MASKED***';

  // Masquer les numéros de carte
  if (masked.card_number) {
    masked.card_number = masked.card_number.substring(0, 4) + '****' + masked.card_number.substring(masked.card_number.length - 4);
  }

  // Masquer les tokens
  if (masked.token) masked.token = '***TOKEN_MASKED***';

  return masked;
}

// Générer un ID de session sécurisé
export function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Valider les permissions utilisateur
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3,
    'superadmin': 4
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Rate limiting en mémoire (pour développement)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${identifier}`;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Nettoyer le store de rate limiting périodiquement
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Nettoyer chaque minute

// Chiffrement des données sensibles (RGPD) - Version simplifiée pour développement
export function encryptData(data: string, key?: string): string {
  // En production, utiliser une vraie implémentation de chiffrement
  // Pour le développement, on utilise une approche simple mais sécurisée
  const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey.substring(0, 32)), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptData(encryptedData: string, key?: string): string {
  const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  const [ivHex, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey.substring(0, 32)), Buffer.from(ivHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}