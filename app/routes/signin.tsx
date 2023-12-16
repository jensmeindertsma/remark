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
import { z, ZodIssueCode } from "zod";

import styles from "~/styles/signup.css";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Sign in"),
    },
  ];
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/remarks");
  }

  return json(null);
}

export default function SignIn() {
  const feedback = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = ["submitting", "loading"].includes(navigation.state);

  return (
    <>
      <h1>Sign in</h1>
      <Form method="POST">
        <fieldset disabled={isSubmitting}>
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

          <button type="submit">
            {isSubmitting ? "Signing you in..." : "Sign in"}
          </button>
        </fieldset>
      </Form>
    </>
  );
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/remarks");
  }

  const formData = await request.formData();
  const rawData = {
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  };

  const result = await schema
    .superRefine(async ({ email, password }, context) => {
      const user = await database.user.findUnique({
        where: { email },
        select: { password: true },
      });

      if (!user) {
        context.addIssue({
          path: ["email"],
          message: "No user exists for this email address!",
          code: ZodIssueCode.custom,
        });
        return;
      }

      if (!user.password) {
        throw new Error(
          "Encountered user without associated password in database"
        );
      }

      const isValid = await bcrypt.compare(password, user.password.hash);

      if (!isValid) {
        context.addIssue({
          path: ["password"],
          message: "This password isn't quite right!",
          code: ZodIssueCode.custom,
        });
      }
    })
    .safeParseAsync(rawData);

  if (!result.success) {
    return json(formatFeedback(rawData, result.error));
  }

  const { email } = result.data;

  const user = await database.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("user deleted since check");
  }

  await session.activate({ id: user.id, redirectTo: "/remarks" });
}

const schema = z.object({
  email: z
    .string({ required_error: "Please provide your email address" })
    .email("This email address is invalid"),
  password: z.string({ required_error: "Please provide your password" }),
});
