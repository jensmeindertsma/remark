import { prisma } from "~/utilities/database.server.ts";

type Data = {
  name: string;
  email: string;
  password: string;
};

export async function validate({ name, email, password }: Data) {
  let errors: { name?: string; email?: string; password?: string } = {};

  if (!name) {
    errors.name = "This field is required";
  }

  if (!email) {
    errors.email = "This field is required";
  } else if (!email.includes("@")) {
    errors.email = "This address is invalid";
  } else if (await accountExists(email)) {
    errors.email = "This address is already in use";
  }

  if (!password) {
    errors.password = "This field is required";
  } else if (password.length < 8) {
    errors.password = "Must be at least 8 characters";
  }

  return Object.keys(errors).length ? errors : null;
}

async function accountExists(email: string) {
  const account = await prisma.account.findUnique({ where: { email } });

  return Boolean(account);
}
