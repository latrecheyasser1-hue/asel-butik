const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-west-3.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xjizbwrzqwvvpgewshan',
  password: 'AselButikDb2026#SecurePassword',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL.');

    // Check which tables are currently in the supabase_realtime publication
    const result = await client.query(
      "SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';"
    );
    console.log('Currently in supabase_realtime publication:', result.rows.map(r => r.tablename));

    // Add all needed tables to the realtime publication
    const tables = ['orders', 'products', 'stock', 'invoices', 'suppliers', 'settings', 'auth_codes', 'expenses', 'debts'];
    
    for (const table of tables) {
      const alreadyExists = result.rows.some(r => r.tablename === table);
      if (!alreadyExists) {
        try {
          await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.${table};`);
          console.log(`  ✅ Added '${table}' to supabase_realtime publication`);
        } catch (err) {
          if (err.message.includes('already member')) {
            console.log(`  ⏩ '${table}' is already in the publication`);
          } else {
            console.error(`  ❌ Failed to add '${table}':`, err.message);
          }
        }
      } else {
        console.log(`  ⏩ '${table}' is already in the publication`);
      }
    }

    // Also set REPLICA IDENTITY FULL on orders so we get complete row data in realtime events
    await client.query('ALTER TABLE public.orders REPLICA IDENTITY FULL;');
    console.log('  ✅ Set REPLICA IDENTITY FULL on orders table');

    // Verify
    const verify = await client.query(
      "SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';"
    );
    console.log('\nFinal supabase_realtime publication tables:', verify.rows.map(r => r.tablename));
    
    console.log('\n✅ Realtime is now enabled for all tables!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
