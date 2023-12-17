import { prisma } from "~/utilities/database.server.ts";
import bcrypt from "bcryptjs";

type AccountDetails = {
  name: string;
  email: string;
  password: string;
};

export async function createAccount({ name, email, password }: AccountDetails) {
  const hash = await bcrypt.hash(password, 10);

  return await prisma.account.create({
    data: {
      name,
      email,
      password: {
        create: {
          hash,
        },
      },
    },
  });
}
