// eslint-disable-next-line import/no-unresolved
import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/durable-objects-sqlite";
import { schema, messagesTable } from "~/schema";
import { type DrizzleDatabaseWithSchema } from "~/schema";
import migrations from "../migrations/migrations.json";
import { sql } from "drizzle-orm";

function runMigrations(db: DrizzleDatabaseWithSchema) {
  const migrationsTable = "__drizzle_migrations";

  const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
  db.run(migrationTableCreate);

  const dbMigrations = db.values<[number, string, string]>(
    sql`SELECT id, hash, created_at FROM ${sql.identifier(
      migrationsTable
    )} ORDER BY created_at DESC LIMIT 1`
  );

  const lastDbMigration = dbMigrations[0] ?? undefined;

  try {
    for (const migration of migrations) {
      if (
        !lastDbMigration ||
        Number(lastDbMigration[2])! < migration.folderMillis
      ) {
        for (const stmt of migration.sql) {
          db.run(sql.raw(stmt));
        }
        db.run(
          sql`INSERT INTO ${sql.identifier(
            migrationsTable
          )} ("hash", "created_at") VALUES(${migration.hash}, ${
            migration.folderMillis
          })`
        );
      }
    }
  } catch (e) {
    console.error("Error running migrations", e);
    throw e;
  }
}

export class DrizzleTestDO extends DurableObject {
  drizzle: DrizzleDatabaseWithSchema;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.drizzle = drizzle(ctx.storage.sql, { schema });

    runMigrations(this.drizzle);
  }

  async getMessages() {
    return this.drizzle.select().from(messagesTable).all();
  }

  async postMessage(user: string, message: string) {
    this.drizzle
      .insert(messagesTable)
      .values({
        user,
        message,
      })
      .run();
  }
}
