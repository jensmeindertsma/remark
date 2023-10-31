import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { formatTitle } from "~/utilities/meta.ts";
import {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";

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
  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST">
        <label htmlFor="name">Your name</label>
        <input
          name="name"
          id="name"
          type="text"
          placeholder="John Doe"
          required
        />

        <label htmlFor="email">Email address</label>
        <input
          name="email"
          id="email"
          type="email"
          placeholder="john.doe@gmail.com"
          required
        />

        <label htmlFor="password">Password</label>
        <input name="password" id="password" type="password" required />

        <label htmlFor="confirm-password">Confirm your password</label>
        <input
          name="confirm-password"
          id="confirm-password"
          type="password"
          required
        />

        <button type="submit">Sign up</button>
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/bookmarks");
  }

  return json(null);
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/dashboard");
  }

  return session.activate({ id: "todo", redirectTo: "/dashboard" });
}
