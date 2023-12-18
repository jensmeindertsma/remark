import { Form, Link, useNavigation } from "@remix-run/react";
import { Exit } from "~/icons/Exit.tsx";

type Props = {
  isAuthenticated: boolean;
};

export function Header({ isAuthenticated }: Props) {
  const navigation = useNavigation();

  return (
    <header className="flex flex-row mb-20 h-12 w-full text-xl">
      <nav className="w-full">
        <ul className="flex flex-row  leading-7 h-full w-full">
          <li className="flex mr-auto">
            <Link
              to="/"
              className="grid items-center text-3xl text-black bg-amber-400 px-2"
            >
              Remark
            </Link>
          </li>

          {(isAuthenticated
            ? [
                ["/remarks", "Overview"],
                ["/settings", "Settings"],
              ]
            : [
                ["/signup", "Sign up"],
                ["/signin", "Sign in"],
              ]
          ).map(([url, label]) => {
            return (
              <li key={url} className="flex h-full ">
                <Link
                  to={url}
                  className="flex items-center px-2 sm:px-4 underline decoration-amber-400"
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isAuthenticated ? (
        <Form method="POST" action="/signout" className="h-full ml-2">
          <button
            type="submit"
            disabled={navigation.formAction === "/signout"}
            className="hidden sm:block w-24 h-full px-2 underline decoration-amber-400"
          >
            {navigation.formAction === "/signout" ? "Working..." : "Sign out"}
          </button>
          <button
            type="submit"
            disabled={navigation.formAction === "/signout"}
            className="sm:hidden h-full aspect-square m-auto mr-0 bg-amber-400"
            aria-label="Sign out"
          >
            <Exit className="m-auto w-5" />
          </button>
        </Form>
      ) : null}
    </header>
  );
}
