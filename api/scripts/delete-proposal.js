const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteProposal(proposalId) {
  try {
    console.log(`Attempting to delete proposal with ID: ${proposalId}`);
    
    // First check if the proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { products: true }
    });
    
    if (!proposal) {
      console.error(`Proposal not found: ${proposalId}`);
      return;
    }
    
    console.log(`Found proposal: ${proposal.name} with ${proposal.products.length} products`);
    
    // First delete all related products
    if (proposal.products.length > 0) {
      console.log(`Deleting ${proposal.products.length} related products`);
      await prisma.proposalProduct.deleteMany({
        where: { proposalId }
      });
      console.log('Products deleted successfully');
    }
    
    // Then delete the proposal
    console.log(`Deleting proposal: ${proposalId}`);
    await prisma.proposal.delete({
      where: { id: proposalId }
    });
    
    console.log('Proposal deleted successfully');
  } catch (error) {
    console.error('Error deleting proposal:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteAllProposalsForCompany(companyId) {
  try {
    console.log(`Attempting to delete all proposals for company: ${companyId}`);
    
    // Get all proposal IDs for the company
    const proposals = await prisma.proposal.findMany({
      where: { companyId },
      select: { id: true }
    });
    
    const proposalIds = proposals.map(p => p.id);
    console.log(`Found ${proposalIds.length} proposals to delete`);
    
    if (proposalIds.length === 0) {
      console.log('No proposals found to delete');
      return;
    }
    
    // Delete all related products for these proposals
    await prisma.proposalProduct.deleteMany({
      where: { proposalId: { in: proposalIds } }
    });
    console.log(`Deleted all products for ${proposalIds.length} proposals`);
    
    // Delete all proposals for the company
    const result = await prisma.proposal.deleteMany({
      where: { companyId }
    });
    
    console.log(`Deleted ${result.count} proposals for company: ${companyId}`);
  } catch (error) {
    console.error('Error deleting all proposals:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const id = args[1];

if (!command) {
  console.error('Please provide a command: delete-proposal <proposalId> or delete-all-proposals <companyId>');
  process.exit(1);
}

if (!id) {
  console.error('Please provide an ID');
  process.exit(1);
}

if (command === 'delete-proposal') {
  deleteProposal(id)
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
} else if (command === 'delete-all-proposals') {
  deleteAllProposalsForCompany(id)
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
} else {
  console.error('Unknown command. Use delete-proposal or delete-all-proposals');
  process.exit(1);
}
