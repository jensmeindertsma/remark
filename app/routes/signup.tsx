import { conform, FieldConfig, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { bcrypt } from "~/utilities/crypto.server.ts";
import { database } from "~/utilities/database.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";
import { useId } from "react";
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
  const lastSubmission = useActionData<typeof action>();

  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission,
    constraint: getFieldsetConstraint(schema),
    onValidate({ formData }) {
      return parse(formData, {
        // Create the schema without any constraint defined
        schema,
      });
    },
    shouldValidate: "onBlur",
  });

  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST" {...form.props}>
        <Field type="text" field={fields.name} label="Your name" />
        <Field type="email" field={fields.email} label="Email Address" />
        <Field type="password" field={fields.password} label="Password" />
        <Field
          type="password"
          field={fields.confirmPassword}
          label="Confirm your password"
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
    return redirect("/bookmarks");
  }

  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: schema.superRefine(async (data, ctx) => {
      const existingUser = await database.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });
        return;
      }
    }),
    async: true,
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const { name, email, password } = submission.value;
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

  await session.activate({ id, redirectTo: "/bookmarks" });
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

type FieldProps = {
  type: "text" | "email" | "password";
  field: FieldConfig<string>;
  label: string;
};

function Field({ type, field, label }: FieldProps) {
  return (
    <>
      <label htmlFor={field.id}>{label}</label>
      <input
        aria-invalid={Boolean(field.error)}
        aria-describedby={`${field.id}-error`}
        {...conform.input(field, {
          type,
        })}
      />
      <div style={{ color: "red" }} id={`${field.id}-error`}>
        {field.error}
      </div>
    </>
  );
}
