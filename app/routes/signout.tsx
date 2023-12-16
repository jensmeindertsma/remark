import { redirect } from "@remix-run/node";
import { ActionArguments, LoaderArguments } from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/remarks");
  } else {
    return redirect("/signin");
  }
}

export async function action({ request }: ActionArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  } else {
    return session.end({ redirectTo: "/" });
  }
}
