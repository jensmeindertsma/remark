import { deleteAccount, getAccount, updateAccount } from "./queries.ts";
import { validate } from "./validate.ts";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Field } from "~/components/Field.tsx";
import { redirectGuest } from "~/utilities/auth.server.ts";
import { getFields } from "~/utilities/form.ts";
import { formatTitle } from "~/utilities/meta.ts";
import type {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { badRequest } from "~/utilities/response.server.ts";
import { getSession } from "~/utilities/session.server.ts";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Settings"),
    },
  ];
}

export default function Settings() {
  const { name, email } = useLoaderData<typeof loader>();
  const feedback = useActionData<typeof action>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  const fetcher = useFetcher<typeof action>();

  return (
    <>
      <h1>Settings</h1>

      <fetcher.Form method="POST">
        <fieldset disabled={fetcher.state !== "idle"}>
          <Field
            name="name"
            type="text"
            label="Name"
            required
            defaultValue={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.values.name
                : name
            }
            error={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.errors.name
                : undefined
            }
          />

          <Field
            name="email"
            type="email"
            label="Email address"
            required
            defaultValue={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.values.email
                : email
            }
            error={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.errors.email
                : undefined
            }
          />

          <Field
            name="password"
            type="password"
            label="Password"
            defaultValue={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.values.password
                : undefined
            }
            error={
              fetcher.data?.status === Status.SaveFeedback
                ? fetcher.data?.errors.password
                : undefined
            }
          />

          <button type="submit" name="intent" value={Intent.Save}>
            Save
          </button>
        </fieldset>
      </fetcher.Form>

      <Form method="POST">
        <button
          type="submit"
          name="intent"
          value={Intent.Delete}
          disabled={isSubmitting || feedback?.status === Status.ConfirmDelete}
        >
          Delete account
        </button>
        {feedback?.status === Status.ConfirmDelete ? (
          <>
            <button
              type="submit"
              name="intent"
              value={Intent.ConfirmDelete}
              disabled={isSubmitting}
            >
              Confirm
            </button>
            <button
              type="submit"
              name="intent"
              value={Intent.Cancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </>
        ) : null}
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await redirectGuest(request, "/signin");
  const user = await getAccount(session.userId);

  if (!user) {
    throw new Error("Cannot find user account associated with session ID");
  }

  return json(user);
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const [intent] = getFields(formData, ["intent"]);

  switch (intent as Intent) {
    case Intent.Cancel: {
      return json(null);
    }

    case Intent.Save: {
      const [name, email, password] = getFields(formData, [
        "name",
        "email",
        "password",
      ]);

      const passwordChanged = Boolean(password.length);

      const errors = await validate({
        accountId: session.userId,
        name,
        email,
        password,
      });

      if (errors) {
        return badRequest({
          status: Status.SaveFeedback as const,
          values: { name, email, password },
          errors,
        });
      }

      await updateAccount({
        id: session.userId,
        name,
        email,
        password: passwordChanged ? password : null,
      });

      return json(null);
    }

    case Intent.Delete: {
      return json({ status: Status.ConfirmDelete as const });
    }

    case Intent.ConfirmDelete: {
      await deleteAccount(session.userId);

      return await session.end({ redirectTo: "/" });
    }

    default: {
      throw new Error(`Unhandled form intent "${intent}"`);
    }
  }
}

enum Intent {
  Cancel = "cancel",
  ConfirmDelete = "confirm-delete",
  Delete = "delete",
  Save = "save",
}

enum Status {
  ConfirmDelete = "confirm-delete",
  SaveFeedback = "save-feedback",
}
