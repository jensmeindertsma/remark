import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { bcrypt } from "~/utilities/crypto.server.ts";
import { database } from "~/utilities/database.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";
import { z } from "zod";

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

  const nameFetcher = useFetcher<{ error?: string }>();
  const isUpdatingName = ["submitting", "loading"].includes(nameFetcher.state);

  const emailFetcher = useFetcher<{ error?: string }>();
  const isUpdatingEmail = ["submitting", "loading"].includes(
    emailFetcher.state
  );

  const passwordFetcher = useFetcher<{ error?: string }>();
  const isUpdatingPassword = ["submitting", "loading"].includes(
    passwordFetcher.state
  );

  return (
    <>
      <h1>Settings</h1>

      <nameFetcher.Form method="POST">
        <fieldset disabled={isUpdatingName}>
          <input type="hidden" name="intent" value={Intent.ChangeName} />

          <label htmlFor="name">New Name</label>
          <input
            type="text"
            required
            defaultValue={name}
            name="name"
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(nameFetcher.data?.error)}
            aria-describedby="name-error"
          />

          <button type="submit">
            {isUpdatingName ? "Changing your name..." : "Change your name"}
          </button>

          <div style={{ color: "red" }} id="name-error">
            {nameFetcher.data?.error}
          </div>
        </fieldset>
      </nameFetcher.Form>

      <emailFetcher.Form method="POST">
        <fieldset disabled={isUpdatingEmail}>
          <input type="hidden" name="intent" value={Intent.ChangeEmail} />

          <label htmlFor="email">New Email Address</label>
          <input
            type="email"
            required
            defaultValue={email}
            name="email"
            id="email"
            autoComplete="email"
            aria-invalid={Boolean(emailFetcher.data?.error)}
            aria-describedby="email-error"
          />

          <button type="submit">
            {isUpdatingEmail
              ? "Changing your email address..."
              : "Change your email addres"}
          </button>

          <div style={{ color: "red" }} id="email-error">
            {emailFetcher.data?.error}
          </div>
        </fieldset>
      </emailFetcher.Form>

      <passwordFetcher.Form method="POST">
        <fieldset disabled={isUpdatingPassword}>
          <input type="hidden" name="intent" value={Intent.ChangePassword} />

          <label htmlFor="password">New Password</label>
          <input
            type="password"
            required
            name="password"
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordFetcher.data?.error)}
            aria-describedby="password-error"
          />
          <div style={{ color: "red" }} id="password-error">
            {passwordFetcher.data?.error}
          </div>
          <button type="submit">
            {isUpdatingPassword
              ? "Changing your password..."
              : "Change your password"}
          </button>
        </fieldset>
      </passwordFetcher.Form>

      <Form method="POST">
        <fieldset>
          <input
            type="hidden"
            name="intent"
            value={
              feedback?.status === Status.ConfirmDelete
                ? Intent.ConfirmDelete
                : Intent.Delete
            }
          />
          <button
            type="submit"
            disabled={
              navigation.formData?.get("intent") === Intent.Delete ||
              navigation.formData?.get("intent") === Intent.ConfirmDelete ||
              feedback?.status === Status.ConfirmDelete
            }
          >
            Delete account
          </button>
          {feedback?.status === Status.ConfirmDelete ? (
            <button
              type="submit"
              disabled={
                navigation.state === "submitting" &&
                navigation.formData?.get("intent") === Intent.ConfirmDelete
              }
            >
              Confirm delete
            </button>
          ) : null}
        </fieldset>
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  const user = await database.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  if (!user) {
    throw new Error("no user for ID");
  }

  return json(user);
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const intent = z.nativeEnum(Intent, {}).parse(formData.get("intent"));

  switch (intent) {
    case Intent.ChangeEmail: {
      const result = z
        .string({ required_error: "Please provide an email address" })
        .email("Please provide a valid email address")
        .safeParse(formData.get("email"));

      if (!result.success) {
        return json(
          {
            status: Status.InvalidEmail,
            error: "FAIL",
          },
          400
        );
      }

      const newEmail = result.data;

      await database.user.update({
        where: { id: session.userId },
        data: {
          email: newEmail,
        },
      });

      return json(null);
    }
    case Intent.ChangeName: {
      const result = z
        .string({ required_error: "Please provide a name" })
        .max(50, "This name is too long")
        .safeParse(formData.get("name"));

      if (!result.success) {
        return json(
          {
            status: Status.InvalidName,
            error: "FAIL",
          },
          400
        );
      }

      const newName = result.data;

      await database.user.update({
        where: { id: session.userId },
        data: {
          name: newName,
        },
      });

      return json(null);
    }
    case Intent.ChangePassword: {
      const result = z
        .string({ required_error: "Please provide a password" })
        .safeParse(formData.get("password"));

      if (!result.success) {
        return json(
          {
            status: Status.InvalidPassword,
            error: "FAIL",
          },
          400
        );
      }

      const newPassword = result.data;

      await database.user.update({
        where: { id: session.userId },
        data: {
          password: {
            update: {
              hash: await bcrypt.hash(newPassword, 10),
            },
          },
        },
      });

      return json(null);
    }
    case Intent.Delete: {
      return json({ status: Status.ConfirmDelete, error: null });
    }
    case Intent.ConfirmDelete: {
      await database.user.delete({ where: { id: session.userId } });

      return await session.end({ redirectTo: "/" });
    }
    default: {
      throw new Error("unexpected form intent");
    }
  }
}

enum Intent {
  ChangeEmail = "change-email",
  ChangeName = "change-name",
  ChangePassword = "change-password",
  ConfirmDelete = "confirm-delete",
  Delete = "delete",
  NewPassword = "new-password",
}

enum Status {
  ConfirmDelete = "confirm-delete",
  InvalidEmail = "invalid-email",
  InvalidName = "invalid-name",
  InvalidPassword = "invalid-password",
}
