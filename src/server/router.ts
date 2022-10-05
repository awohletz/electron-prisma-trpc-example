import {initTRPC} from '@trpc/server';

const t = initTRPC.create();

type User = { id: number; name: string };
const users: User[] = [
  {id: 1, name: 'John'},
  {id: 2, name: 'Jane'},
];

export const appRouter = t.router({
  users: t.procedure
    .query((req) => {
      return users;
    }),
  userById: t.procedure
    .input((val: unknown) => {
      if (typeof val !== 'number') {
        throw new Error('invalid input');
      }
      return val;
    })
    .query(({input: id}) => {
      return users.find((user) => user.id === id);
    }),
  userCreate: t.procedure
    .input((val: unknown) => {
      if (typeof val === 'string') return val;
      throw new Error(`Invalid input: ${typeof val}`);
    })
    .mutation((req) => {
      const { input } = req;
      const user = { id: users.length + 1, name: input };
      users.push(user);
      return user;
    })
});

export type AppRouter = typeof appRouter;
