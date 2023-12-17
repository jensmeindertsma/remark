import { Link } from "@remix-run/react";
import type { MetaResult } from "~/utilities/remix.ts";
import { notFound } from "~/utilities/response.server.ts";

export function meta(): MetaResult {
  return [
    {
      title: "Page not found!",
    },
  ];
}

export default function NotFound() {
  return (
    <>
      <h1>404 Not Found</h1>
      <Link to="/">Go back home</Link>
    </>
  );
}

export function loader() {
  return notFound(null);
}
