import { getSession } from "./session.server.ts";
import { redirect } from "@remix-run/node";

export async function redirectGuest(request: Request, redirectTo: string) {
  const session = await getSession(request);

  if (!session.isActive) {
    throw redirect(redirectTo);
  } else {
    return session;
  }
}

export async function redirectUser(request: Request, redirectTo: string) {
  const session = await getSession(request);

  if (session.isActive) {
    throw redirect(redirectTo);
  } else {
    return session;
  }
}
