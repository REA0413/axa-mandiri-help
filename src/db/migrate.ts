import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('⏳ Running migrations...');
  
  await migrate(db, {
    migrationsFolder: './supabase/migrations'
  });

  console.log('✅ Migrations completed!');
  await pool.end();
};

runMigration().catch((err) => {
  console.error('❌ Migration failed!', err);
  process.exit(1);
}); 