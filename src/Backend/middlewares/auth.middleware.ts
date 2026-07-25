import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/helpers';
import { AuthRequest, Role } from '../types';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Le jeton d’autorisation est requis.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, 'Jeton invalide ou expiré.', 401);
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Public resources can still be served without a valid token.
  }

  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Non autorisé.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Permissions insuffisantes.', 403);
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireUser = requireRole('user', 'admin');
