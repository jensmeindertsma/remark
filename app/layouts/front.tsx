import { Link } from "@remix-run/react";
import { ReactNode } from "react";

export function FrontLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <header>
        <Link to="/">
          <span>Remark 🖍️</span>
        </Link>
        <nav>
          <ul>
            <li>
              <Link to="/signin">Sign in</Link>
            </li>
            <li>
              <Link to="/signup">Sign up</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>Made with ❤️ by Jens</footer>
    </>
  );
}
