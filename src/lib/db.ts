import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Create a mock SQL function for build time when DATABASE_URL is not set
const sql = databaseUrl ? neon(databaseUrl) : (() => { throw new Error("DATABASE_URL is not set"); }) as unknown as ReturnType<typeof neon>;

export const db = drizzle(sql, { schema });
