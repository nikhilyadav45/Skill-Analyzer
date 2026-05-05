import { PrismaClient } from '@prisma/client';
import { logger } from '../common/utils/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error(e.message);
});

prisma.$on('warn', (e) => {
  logger.warn(e.message);
});

prisma.$on('info', (e) => {
  logger.info(e.message);
});
