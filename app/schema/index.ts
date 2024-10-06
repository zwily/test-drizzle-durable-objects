import * as schema from "./schema";
import { type DurableObjectSQLiteDatabase } from "drizzle-orm/durable-objects-sqlite";

export type DrizzleDatabaseWithSchema = DurableObjectSQLiteDatabase<
  typeof schema
>;
export { schema };
export * from "./schema";
