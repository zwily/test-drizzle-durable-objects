// eslint-disable-next-line import/no-unresolved
import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/durable-objects-sqlite";
import { schema, messagesTable } from "~/schema";
import { type DrizzleDatabaseWithSchema } from "~/schema";

export class DrizzleTestDO extends DurableObject {
  drizzle: DrizzleDatabaseWithSchema;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.drizzle = drizzle(ctx.storage.sql, { schema });

    ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS messages(
      id INTEGER PRIMARY KEY,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
      user TEXT,
      message TEXT
    );`);
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
