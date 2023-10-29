import { redirect } from "@remix-run/node";
import { ActionArguments, LoaderArguments } from "~/utils/remix.ts";
import {
  getSession,
  requireAuthenticatedSession,
} from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isAuthenticated) {
    return redirect("/bookmarks");
  } else {
    return redirect("/signin");
  }
}

export async function action({ request }: ActionArguments) {
  const session = await requireAuthenticatedSession(request);

  return session.end();
}
