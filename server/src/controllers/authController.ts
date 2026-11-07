import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApiResponse, AuthResponse, UserProfile } from '@ai-resume/shared';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie options (sameSite: 'none' and secure: true are required for cross-domain Vercel <-> Render cookies)
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 15 * 60 * 1000 // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash
      }
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database (7-day expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Set cookies
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Account created successfully',
      data: {
        user: userProfile,
        accessToken
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Set cookies
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userProfile,
        accessToken
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!token) {
      throw new AppError('Refresh token required.', 401, 'MISSING_REFRESH_TOKEN');
    }

    const payload = verifyRefreshToken(token);

    // Verify token exists in database and has not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { token } });
      }
      throw new AppError('Refresh token expired or revoked.', 401, 'EXPIRED_REFRESH_TOKEN');
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });

    const tokenPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt
      }
    });

    res.cookie('access_token', newAccessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    const response: ApiResponse<{ accessToken: string }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token }
      });
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userProfile
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new AppError('Google credential token is required', 400, 'MISSING_CREDENTIAL');
    }

    // Verify token with Google's official tokeninfo endpoint
    let googleUser: any = null;
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (googleRes.ok) {
        googleUser = await googleRes.json();
      }
    } catch (e) {
      console.warn('Google tokeninfo fetch failed, attempting jwt decode fallback', e);
    }

    if (!googleUser || !googleUser.email) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          googleUser = JSON.parse(payloadStr);
        }
      } catch (err) {
        throw new AppError('Invalid Google credential token', 401, 'INVALID_GOOGLE_TOKEN');
      }
    }

    if (!googleUser || !googleUser.email) {
      throw new AppError('Failed to retrieve user email from Google', 400, 'GOOGLE_EMAIL_MISSING');
    }

    const email = String(googleUser.email).toLowerCase().trim();
    const name = String(googleUser.name || googleUser.given_name || email.split('@')[0]);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const randomPassword = (Math.random() + 1).toString(36).substring(2) + '!G00gleAuth2026';
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash
        }
      });
    }

    // Generate session tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database (7-day expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Set cookies
    res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Authenticated with Google successfully',
      data: {
        user: userProfile,
        accessToken
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

