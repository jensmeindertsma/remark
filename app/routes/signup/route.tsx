import { createAccount } from "./queries.ts";
import { validate } from "./validate.ts";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Field } from "~/components/Field.tsx";
import { redirectUser } from "~/utilities/auth.server.ts";
import { getFields } from "~/utilities/form.ts";
import { formatTitle } from "~/utilities/meta.ts";
import type {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { badRequest } from "~/utilities/response.server.ts";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Sign up"),
    },
  ];
}

export default function SignUp() {
  const feedback = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <>
      <h1>Sign up</h1>
      <Form method="POST">
        <fieldset disabled={isSubmitting}>
          <Field
            name="name"
            type="text"
            label="Name"
            required
            defaultValue={feedback?.values.name}
            error={feedback?.errors.name}
          />

          <Field
            name="email"
            type="email"
            label="Email address"
            required
            defaultValue={feedback?.values.email}
            error={feedback?.errors.email}
          />

          <Field
            name="password"
            type="password"
            label="Password"
            required
            defaultValue={feedback?.values.password}
            error={feedback?.errors.password}
          />

          <button type="submit">
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </fieldset>
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  await redirectUser(request, "/remarks");
  return null;
}

export async function action({ request }: ActionArguments) {
  const session = await redirectUser(request, "/remarks");

  const formData = await request.formData();
  const [name, email, password] = getFields(formData, [
    "name",
    "email",
    "password",
  ]);

  const errors = await validate({ name, email, password });

  if (errors) {
    return badRequest({ values: { name, email, password }, errors });
  }

  const { id } = await createAccount({ name, email, password });

  await session.activate({ id, redirectTo: "/remarks" });
}
