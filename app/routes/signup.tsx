import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { bcrypt } from "~/utilities/crypto.server.ts";
import { database } from "~/utilities/database.server.ts";
import { formatFeedback } from "~/utilities/feedback.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";
import { z } from "zod";

import styles from "~/styles/signup.css";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Sign up"),
    },
  ];
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function SignUp() {
  const feedback = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = ["submitting", "loading"].includes(navigation.state);

  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST">
        <fieldset disabled={isSubmitting}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-invalid={Boolean(feedback?.name.error)}
            aria-describedby="name-error"
            defaultValue={feedback?.name.value}
          />
          <div style={{ color: "red" }} id="name-error">
            {feedback?.name.error}
          </div>

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={Boolean(feedback?.email.error)}
            aria-describedby="email-error"
            defaultValue={feedback?.email.value}
          />
          <div style={{ color: "red" }} id="email-error">
            {feedback?.email.error}
          </div>

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            aria-invalid={Boolean(feedback?.password.error)}
            aria-describedby="password-error"
            defaultValue={feedback?.password.value}
          />
          <div style={{ color: "red" }} id="password-error">
            {feedback?.password.error}
          </div>

          <label htmlFor="confirm-password">Confirm your password</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            aria-invalid={Boolean(feedback?.confirmPassword.error)}
            aria-describedby="confirm-password-error"
          />
          <div style={{ color: "red" }} id="confirm-password-error">
            {feedback?.confirmPassword.error}
          </div>

          <button type="submit">
            {isSubmitting ? "Signing you up..." : "Sign up"}
          </button>
        </fieldset>
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/remarks");
  }

  return json(null);
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/remarks");
  }

  const formData = await request.formData();
  const rawData = {
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    confirmPassword: String(formData.get("confirm-password")),
  };

  const result = await schema
    .refine(
      async (data) => {
        const existingUser = await database.user.findUnique({
          where: { email: data.email },
          select: { id: true },
        });
        // if no existing user, then is valid
        return !existingUser;
      },
      {
        message: "A user already exists with this email",
        path: ["email"], // path of error
      }
    )
    .safeParseAsync(rawData);

  if (!result.success) {
    return json(formatFeedback(rawData, result.error));
  }

  const { name, email, password } = result.data;

  const { id } = await database.user.create({
    data: {
      name,
      email,
      password: {
        create: {
          hash: await bcrypt.hash(password, 10),
        },
      },
    },
    select: {
      id: true,
    },
  });

  await session.activate({ id, redirectTo: "/remarks" });
}

const schema = z
  .object({
    name: z
      .string({ required_error: "Please provide a name" })
      .max(50, "This name is too long"),
    email: z
      .string({ required_error: "Please provide an email address" })
      .email("This email address is invalid"),

    password: z.string({ required_error: "Please provide a password" }),
    confirmPassword: z.string({
      required_error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "This password does not match the one you entered above",
    path: ["confirmPassword"],
  });
