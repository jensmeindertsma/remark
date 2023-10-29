import { PrismaClient } from "@prisma/client";

let database: PrismaClient;
declare global {
  var __database: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  database = new PrismaClient();
  await database.$connect();
} else {
  if (!global.__database) {
    global.__database = new PrismaClient();
    await global.__database.$connect();
  }
  database = global.__database;
}

export { database };
