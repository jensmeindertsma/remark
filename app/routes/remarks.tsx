import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { database } from "~/utilities/database.server.ts";
import { formatFeedback } from "~/utilities/feedback.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";
import { useEffect, useRef } from "react";
import { z } from "zod";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle(null),
    },
  ];
}

export default function Remarks() {
  const { remarks } = useLoaderData<typeof loader>();

  const createFetcher = useFetcher<typeof action>();
  const feedback = createFetcher.data;
  const isCreating = createFetcher.state !== "idle";
  const createFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isCreating) {
      createFormRef.current?.reset();
    }
  }, [isCreating]);

  return (
    <>
      <h1>Remarks</h1>
      <createFetcher.Form method="POST" ref={createFormRef}>
        <fieldset disabled={isCreating}>
          <input type="hidden" name="intent" value={Intent.Create} />
          <h2>Create a new remark</h2>

          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            aria-invalid={Boolean(
              feedback?.status === Status.CreateFailure && feedback?.title.error
            )}
            aria-describedby="title-feedback"
            defaultValue={
              feedback?.status === Status.CreateFailure
                ? feedback?.title.value
                : undefined
            }
          />
          <div style={{ color: "red" }} id="title-feedback">
            {feedback?.status === Status.CreateFailure
              ? feedback?.title.value
              : null}
          </div>

          <label htmlFor="progress">Current progress</label>
          <input
            type="text"
            id="progress"
            name="progress"
            required
            placeholder="Chapter 4.8 (page 78)"
            aria-invalid={Boolean(
              feedback?.status === Status.CreateFailure &&
                feedback?.progress.error
            )}
            aria-describedby="progress-feedback"
            defaultValue={
              feedback?.status === Status.CreateFailure
                ? feedback?.progress.value
                : undefined
            }
          />
          <div style={{ color: "red" }} id="progress-feedback">
            {feedback?.status === Status.CreateFailure
              ? feedback?.progress.value
              : null}
          </div>

          <button type="submit">{isCreating ? "Creating..." : "Create"}</button>
        </fieldset>
      </createFetcher.Form>
      {remarks.length > 0 ? (
        <ul>
          {remarks.map((remark) => (
            <li key={remark.id}>
              <Remark {...remark} />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p>You do not have any remarks right now!</p>
        </>
      )}
    </>
  );
}

type RemarkData = {
  id: string;
  title: string;
  progress: string;
};

function Remark({ id, title, progress }: RemarkData) {
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const feedback = fetcher.data;
  const status = feedback?.status;

  return (
    <>
      {feedback?.status === Status.Editing ||
      feedback?.status === Status.EditFailure ? (
        <>
          <fetcher.Form method="POST">
            <fieldset disabled={isSubmitting}>
              <input type="hidden" name="intent" value={Intent.Save} />
              <input type="hidden" name="id" value={id} />

              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                aria-invalid={Boolean(
                  feedback.status === Status.EditFailure &&
                    feedback?.title.error
                )}
                aria-describedby="title-feedback"
                defaultValue={
                  status === Status.EditFailure ? feedback.title.value : title
                }
              />
              <div style={{ color: "red" }} id="title-feedback">
                {status === Status.EditFailure ? feedback?.title.error : null}
              </div>

              <label htmlFor="progress">Current progress</label>
              <input
                type="text"
                id="progress"
                name="progress"
                required
                placeholder="Chapter 4.8 (page 78)"
                aria-invalid={Boolean(
                  feedback.status === Status.EditFailure &&
                    feedback?.progress.error
                )}
                aria-describedby="progress-feedback"
                defaultValue={
                  status === Status.EditFailure
                    ? feedback.progress.value
                    : progress
                }
              />
              <div style={{ color: "red" }} id="progress-feedback">
                {status === Status.EditFailure
                  ? feedback?.progress.error
                  : null}
              </div>

              <button type="submit">
                {isSubmitting ? "Saving..." : "Save"}
              </button>

              <button type="submit" name="intent" value={Intent.Cancel}>
                Cancel
              </button>
            </fieldset>
          </fetcher.Form>
        </>
      ) : (
        <>
          <h2>{title}</h2>
          <p>
            Current progress: <b>{progress}</b>
          </p>
          <fetcher.Form method="POST">
            <fieldset disabled={isSubmitting}>
              <input type="hidden" name="id" value={id} />

              <button type="submit" name="intent" value={Intent.Edit}>
                Edit
              </button>
              <button
                type="submit"
                name="intent"
                value={Intent.Delete}
                disabled={
                  isSubmitting || feedback?.status === Status.ConfirmDelete
                }
              >
                Delete
              </button>
              {feedback?.status === Status.ConfirmDelete ? (
                <>
                  <button
                    type="submit"
                    name="intent"
                    value={Intent.ConfirmDelete}
                  >
                    Confirm delete
                  </button>
                  <button type="submit" name="intent" value={Intent.Cancel}>
                    Cancel
                  </button>
                </>
              ) : null}
            </fieldset>
          </fetcher.Form>
        </>
      )}
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  return json({
    remarks: await database.remark.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        notes: true,
      },
      orderBy: {
        edited: "desc",
      },
    }),
  });
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const intent = z.nativeEnum(Intent).parse(formData.get("intent"));

  switch (intent) {
    case Intent.Cancel: {
      return json(null);
    }
    case Intent.Create: {
      const data = {
        title: String(formData.get("title")),
        progress: String(formData.get("progress")),
      };

      const result = z
        .object({
          title: z.string().min(3, "too short!"),
          progress: z.string(),
        })
        .safeParse(data);

      if (!result.success) {
        return json(
          {
            status: Status.CreateFailure as const,
            ...formatFeedback(data, result.error),
          },
          400
        );
      }

      const { title, progress } = result.data;

      await database.remark.create({
        data: {
          title,
          progress,
          userId: session.userId,
        },
      });

      return json(null);
    }
    case Intent.Edit: {
      const { title, progress } = Object.fromEntries(formData);

      return json({
        status: Status.Editing as const,
        title: { value: title, error: null },
        progress: { value: progress, error: null },
      });
    }
    case Intent.Save: {
      const data = {
        id: formData.get("id"),
        title: String(formData.get("title")),
        progress: String(formData.get("progress")),
      };

      const result = z
        .object({
          id: z.string(),
          title: z.string().min(3, "too short!"),
          progress: z.string(),
        })
        .safeParse(data);

      if (!result.success) {
        return json(
          {
            status: Status.EditFailure as const,
            ...formatFeedback(data, result.error),
          },
          400
        );
      }

      const { id, title, progress } = result.data;

      await database.remark.update({
        where: { id },
        data: {
          title,
          progress,
          userId: session.userId,
        },
      });

      return json(null);
    }
    case Intent.Delete: {
      return json({ status: Status.ConfirmDelete as const });
    }
    case Intent.ConfirmDelete: {
      const id = formData.get("id");

      if (!id || typeof id !== "string") {
        throw new Error("Missing remark id");
      }

      await database.remark.delete({ where: { id } });
    }
  }

  return json(null);
}

enum Intent {
  Cancel = "cancel",
  Create = "create",
  Delete = "delete",
  ConfirmDelete = "confirm-delete",
  Edit = "edit",
  Save = "save ",
}

enum Status {
  CreateFailure = "create-failure",
  ConfirmDelete = "confirm-delete",
  Editing = "editing",
  EditFailure = "edit-failure",
}
