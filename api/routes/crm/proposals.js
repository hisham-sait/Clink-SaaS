const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');
const puppeteer = require('puppeteer');

// Apply auth middleware to all routes
router.use(auth);

// Section Templates Routes

// Get all section templates for a company
router.get('/:companyId/section-templates', async (req, res) => {
  try {
    const { companyId } = req.params;
    const templates = await prisma.sectionTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching section templates:', error);
    res.status(500).json({ error: 'Failed to fetch section templates' });
  }
});

// Get a single section template
router.get('/:companyId/section-templates/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const template = await prisma.sectionTemplate.findFirst({
      where: { id, companyId },
    });
    if (!template) {
      return res.status(404).json({ error: 'Section template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching section template:', error);
    res.status(500).json({ error: 'Failed to fetch section template' });
  }
});

// Create a new section template
router.post('/:companyId/section-templates', async (req, res) => {
  try {
    const { companyId } = req.params;
    const templateData = req.body;
    
    const template = await prisma.sectionTemplate.create({
      data: {
        ...templateData,
        companyId,
      },
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating section template:', error);
    res.status(500).json({ error: 'Failed to create section template' });
  }
});

// Update a section template
router.put('/:companyId/section-templates/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const templateData = req.body;
    
    // Check if template exists
    const existingTemplate = await prisma.sectionTemplate.findFirst({
      where: { id, companyId },
    });
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Section template not found' });
    }
    
    const updatedTemplate = await prisma.sectionTemplate.update({
      where: { id },
      data: templateData,
    });
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating section template:', error);
    res.status(500).json({ error: 'Failed to update section template' });
  }
});

// Delete a section template
router.delete('/:companyId/section-templates/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if template exists
    const existingTemplate = await prisma.sectionTemplate.findFirst({
      where: { id, companyId },
    });
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Section template not found' });
    }
    
    await prisma.sectionTemplate.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting section template:', error);
    res.status(500).json({ error: 'Failed to delete section template' });
  }
});

// Get all proposals for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const proposals = await prisma.proposal.findMany({
      where: { companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get a single proposal
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// Create a new proposal
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { products, ...proposalData } = req.body;

    const proposal = await prisma.proposal.create({
      data: {
        ...proposalData,
        companyId,
        products: {
          create: products.map(product => ({
            productId: product.productId,
            planType: product.planType,
            tierId: product.tierId || product.planType, // Use planType as tierId if not provided
            quantity: product.quantity,
            price: product.price,
            features: product.features,
          })),
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update a proposal
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { products, ...proposalData } = req.body;

    console.log('Updating proposal:', id, 'for company:', companyId);
    console.log('Products data:', JSON.stringify(products, null, 2));

    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Delete existing products
    await prisma.proposalProduct.deleteMany({
      where: { proposalId: id },
    });

    // Validate products data
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array' });
    }

    // Ensure all products have required fields
    for (const product of products) {
      if (!product.productId) {
        return res.status(400).json({ error: 'Product is missing productId' });
      }
      if (!product.planType) {
        return res.status(400).json({ error: 'Product is missing planType' });
      }
      // Ensure tierId is set
      if (!product.tierId) {
        product.tierId = product.planType;
        console.log(`Setting tierId to planType (${product.planType}) for product ${product.productId}`);
      }
    }

    // Clean up the proposal data to remove any fields that might cause issues with Prisma
    const cleanProposalData = { ...proposalData };
    
    // Remove any fields that are not in the Prisma schema
    delete cleanProposalData.contact;
    delete cleanProposalData.deal;
    delete cleanProposalData.products;
    
    // Update proposal and create new products if any
    let updateData = cleanProposalData;
    
    // Only include products creation if there are products to create
    if (products.length > 0) {
      updateData.products = {
        create: products.map(product => ({
          productId: product.productId,
          planType: product.planType,
          tierId: product.tierId, // Already validated above
          quantity: product.quantity || 1,
          price: product.price || 0,
          features: product.features || [],
        })),
      };
    }
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    res.json(updatedProposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    if (error.meta) {
      console.error('Prisma error meta:', error.meta);
    }
    res.status(500).json({ error: 'Failed to update proposal', details: error.message });
  }
});

// Delete a proposal
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    console.log(`Attempting to delete proposal with ID: ${id} for company: ${companyId}`);
    
    // First check if the proposal exists
    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        products: true
      }
    });
    
    if (!proposal) {
      console.log(`Proposal not found: ${id}`);
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    console.log(`Found proposal: ${proposal.name} with ${proposal.products.length} products`);
    
    // First delete all related products manually
    if (proposal.products.length > 0) {
      console.log(`Deleting ${proposal.products.length} related products`);
      await prisma.proposalProduct.deleteMany({
        where: { proposalId: id }
      });
      console.log('Products deleted successfully');
    }
    
    // Then delete the proposal
    console.log(`Deleting proposal: ${id}`);
    await prisma.proposal.delete({
      where: { id }
    });
    
    console.log('Proposal deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting proposal:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    res.status(500).json({ error: 'Failed to delete proposal', details: error.message });
  }
});

// Export proposal as PDF
router.get('/:companyId/:id/export-pdf', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Get the proposal data
    const proposal = await prisma.proposal.findFirst({
      where: { id, companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            amount: true,
          },
        },
        products: {
          include: {
            product: {
              include: {
                tiers: true,
              },
            },
          },
        },
      },
    });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Generate HTML content from proposal data
    const sections = proposal.content?.sections || [];
    const headerFooter = proposal.content?.headerFooter || {};

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${proposal.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${headerFooter.showHeader ? `
            <div class="header">
              ${headerFooter.headerContent || ''}
            </div>
          ` : ''}

          <div class="header">
            <h1>${proposal.name}</h1>
            ${proposal.contact ? `
              <p>Prepared for: ${proposal.contact.firstName} ${proposal.contact.lastName}</p>
            ` : ''}
            ${proposal.validUntil ? `
              <p>Valid until: ${new Date(proposal.validUntil).toLocaleDateString()}</p>
            ` : ''}
          </div>

          ${sections.map(section => {
            if (section.type === 'page-break') {
              return '<div style="page-break-after: always;"></div>';
            }
            // Only include the content within the section, not the wrapper
            return `<div class="section">${section.content}</div>`;
          }).join('\n')}

          ${headerFooter.showFooter ? `
            <div class="footer">
              ${headerFooter.footerContent || ''}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: false
    });
    
    await browser.close();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${proposal.name.replace(/\s+/g, '_')}.pdf"`);
    
    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting proposal to PDF:', error);
    res.status(500).json({ error: 'Failed to export proposal to PDF' });
  }
});

module.exports = router;
