import { PrismaClient } from '../generated/client';
import {initTRPC} from '@trpc/server';

const t = initTRPC.create();
const prisma = new PrismaClient();

export const appRouter = t.router({
  users: t.procedure
    .query(() => {
      return prisma.user.findMany();
    }),
  userById: t.procedure
    .input((val: unknown) => {
      if (typeof val !== 'number') {
        throw new Error('invalid input');
      }
      return val;
    })
    .query(({input: id}) => {
      return prisma.user.findUnique({
        where: {
          id,
        }
      })
    }),
  userCreate: t.procedure
    .input((val: unknown) => {
      if (typeof val === 'string') return val;
      throw new Error(`Invalid input: ${typeof val}`);
    })
    .mutation(async ({input: name}) => {
      const user = await prisma.user.create({
        data: {
          name
        }
      });

      return user;
    })
});

export type AppRouter = typeof appRouter;
