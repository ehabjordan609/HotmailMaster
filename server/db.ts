import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Create postgres connection
const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString, { max: 1 });

// Create database instance with all schema
export const db = drizzle(client, { schema });