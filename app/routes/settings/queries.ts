import { prisma } from "~/utilities/database.server.ts";
import bcrypt from "bcryptjs";

export async function getAccount(id: string) {
  return await prisma.account.findUnique({ where: { id } });
}

export async function updateAccount({
  id,
  name,
  email,
  password,
}: {
  id: string;
  name: string;
  email: string;
  password: string | null;
}) {
  await prisma.account.update({ where: { id }, data: { name, email } });

  if (password) {
    const hash = await bcrypt.hash(password, 10);

    await prisma.password.update({
      where: {
        accountId: id,
      },
      data: {
        hash,
      },
    });
  }
}

export async function deleteAccount(id: string) {
  await prisma.account.delete({ where: { id } });
}
