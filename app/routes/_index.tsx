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
      <p className="w-4/5 sm:w-2/3 md:w-3/5 mx-auto text-xl">
        Reading digital material was never{" "}
        <span className="underline decoration-amber-400">this easy</span>!
      </p>
      <p className="w-4/5 sm:w-2/3 md:w-3/5 mx-auto text-xl mt-10">
        Remark is your{" "}
        <span className="underline decoration-amber-400">all-in-one</span>{" "}
        bookmark for online content.
      </p>
      <p className="w-4/5 sm:w-2/3 md:w-3/5 mx-auto text-xl mt-10">
        Remark is your{" "}
        <span className="underline decoration-amber-400">all-in-one</span>{" "}
        bookmark for online content.
      </p>
    </>
  );
}

export async function loader({ request }: LoaderArguments) {
  await redirectUser(request, "/remarks");
  return null;
}
