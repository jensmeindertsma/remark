import { Intent, Status } from "./constants.ts";
import type { action } from "./route.tsx";
import { useFetcher } from "@remix-run/react";

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
      <h2>{title}</h2>
      <p>
        Progress: <b>{progress}</b>
      </p>
      <fetcher.Form method="POST">
        <input type="hidden" name="id" value={id} />

        <button
          type="submit"
          name="intent"
          value={Intent.Delete}
          disabled={isSubmitting || feedback?.status === Status.ConfirmDelete}
        >
          Delete remark
        </button>

        {feedback?.status === Status.ConfirmDelete ? (
          <>
            <button
              type="submit"
              name="intent"
              value={Intent.ConfirmDelete}
              disabled={isSubmitting}
            >
              Confirm delete
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
  );
}
