import {initTRPC} from '@trpc/server';
import { prisma } from './prisma';

const t = initTRPC.create();

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
