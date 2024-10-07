import { readMigrationFiles } from "drizzle-orm/migrator";
import fs from "node:fs";

const migrations = readMigrationFiles({
  migrationsFolder: "./migrations",
});

fs.writeFileSync(
  "./migrations/migrations.json",
  JSON.stringify(migrations, null, 2)
);
