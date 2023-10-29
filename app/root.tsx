import { ApplicationLayout } from "./layouts/application.tsx";
import { FrontLayout } from "./layouts/front.tsx";
import { LoaderArguments } from "./utils/remix.ts";
import { getSession } from "./utils/session.server.ts";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import styles from "./styles/root.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/png" href="/crayon.png" />
      </head>
      <body>
        {isAuthenticated ? (
          <ApplicationLayout>
            <Outlet />
          </ApplicationLayout>
        ) : (
          <FrontLayout>
            <Outlet />
          </FrontLayout>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export async function loader({ request }: LoaderArguments) {
  const { isAuthenticated } = await getSession(request);

  return json({
    isAuthenticated,
  });
}
