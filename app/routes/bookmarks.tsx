import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { database } from "~/utilities/database.server.ts";
import { formatTitle } from "~/utilities/meta.ts";
import { LoaderArguments, MetaResult } from "~/utilities/remix.ts";
import { getSession } from "~/utilities/session.server.ts";

export function meta(): MetaResult {
  return [
    {
      title: formatTitle("Bookmarks"),
    },
  ];
}

export default function Bookmarks() {
  const { bookmarks } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Bookmarks</h1>
      {bookmarks.length > 0 ? (
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <h2>{bookmark.title}</h2>
              <h3>Progress</h3>
              <p>{bookmark.progress}</p>
              <h3>Notes</h3>
              <ul>
                {bookmark.notes.map((note) => (
                  <li key={note.id}>
                    <h4>{note.title}</h4>
                    <p>{note.description}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>You do not have any bookmarks right now!</p>
      )}
      <Form method="POST" action="/signout">
        <button type="submit">Sign out</button>
      </Form>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request);

  if (!session.isActive) {
    return redirect("/signin");
  }

  return json({
    bookmarks: await database.bookmark.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        notes: true,
      },
    }),
  });
}
