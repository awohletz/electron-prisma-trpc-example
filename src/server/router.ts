import {initTRPC} from '@trpc/server';
import { prisma } from './prisma';
import * as z from 'zod';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const appRouter = t.router({
  users: t.procedure
    .query(() => {
      return prisma.user.findMany();
    }),
  userById: t.procedure
    .input(z.number().int())
    .query(({input: id}) => {
      return prisma.user.findUnique({
        where: {
          id,
        }
      })
    }),
  userCreate: t.procedure
    .input(z.object({
      name: z.string(),
      dateCreated: z.date()
    }))
    .mutation(async ({input: {name, dateCreated}}) => {
      const user = await prisma.user.create({
        data: {
          name,
          dateCreated
        }
      });

      return user;
    })
});

export type AppRouter = typeof appRouter;
