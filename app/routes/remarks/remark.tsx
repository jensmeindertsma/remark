import { Intent, Status } from "./constants.ts";
import type { action } from "./route.tsx";
import { useFetcher } from "@remix-run/react";
import { Field } from "~/components/Field.tsx";

type Props = {
  id: string;
  title: string;
  progress: string;
};

export function Remark({ id, title, progress }: Props) {
  const fetcher = useFetcher<typeof action>();
  const feedback = fetcher.data;
  const isSubmitting = fetcher.state !== "idle";

  return (
    <>
      {feedback?.status === Status.Editing ||
      feedback?.status === Status.Feedback ? (
        <fetcher.Form method="POST">
          <input type="hidden" name="id" value={id} />

          <Field
            name="title"
            type="text"
            label="Title"
            required
            defaultValue={
              feedback?.status === Status.Feedback
                ? feedback?.values.title
                : title
            }
            error={
              feedback?.status === Status.Feedback
                ? feedback?.errors.title
                : undefined
            }
          />

          <Field
            name="progress"
            type="text"
            label="Progress"
            required
            defaultValue={
              feedback?.status === Status.Feedback
                ? feedback?.values.progress
                : progress
            }
            error={
              feedback?.status === Status.Feedback
                ? feedback?.errors.progress
                : undefined
            }
          />

          <button type="submit" name="intent" value={Intent.Save}>
            Save
          </button>

          <button type="submit" name="intent" value={Intent.Cancel}>
            Cancel
          </button>
        </fetcher.Form>
      ) : (
        <>
          <h2>{title}</h2>
          <p>
            Progress: <b>{progress}</b>
          </p>
          <fetcher.Form method="POST">
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
          </fetcher.Form>
        </>
      )}
    </>
  );
}
