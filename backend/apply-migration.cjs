const { Pool } = require('pg');

async function applyMigration() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_D0wZTJ7uqdRr@ep-damp-pine-a83kg2ln-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Applying database migration...');
    
    // Apply the migration to make image_url nullable
    const result = await pool.query('ALTER TABLE analysis_requests ALTER COLUMN image_url DROP NOT NULL');
    
    console.log('✅ Migration applied successfully!');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.log('❌ Migration failed:');
    console.log('🚨 Error:', error.message);
  } finally {
    await pool.end();
  }
}

applyMigration(); 