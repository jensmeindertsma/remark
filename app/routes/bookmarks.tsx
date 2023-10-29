import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { database } from "~/utils/database.server.ts";
import { LoaderArguments } from "~/utils/remix.ts";
import { requireAuthenticatedSession } from "~/utils/session.server.ts";

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
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  const session = await requireAuthenticatedSession(request);

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
