import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create db connection on demand (for serverless)
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return drizzle(neon(url), { schema });
}

// Singleton for the current request
let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop: string | symbol) {
    if (!_db) {
      _db = getDb();
    }
    const value = _db[prop as keyof typeof _db];
    if (typeof value === "function") {
      return value.bind(_db);
    }
    return value;
  },
});
