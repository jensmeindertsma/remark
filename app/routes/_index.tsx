import { useLoaderData } from "@remix-run/react";
import { database } from "~/utils/database.server.ts";

export default function Home() {
  const { userCount } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Heylo!!</h1>
      <p>Currently there are {userCount} users registered.</p>
    </>
  );
}

export async function loader() {
  const userCount = await database.user.count();

  return {
    userCount,
  };
}
