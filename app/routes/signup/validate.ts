import { prisma } from "~/utilities/database.server.ts";

type Data = {
  name: string;
  email: string;
  password: string;
};

export async function validate({ name, email, password }: Data) {
  let errors: { name?: string; email?: string; password?: string } = {};

  if (!name) {
    errors.name = "A name is required";
  }

  if (!email) {
    errors.email = "An email address is required";
  } else if (!email.includes("@")) {
    errors.email = "This email address is invalid";
  } else if (await accountExists(email)) {
    errors.email = "This email address is already in use";
  }

  if (!password) {
    errors.password = "A password is required";
  } else if (password.length < 8) {
    errors.password = "The password must be at least 8 characters long";
  }

  return Object.keys(errors).length ? errors : null;
}

async function accountExists(email: string) {
  const account = await prisma.account.findUnique({ where: { email } });

  return Boolean(account);
}
