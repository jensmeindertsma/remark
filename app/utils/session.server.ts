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

type Session =
  | {
      isAuthenticated: true;
      userId: string;
      /**
       * Returns a redirect that ends the session
       * */
      end(): Promise<Response>;
    }
  | { isAuthenticated: false; authenticate(id: string): Promise<string> };

export async function getSession(request: Request): Promise<Session> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const userId = session.get("id") as string | undefined;

  if (userId) {
    return {
      isAuthenticated: true,
      userId,
      async end() {
        return redirect("/signin", {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        });
      },
    };
  } else {
    return {
      isAuthenticated: false,
      async authenticate(id: string) {
        session.set("id", id);
        return await sessionStorage.commitSession(session);
      },
    };
  }
}

export async function requireAuthenticatedSession(request: Request) {
  const session = await getSession(request);

  if (!session.isAuthenticated) {
    throw redirect("/signin");
  } else {
    return session;
  }
}
