import {initTRPC} from '@trpc/server';
import { prisma } from './prisma';
import superjson from 'superjson';
import {z} from "zod";

const t = initTRPC.create({
  transformer: superjson
});

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
    .input(z.object({
      name: z.string(),
      dateCreated: z.date(),
    }))
    .mutation(async ({input: {name, dateCreated}}) => {
      console.log("Creating user on ", dateCreated.toLocaleString());
      const user = await prisma.user.create({
        data: {
          name
        }
      });

      return user;
    })
});

export type AppRouter = typeof appRouter;
