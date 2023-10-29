import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { MetaResult } from "~/utils/remix.ts";

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

export function meta(): MetaResult {
  return [
    {
      title: "Page Not Found",
    },
  ];
}
