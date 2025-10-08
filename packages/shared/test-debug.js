// Quick debug script to test migrations
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

async function test() {
  // Create test database
  const db = new Database(':memory:');

  // Try to manually run migrations
  const migrationsDir = path.join(__dirname, 'migrations');
  console.log('Migrations dir:', migrationsDir);
  console.log('Exists?', fs.existsSync(migrationsDir));

  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    console.log('Migration files:', files);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`\nRunning ${file}...`);
      try {
        db.exec(sql);
        console.log(`✓ ${file} completed`);
      } catch (err) {
        console.error(`✗ ${file} failed:`, err.message);
      }
    }
  }

  // Check if monthly_summaries table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\nTables created:', tables.map(t => t.name));

  // Check monthly_summaries schema
  try {
    const schema = db.prepare('PRAGMA table_info(monthly_summaries)').all();
    console.log('\nmonthly_summaries columns:');
    schema.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  } catch (err) {
    console.log('\nmonthly_summaries table not found');
  }

  db.close();
}

test().catch(console.error);
