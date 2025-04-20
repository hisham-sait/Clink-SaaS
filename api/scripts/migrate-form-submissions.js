/**
 * Migration script to add existing form submissions to datasets
 * 
 * This script finds all form submissions and adds them to datasets in the Data section.
 * For each form with submissions, it creates a dataset if one doesn't exist already,
 * then adds all submissions as records in that dataset.
 * 
 * Usage: node scripts/migrate-form-submissions.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateFormSubmissions() {
  try {
    console.log('Starting migration of form submissions to datasets...');
    
    // Get all forms with submissions
    const forms = await prisma.form.findMany({
      where: {
        submissions: {
          gt: 0
        }
      }
    });
    
    console.log(`Found ${forms.length} forms with submissions`);
    
    // Process each form
    for (const form of forms) {
      console.log(`Processing form: ${form.title} (ID: ${form.id})`);
      
      // Check if a dataset already exists for this form
      let dataset = await prisma.dataset.findFirst({
        where: {
          sourceId: form.id,
          type: 'form'
        }
      });
      
      // If no dataset exists, create one
      if (!dataset) {
        console.log(`Creating new dataset for form: ${form.title}`);
        dataset = await prisma.dataset.create({
          data: {
            name: `${form.title} Submissions`,
            description: `Submissions from the ${form.title} form`,
            type: 'form',
            sourceId: form.id,
            sourceName: form.title,
            companyId: form.companyId
          }
        });
      } else {
        console.log(`Using existing dataset for form: ${form.title}`);
      }
      
      // Get all submissions for this form
      const submissions = await prisma.formSubmission.findMany({
        where: {
          formId: form.id
        }
      });
      
      console.log(`Found ${submissions.length} submissions for form: ${form.title}`);
      
      // Check which submissions are already in the dataset
      const existingRecords = await prisma.dataRecord.findMany({
        where: {
          datasetId: dataset.id,
          metadata: {
            path: ['source'],
            equals: 'form_submission'
          }
        },
        select: {
          metadata: true
        }
      });
      
      // Extract submission IDs that are already in the dataset
      const existingSubmissionIds = existingRecords
        .filter(record => record.metadata && record.metadata.formSubmissionId)
        .map(record => record.metadata.formSubmissionId);
      
      console.log(`Found ${existingSubmissionIds.length} submissions already in dataset`);
      
      // Filter out submissions that are already in the dataset
      const submissionsToAdd = submissions.filter(
        submission => !existingSubmissionIds.includes(submission.id)
      );
      
      console.log(`Adding ${submissionsToAdd.length} new submissions to dataset`);
      
      // Add each submission to the dataset
      let addedCount = 0;
      for (const submission of submissionsToAdd) {
        try {
          await prisma.dataRecord.create({
            data: {
              datasetId: dataset.id,
              data: submission.data,
              metadata: {
                ...submission.metadata,
                formSubmissionId: submission.id,
                source: 'form_submission',
                migratedAt: new Date().toISOString()
              }
            }
          });
          addedCount++;
        } catch (error) {
          console.error(`Error adding submission ${submission.id} to dataset:`, error);
        }
      }
      
      console.log(`Successfully added ${addedCount} submissions to dataset`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFormSubmissions();
