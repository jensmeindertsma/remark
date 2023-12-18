import { Header } from "./components/Header.tsx";
import type { LoaderArguments } from "./utilities/remix.ts";
import { getSession } from "./utilities/session.server.ts";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";

import fonts from "./styles/fonts.css";
import tailwind from "./styles/tailwind.css";

const ENABLE_SCRIPTS = true;

export function links() {
  return [
    { rel: "icon", type: "image/png", href: "/icons/favicon.png" },
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: fonts },
  ];
}

export default function Root() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <Document>
      <Header isAuthenticated={isAuthenticated} />

      <main>
        <Outlet />
      </main>
    </Document>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  return json({
    isAuthenticated: session.isActive,
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
      <body className="text-neutral-800 dark:bg-neutral-800 dark:text-white p-3 sm:p-6">
        {children}
        <ScrollRestoration />

        <LiveReload />
        {ENABLE_SCRIPTS ? <Scripts /> : null}
      </body>
    </html>
  );
}
