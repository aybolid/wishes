import { drizzle } from "drizzle-orm/better-sqlite3";
import sqlite from "better-sqlite3";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = sqlite(env.DATABASE_URL);

export const db = drizzle(client, { schema });
