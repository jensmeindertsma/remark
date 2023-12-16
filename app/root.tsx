import { database } from "./utilities/database.server.ts";
import { LoaderArguments } from "./utilities/remix.ts";
import { getSession } from "./utilities/session.server.ts";
import { json } from "@remix-run/node";
import {
  Form,
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
import { ReactNode } from "react";

import styles from "./styles/root.css";

const ENABLE_SCRIPTS = true;

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "icon", type: "image/png", href: "/crayon.png" },
  ];
}

export default function Root() {
  const { isAuthenticated, name } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSigningOut = navigation.formAction === "/signout";

  return (
    <Document>
      {isAuthenticated ? (
        <header>
          <p>Welcome to Remark, you are signed in as {name}</p>
          <nav>
            <ul>
              <li>
                <Link to="/remarks">Remarks</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            </ul>
          </nav>
          <Form method="POST" action="/signout">
            <button type="submit" disabled={isSigningOut}>
              {isSigningOut ? "Signing you out..." : "Sign out"}
            </button>
          </Form>
        </header>
      ) : (
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Remark</Link>
              </li>
              <li>
                <Link to="/signup">Sign up</Link>
              </li>
              <li>
                <Link to="/signin">Sign in</Link>
              </li>
            </ul>
          </nav>
        </header>
      )}
      <Outlet />
    </Document>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  return json({
    isAuthenticated: session.isActive,
    name: session.isActive
      ? (await database.user.findUnique({ where: { id: session.userId } }))
          ?.name
      : undefined,
  });
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  return (
    <Document>
      <h1>Oh shit!</h1>
      <p>Every measure we took against application failure has failed us!</p>
      <p>
        This is certainly unexpected, please try reloading the page and reach
        out if that does not help!
      </p>
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
      <body>
        {children}
        <ScrollRestoration />

        {ENABLE_SCRIPTS ? <Scripts /> : null}

        <LiveReload />
      </body>
    </html>
  );
}
