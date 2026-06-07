const { Client } = require('pg');

const connectionString = 'postgresql://postgres:noV9Xl0WVC0vgVfZ@db.pykxpfyfvgkggcdvqyfd.supabase.co:6543/postgres?sslmode=require';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully. Executing migrations...");

    // Execute ALTER TABLE statements
    const sql = `
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'local',
      ADD COLUMN IF NOT EXISTS event_city VARCHAR(255) DEFAULT 'Varanasi',
      ADD COLUMN IF NOT EXISTS event_venue TEXT,
      ADD COLUMN IF NOT EXISTS event_type VARCHAR(100) DEFAULT 'Bridal',
      ADD COLUMN IF NOT EXISTS ready_by_time VARCHAR(50),
      ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0;
    `;
    
    await client.query(sql);
    console.log("Migration completed successfully! Added columns to 'bookings' table.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
