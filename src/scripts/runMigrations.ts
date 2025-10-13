import { pool } from '../db';
import { runMigrations } from '../db/migrations';

async function main() {
  try {
    await runMigrations(pool);
    console.log('✅ Migrations exécutées (runner).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors des migrations (runner):', err);
    process.exit(1);
  }
}

main();
