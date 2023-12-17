import { prisma } from "~/utilities/database.server.ts";

export async function getAccount(email: string) {
  return await prisma.account.findUnique({
    where: {
      email,
    },
  });
}

export async function getPassword(email: string) {
  // This should always be unique (only one password row per user)
  return await prisma.password.findFirst({
    where: {
      account: {
        email,
      },
    },
  });
}
