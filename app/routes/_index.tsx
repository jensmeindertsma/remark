import { redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { database } from "~/utilities/database.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import { LoaderArguments, MetaResult } from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Home"),
    },
  ];
}

export default function Home() {
  const { userCount } = useLoaderData<typeof loader>();

  return (
    <>
      <p>Reading digital material was never this easy!</p>
      <p>Currently there are {userCount} users registered.</p>
      <p>
        <Link to="/signup">Sign up now</Link>
      </p>
      <p>
        <Link to="signin">sign in to your existing account</Link>
      </p>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (session.isActive) {
    return redirect("/bookmarks");
  }

  const userCount = await database.user.count();

  return {
    userCount,
  };
}
