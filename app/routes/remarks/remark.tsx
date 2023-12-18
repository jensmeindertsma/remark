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
        <fetcher.Form method="POST" className="h-full flex flex-col">
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
            className="mb-1"
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
            className="mb-auto"
          />

          <div className="mt-auto">
            <button
              type="submit"
              name="intent"
              value={Intent.Save}
              className=" border-2 border-amber-400 rounded p-1 px-2 mr-2  active:bg-amber-400"
            >
              Save
            </button>

            <button
              type="submit"
              name="intent"
              value={Intent.Cancel}
              className=" border-2 border-red-500 rounded p-1 px-2 mr-2  active:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </fetcher.Form>
      ) : (
        <>
          <h2 className="text-xl">{title}</h2>
          <p>
            Progress: <b>{progress}</b>
          </p>
          <fetcher.Form method="POST" className="mt-auto">
            <input type="hidden" name="id" value={id} />

            <button
              type="submit"
              name="intent"
              value={Intent.Edit}
              className=" border-2 border-amber-400 rounded p-1 px-2 mr-2 active:bg-amber-400"
            >
              Edit
            </button>

            <button
              type="submit"
              name="intent"
              value={Intent.Delete}
              disabled={
                isSubmitting || feedback?.status === Status.ConfirmDelete
              }
              className=" border-2 border-red-500 rounded p-1 px-2 mr-2 active:bg-red-500 disabled:border-gray-400 disabled:active:bg-gray-400"
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
                  className=" border-2 border-red-500 bg-red-500 rounded p-1 px-2 mr-2"
                >
                  Confirm
                </button>
                <button
                  type="submit"
                  name="intent"
                  value={Intent.Cancel}
                  disabled={isSubmitting}
                  className=" border-2 border-red-500 rounded p-1 px-2 mr-2 active:bg-red-500"
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
