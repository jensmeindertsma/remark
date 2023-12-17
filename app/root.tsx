import { prisma } from "./utilities/database.server.ts";
import type { LoaderArguments } from "./utilities/remix.ts";
import { getSession } from "./utilities/session.server.ts";
import { json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";

import tailwind from "./tailwind.css";

const ENABLE_SCRIPTS = true;

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
    { rel: "icon", type: "image/png", href: "/crayon.png" },
  ];
}

export default function Root() {
  const { isAuthenticated, name } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <Document>
      <header className="dark:bg-slate-500 flex flex-row justify-between">
        <nav>
          <ul className="flex flex-row justify-between">
            <li>
              <Link to={isAuthenticated ? "/remarks" : "/"}>Remark</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/remarks">Remarks</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/signup">Sign up</Link>
                </li>
                <li>
                  <Link to="/signin">Sign in</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {isAuthenticated ? <div>Welcome, {name}</div> : null}

        {isAuthenticated ? (
          <Form method="POST" action="/signout">
            <button
              type="submit"
              disabled={navigation.formAction === "/signout"}
            >
              {navigation.formAction === "/signout" ? "Working..." : "Sign out"}
            </button>
          </Form>
        ) : null}
      </header>

      <Outlet />
    </Document>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  return json({
    isAuthenticated: session.isActive,
    name: session.isActive
      ? (await prisma.account.findUnique({ where: { id: session.userId } }))
          ?.name
      : undefined,
  });
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    return (
      <Document>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <pre>
          <code>{error.data}</code>
        </pre>
      </Document>
    );
  } else if (error instanceof Error) {
    return (
      <Document>
        <h1>Error!</h1>
        <pre>
          <code>{error.message}</code>
        </pre>
      </Document>
    );
  }

  return (
    <Document>
      <h1>Error!</h1>
      <pre>
        <code>An unknown error occured!</code>
      </pre>
    </Document>
  );
}

function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900 dark:text-white">
        {children}
        <ScrollRestoration />

        <LiveReload />
        {ENABLE_SCRIPTS ? <Scripts /> : null}
      </body>
    </html>
  );
}
