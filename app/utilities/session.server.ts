import { getRequiredEnvironmentVariable } from "./environment.server.ts";
import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";

const cookie = createCookie("remark", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [getRequiredEnvironmentVariable("SESSION_SECRET")],
  secure: process.env.NODE_ENV === "production",
});

const sessionStorage = createCookieSessionStorage({
  cookie,
});

type InactiveSession = {
  isActive: false;
  activate(option: { id: string; redirectTo: string }): Promise<never>;
};

type ActiveSession = {
  isActive: true;
  userId: string;
  end(options: { redirectTo: string }): Promise<never>;
};

type Session = InactiveSession | ActiveSession;

export async function getSession(request: Request): Promise<Session> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  const userId = session.get("id") as string | undefined;

  if (userId) {
    return {
      isActive: true,
      userId,
      async end({ redirectTo }) {
        throw redirect(redirectTo, {
          headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
          },
        });
      },
    };
  } else {
    return {
      isActive: false,
      async activate({ id, redirectTo }) {
        session.set("id", id);
        throw redirect(redirectTo, {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        });
      },
    };
  }
}
