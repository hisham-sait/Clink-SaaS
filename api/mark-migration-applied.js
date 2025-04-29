const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function markMigrationApplied() {
  try {
    // Check if the migration is already in the _prisma_migrations table
    const existingMigration = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" 
      WHERE "migration_name" = '20250422154316_add_elements_to_form'
    `;

    if (existingMigration && existingMigration.length > 0) {
      console.log('Migration already exists in the _prisma_migrations table');
      return;
    }

    // Insert the migration record
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      VALUES (
        gen_random_uuid(),
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        NOW(),
        '20250422154316_add_elements_to_form',
        NULL,
        NULL,
        NOW(),
        1
      )
    `;

    console.log('Migration marked as applied successfully');
  } catch (error) {
    console.error('Error marking migration as applied:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationApplied();
