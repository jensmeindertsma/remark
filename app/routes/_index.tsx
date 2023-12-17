import { redirectUser } from "~/utilities/auth.server.ts";
import type { LoaderArguments, MetaResult } from "~/utilities/remix.ts";

export function meta(): MetaResult {
  return [
    {
      title: "Remark",
    },
  ];
}

export default function Home() {
  return (
    <>
      <p>Reading digital material was never this easy!</p>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  await redirectUser(request, "/remarks");
  return null;
}
