// Middleware pour tracker automatiquement toutes les requêtes
import { Request, Response, NextFunction } from 'express';
import { ActivityLogger } from '../services/ActivityLogger';

export interface TrackingRequest extends Request {
  activityLogger?: ActivityLogger;
  userIp?: string;
}

/**
 * Middleware pour injecter l'ActivityLogger dans req
 */
export function injectActivityLogger(activityLogger: ActivityLogger) {
  return (req: TrackingRequest, res: Response, next: NextFunction) => {
    req.activityLogger = activityLogger;
    
    // Extraire l'IP réelle (même derrière proxy)
    req.userIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    
    next();
  };
}

/**
 * Middleware pour logger automatiquement certaines actions
 */
export function autoTrackMiddleware() {
  return async (req: TrackingRequest, res: Response, next: NextFunction) => {
    const logger = req.activityLogger;
    if (!logger) return next();

    const user = (req as any).user; // Vient du authenticateToken
    const method = req.method;
    const path = req.path;
    const ipAddress = req.userIp;
    const userAgent = req.headers['user-agent'];

    // Déterminer le type d'action basé sur le chemin
    let actionType = '';
    let actionDescription = '';
    let entityType = '';
    let entityId = '';

    // Routes de produits
    if (path.match(/\/api\/products\/(\d+)/) && method === 'GET') {
      const productId = path.match(/\/api\/products\/(\d+)/)?.[1];
      actionType = 'VIEW_PRODUCT';
      actionDescription = `Vue du produit ${productId}`;
      entityType = 'product';
      entityId = productId || '';
    }

    // Routes de panier
    if (path === '/api/cart' && method === 'POST') {
      actionType = 'ADD_TO_CART';
      actionDescription = `Ajout au panier`;
      entityType = 'cart';
    }

    // Routes de commande
    if (path === '/api/orders' && method === 'POST') {
      actionType = 'ORDER_PLACED';
      actionDescription = `Commande passée`;
      entityType = 'order';
    }

    // Si on a identifié une action, la logger
    if (actionType && logger) {
      try {
        await logger.logActivity({
          userId: user?.id,
          userEmail: user?.email,
          actionType,
          actionDescription,
          entityType,
          entityId,
          ipAddress,
          userAgent,
          metadata: {
            method,
            path,
            query: req.query,
            body: sanitizeBody(req.body)
          }
        });
      } catch (error) {
        console.error('Erreur auto-tracking:', error);
      }
    }

    next();
  };
}

/**
 * Helper pour logger une action manuellement
 */
export async function logAction(
  req: TrackingRequest,
  actionType: string,
  actionDescription: string,
  metadata: any = {}
) {
  const logger = req.activityLogger;
  if (!logger) return;

  const user = (req as any).user;
  
  await logger.logActivity({
    userId: user?.id,
    userEmail: user?.email,
    actionType,
    actionDescription,
    ipAddress: req.userIp,
    userAgent: req.headers['user-agent'],
    metadata
  });
}

/**
 * Sanitize les données sensibles avant logging
 */
function sanitizeBody(body: any) {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Supprimer les champs sensibles
  const sensitiveFields = ['password', 'card_number', 'cvv', 'pin', 'token'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***MASKED***';
    }
  });
  
  return sanitized;
}
