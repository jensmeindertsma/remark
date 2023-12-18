import { Intent, Status } from "./constants.ts";
import {
  createRemark,
  deleteRemark,
  getRemarks,
  updateRemark,
} from "./queries.ts";
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
      <h1 className="text-3xl w-80 mx-auto md:mt-40 md:w-96 mb-10">Remarks</h1>
      <fetcher.Form
        method="POST"
        ref={formRef}
        className="mx-auto mt-4 w-80 md:w-96 mb-16"
      >
        <fieldset disabled={isSubmitting}>
          <input type="hidden" name="intent" value={Intent.Create} />
          <h2 className="text-xl mb-3">Create a new remark</h2>

          <Field
            label="Title"
            name="title"
            type="text"
            defaultValue={
              feedback?.status === Status.Feedback
                ? feedback.values.title
                : undefined
            }
            error={
              feedback?.status === Status.Feedback
                ? feedback.errors.title
                : undefined
            }
            placeholder="Walden"
            className="mb-1"
          />

          <Field
            label="Progress"
            name="progress"
            type="text"
            defaultValue={
              feedback?.status === Status.Feedback
                ? feedback.values.progress
                : undefined
            }
            error={
              feedback?.status === Status.Feedback
                ? feedback.errors.progress
                : undefined
            }
            placeholder="Page 78"
            className="mb-4"
          />

          <button
            type="submit"
            className="block border-2 border-amber-400 rounded p-1 w-full active:bg-amber-400"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </fieldset>
      </fetcher.Form>
      <ul className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 mx-auto w-80 md:w-96 lg:w-full">
        {remarks.length ? (
          remarks.map((remark) => (
            <li
              key={remark.id}
              className="mb-8 h-48 lg:m-0 border-4 p-3 rounded border-amber-400 border-dashed flex flex-col"
            >
              <Remark {...remark} />
            </li>
          ))
        ) : (
          <>
            <p>You do not have any remarks right now!</p>
          </>
        )}
      </ul>
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
          status: Status.Feedback as const,
          values: { title, progress },
          errors,
        });
      }

      await createRemark({ accountId: session.userId, title, progress });

      return json(null);
    }
    case Intent.Edit: {
      return json({
        status: Status.Editing as const,
      });
    }
    case Intent.Save: {
      const [id, title, progress] = getFields(formData, [
        "id",
        "title",
        "progress",
      ]);

      if (!id) {
        // TODO: fallback to error boundary
        throw new Error("Missing remark id");
      }

      const errors = validate({ title, progress });

      if (errors) {
        return badRequest({
          status: Status.Feedback as const,
          values: { title, progress },
          errors,
        });
      }

      await updateRemark({ id, title, progress });

      return json(null);
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
