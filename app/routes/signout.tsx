import { redirectGuest, redirectUser } from "~/utilities/auth.server.ts";
import type { ActionArguments, LoaderArguments } from "~/utilities/remix.ts";

export async function loader({ request }: LoaderArguments) {
  await redirectGuest(request, "/signin");
  await redirectUser(request, "/remarks");
}

export async function action({ request }: ActionArguments) {
  const session = await redirectGuest(request, "/signin");

  await session.end({ redirectTo: "/" });
}
