import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";

export type ActionArguments = Parameters<ActionFunction>[0];
export type LinksResult = ReturnType<LinksFunction>;
export type LoaderArguments = Parameters<LoaderFunction>[0];
export type MetaResult = ReturnType<MetaFunction>;
