import { json } from "@remix-run/node";

export function badRequest<T>(data: T, init?: Omit<ResponseInit, "status">) {
  return json(data, { ...init, status: 400 });
}

export function notFound<T>(data: T, init?: Omit<ResponseInit, "status">) {
  return json(data, { ...init, status: 404 });
}
