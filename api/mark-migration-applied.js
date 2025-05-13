const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function markMigrationApplied() {
  try {
    // Migration name to mark as applied
    const migrationName = '20250505130000_add_insight_models';
    
    // Check if migration already exists
    const existingMigration = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" WHERE "migration_name" = ${migrationName}
    `;
    
    if (existingMigration.length > 0) {
      console.log(`Migration ${migrationName} already exists in the database.`);
      return;
    }
    
    // Insert migration record
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      VALUES (
        gen_random_uuid(),
        'manually applied',
        now(),
        ${migrationName},
        NULL,
        NULL,
        now(),
        1
      )
    `;
    
    console.log(`Migration ${migrationName} marked as applied.`);
  } catch (error) {
    console.error('Error marking migration as applied:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationApplied();
