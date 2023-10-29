import { Form } from "@remix-run/react";
import { MetaResult } from "~/utils/remix.ts";

import styles from "~/styles/signup.css";

export default function SignUp() {
  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST">
        <label htmlFor="name">Your name</label>
        <input name="name" id="name" type="text" placeholder="John Doe" />

        <label htmlFor="email">Email address</label>
        <input
          name="email"
          id="email"
          type="email"
          placeholder="john.doe@gmail.com"
        />

        <label htmlFor="password">Password</label>
        <input name="password" id="password" type="password" />

        <label htmlFor="confirm-password">Confirm your password</label>
        <input name="confirm-password" id="confirm-password" type="password" />

        <button type="submit">Sign up</button>
      </Form>
    </>
  );
}

export function meta(): MetaResult {
  return [
    {
      title: "Sign up to Remark",
    },
  ];
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
