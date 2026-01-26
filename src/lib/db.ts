import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return drizzle(neon(url), { schema });
}

// For backwards compatibility - creates new connection each call
export const db = {
  get query() {
    return getDb().query;
  },
  insert: (...args: Parameters<ReturnType<typeof getDb>["insert"]>) => getDb().insert(...args),
  update: (...args: Parameters<ReturnType<typeof getDb>["update"]>) => getDb().update(...args),
  delete: (...args: Parameters<ReturnType<typeof getDb>["delete"]>) => getDb().delete(...args),
  select: (...args: Parameters<ReturnType<typeof getDb>["select"]>) => getDb().select(...args),
};
