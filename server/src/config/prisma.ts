import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Guarantee process.env.DATABASE_URL is set before engine boot
const dbUrl =
  process.env.DATABASE_URL ||
  env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0Pel7fWUTBSK@ep-fancy-morning-be1ymzib-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require';

process.env.DATABASE_URL = dbUrl;

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}

