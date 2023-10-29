import { Form, Link } from "@remix-run/react";
import { ReactNode } from "react";

export function ApplicationLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <header>
        <span>Remark 🖍️</span>
        <nav>
          <ul>
            <li>
              <Link to="/bookmarks">Bookmarks</Link>
            </li>
          </ul>
        </nav>
        <Form method="POST" action="/signout">
          <button type="submit">Sign out</button>
        </Form>
      </header>
      <main>{children}</main>
      <footer>Made with ❤️ by Jens</footer>
    </>
  );
}
