import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

const app = createApp();

describe('Auth & API Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
  });

  describe('Validation on /api/auth/register', () => {
    it('rejects registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'Password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects registration with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Validation on /api/auth/login', () => {
    it('rejects empty login credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Registration logic', () => {
    it('returns 409 when user already exists', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-1',
        email: 'existing@example.com',
        passwordHash: 'hashed',
        name: 'Existing User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('successfully registers new user and sets cookies', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      vi.spyOn(prisma.user, 'create').mockResolvedValueOnce({
        id: 'user-new',
        email: 'newuser@example.com',
        passwordHash: 'hashed',
        name: 'New User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.spyOn(prisma.refreshToken, 'create').mockResolvedValueOnce({
        id: 'token-1',
        token: 'refresh_mock_token',
        userId: 'user-new',
        expiresAt: new Date(),
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.accessToken).toBeDefined();

      // Verify cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('access_token'))).toBe(true);
      expect(cookies.some((c: string) => c.includes('refresh_token'))).toBe(true);
    });
  });

  describe('Login logic', () => {
    it('returns 401 on non-existent email', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 on incorrect password', async () => {
      const hash = await bcrypt.hash('CorrectPassword123', 10);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('successfully logs in with correct password', async () => {
      const hash = await bcrypt.hash('CorrectPassword123', 10);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.spyOn(prisma.refreshToken, 'create').mockResolvedValueOnce({
        id: 'token-1',
        token: 'refresh_mock_token',
        userId: 'user-1',
        expiresAt: new Date(),
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'CorrectPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('Protected routes without token', () => {
    it('rejects GET /api/auth/me when unauthenticated', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
