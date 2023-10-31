import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { MetaResult } from "~/utilities/remix.ts";

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
  return json(null, { status: 404 });
}
