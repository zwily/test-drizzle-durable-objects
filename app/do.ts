// eslint-disable-next-line import/no-unresolved
import { DurableObject } from "cloudflare:workers";
import { drizzle, migrate } from "drizzle-orm/durable-objects-sqlite";
import { schema, messagesTable } from "~/schema";
import { type DrizzleDatabaseWithSchema } from "~/schema";
import migrations from "../migrations/migrations.json";

export class DrizzleTestDO extends DurableObject {
  drizzle: DrizzleDatabaseWithSchema;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.drizzle = drizzle(ctx.storage, { schema });

    migrate(this.drizzle, migrations);
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
