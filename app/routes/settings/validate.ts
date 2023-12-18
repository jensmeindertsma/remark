import { prisma } from "~/utilities/database.server.ts";

type Data = {
  accountId: string;
  name: string;
  email: string;
  password: string;
};

export async function validate({ accountId, name, email, password }: Data) {
  let errors: { name?: string; email?: string; password?: string } = {};

  if (!name) {
    errors.name = "This field is required";
  }

  if (!email) {
    errors.email = "This field is required";
  } else if (!email.includes("@")) {
    errors.email = "This address is invalid";
  } else if (!(await accountAvailable(accountId, email))) {
    errors.email = "This address is not available";
  }

  if (password && password.length < 8) {
    errors.password = "Must be at least 8 characters";
  }

  return Object.keys(errors).length ? errors : null;
}

async function accountAvailable(accountId: string, email: string) {
  const account = await prisma.account.findUnique({ where: { email } });

  return !account || account.id === accountId;
}
