import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

async function startServer() {
  try {
    // Attempt database connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');
  } catch (dbError) {
    console.warn('⚠️  Database connection could not be established immediately:');
    console.warn(`   ${(dbError as Error).message}`);
    console.warn('💡 Tip: Ensure PostgreSQL is running (`npm run docker:up` or verify DATABASE_URL in .env)');
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`📡 Client URL accepted: ${env.CLIENT_URL}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
});

startServer();
