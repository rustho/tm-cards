import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Prevent connection errors during build if env is missing
  if (process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL) {
      return new Proxy({} as PrismaClient, {
          get: () => {
            return () => Promise.resolve([]);
          }
      });
  }

  return new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
