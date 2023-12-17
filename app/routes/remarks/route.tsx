import { Intent, Status } from "./constants.ts";
import { createRemark, deleteRemark, getRemarks } from "./queries.ts";
import { Remark } from "./remark.tsx";
import { validate } from "./validate.ts";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Field } from "~/components/Field.tsx";
import { redirectGuest } from "~/utilities/auth.server.ts";
import { getFields } from "~/utilities/form.ts";
import type {
  ActionArguments,
  LoaderArguments,
  MetaResult,
} from "~/utilities/remix.ts";
import { badRequest } from "~/utilities/response.server.ts";
import { useEffect, useRef } from "react";

export function meta(): MetaResult {
  return [
    {
      title: "Remark",
    },
  ];
}

export default function Remarks() {
  const remarks = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const feedback = fetcher.data;
  const isSubmitting = fetcher.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <>
      <h1>Remarks</h1>
      <fetcher.Form method="POST" ref={formRef}>
        <fieldset disabled={isSubmitting}>
          <input type="hidden" name="intent" value={Intent.Create} />
          <h2>Create a new remark</h2>

          <Field
            label="title"
            name="title"
            type="text"
            defaultValue={
              feedback?.status === Status.CreationFeedback
                ? feedback.values.title
                : undefined
            }
            error={
              feedback?.status === Status.CreationFeedback
                ? feedback.errors.title
                : undefined
            }
            placeholder="Walden"
          />

          <Field
            label="progress"
            name="progress"
            type="text"
            defaultValue={
              feedback?.status === Status.CreationFeedback
                ? feedback.values.progress
                : undefined
            }
            error={
              feedback?.status === Status.CreationFeedback
                ? feedback.errors.progress
                : undefined
            }
            placeholder="Page 78"
          />

          <button type="submit">
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </fieldset>
      </fetcher.Form>

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

export async function loader({ request }: LoaderArguments) {
  const session = await redirectGuest(request, "/signin");
  const remarks = await getRemarks(session.userId);
  return json(remarks);
}

export async function action({ request }: ActionArguments) {
  const session = await redirectGuest(request, "/signin");

  const formData = await request.formData();
  const [intent] = getFields(formData, ["intent"]);

  switch (intent as Intent) {
    case Intent.Cancel: {
      return json(null);
    }
    case Intent.Create: {
      const [title, progress] = getFields(formData, ["title", "progress"]);

      const errors = validate({ title, progress });

      if (errors) {
        return badRequest({
          status: Status.CreationFeedback as const,
          values: { title, progress },
          errors,
        });
      }

      await createRemark({ accountId: session.userId, title, progress });

      return json(null);
    }
    case Intent.Edit: {
      throw new Error("TODO");

      // return json({
      //   status: Status.Editing as const,
      // });
    }
    case Intent.Save: {
      throw new Error("TODO");

      // return json(null);
    }
    case Intent.Delete: {
      return json({ status: Status.ConfirmDelete as const });
    }
    case Intent.ConfirmDelete: {
      const [id] = getFields(formData, ["id"]);

      if (!id) {
        // TODO: fallback to error boundary
        throw new Error("Missing remark id");
      }

      await deleteRemark(id);
    }
  }

  return json(null);
}
