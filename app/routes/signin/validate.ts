import { getPassword } from "./queries.ts";
import { prisma } from "~/utilities/database.server.ts";
import bcrypt from "bcryptjs";

type Data = {
  email: string;
  password: string;
};

export async function validate({ email, password }: Data) {
  let errors: { email?: string; password?: string } = {};

  if (!email) {
    errors.email = "Please provide your email address";
  } else if (!email.includes("@")) {
    errors.email = "This email address is invalid";
  } else if (!(await accountExists(email))) {
    errors.email = "There is no account associated with this address";
  }

  if (!password) {
    errors.password = "Please provide your password";
  } else if (
    (await accountExists(email)) &&
    !(await passwordIsCorrect(password, email))
  ) {
    errors.password = "This password is not correct";
  }

  return Object.keys(errors).length ? errors : null;
}

async function accountExists(email: string) {
  const account = await prisma.account.findUnique({ where: { email } });

  return Boolean(account);
}

async function passwordIsCorrect(password: string, email: string) {
  const storedPassword = await getPassword(email);

  // This should never happen
  if (!storedPassword) {
    throw new Error("Failed to get password associated with account");
  }

  return await bcrypt.compare(password, storedPassword.hash);
}
