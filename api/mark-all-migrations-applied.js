const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function markMigrationsApplied() {
  try {
    // List of migrations to mark as applied
    const migrations = [
      '20250422144527_add_elements_to_form',
      '20250422154316_add_elements_to_form',
      '20250422164200_add_analytics_fields',
      '20250422164857_fix_elements_column',
      '20250422170700_add_missing_analytics_fields',
      '20250422170800_create_missing_tables',
      '20250422171000_add_missing_pageview_columns',
      '20250422171100_add_missing_form_columns'
    ];

    for (const migrationName of migrations) {
      // Check if the migration is already in the _prisma_migrations table
      const existingMigration = await prisma.$queryRaw`
        SELECT * FROM "_prisma_migrations" 
        WHERE "migration_name" = ${migrationName}
      `;

      if (existingMigration && existingMigration.length > 0) {
        console.log(`Migration ${migrationName} already exists in the _prisma_migrations table`);
        continue;
      }

      // Insert the migration record
      await prisma.$executeRaw`
        INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
        VALUES (
          gen_random_uuid(),
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          NOW(),
          ${migrationName},
          NULL,
          NULL,
          NOW(),
          1
        )
      `;

      console.log(`Migration ${migrationName} marked as applied successfully`);
    }
  } catch (error) {
    console.error('Error marking migrations as applied:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationsApplied();
