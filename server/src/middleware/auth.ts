import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticateJwt(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      // Check httpOnly cookie
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Invalid or expired authentication token.', 401, 'INVALID_TOKEN'));
  }
}

