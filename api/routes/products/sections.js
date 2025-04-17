const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sections for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const sections = await prisma.productSection.findMany({
      where: {
        companyId
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get a specific section
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const section = await prisma.productSection.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Create a new section
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, code, description, displayIn, order } = req.body;
    
    // Check if code already exists for this company
    const existingSection = await prisma.productSection.findFirst({
      where: {
        companyId,
        code
      }
    });
    
    if (existingSection) {
      return res.status(400).json({ error: 'A section with this code already exists' });
    }
    
    // Get the highest order if not provided
    let sectionOrder = order;
    if (!sectionOrder) {
      const highestOrder = await prisma.productSection.findFirst({
        where: { companyId },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      
      sectionOrder = highestOrder ? highestOrder.order + 1 : 1;
    }
    
    const section = await prisma.productSection.create({
      data: {
        name,
        code,
        description,
        displayIn: displayIn || 'both',
        order: sectionOrder,
        company: {
          connect: { id: companyId }
        }
      }
    });
    
    // Log activity
    await prisma.productActivity.create({
      data: {
        companyId,
        action: 'created',
        itemType: 'section',
        itemId: section.id,
        itemName: section.name,
        details: { section }
      }
    });
    
    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update a section
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { name, code, description, displayIn, order } = req.body;
    
    // Check if section exists
    const existingSection = await prisma.productSection.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Check if code already exists for another section
    if (code !== existingSection.code) {
      const duplicateCode = await prisma.productSection.findFirst({
        where: {
          companyId,
          code,
          id: { not: id }
        }
      });
      
      if (duplicateCode) {
        return res.status(400).json({ error: 'A section with this code already exists' });
      }
    }
    
    const section = await prisma.productSection.update({
      where: { id },
      data: {
        name,
        code,
        description,
        displayIn,
        order
      }
    });
    
    // Log activity
    await prisma.productActivity.create({
      data: {
        companyId,
        action: 'updated',
        itemType: 'section',
        itemId: section.id,
        itemName: section.name,
        details: { section }
      }
    });
    
    res.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete a section
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if section exists
    const existingSection = await prisma.productSection.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    await prisma.productSection.delete({
      where: { id }
    });
    
    // Log activity
    await prisma.productActivity.create({
      data: {
        companyId,
        action: 'deleted',
        itemType: 'section',
        itemId: id,
        itemName: existingSection.name,
        details: { section: existingSection }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Reorder sections
router.put('/:companyId/reorder', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { sectionIds } = req.body;
    
    if (!Array.isArray(sectionIds)) {
      return res.status(400).json({ error: 'sectionIds must be an array' });
    }
    
    // Update order for each section
    const updates = sectionIds.map((id, index) => 
      prisma.productSection.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    
    await prisma.$transaction(updates);
    
    // Get updated sections
    const sections = await prisma.productSection.findMany({
      where: { companyId },
      orderBy: { order: 'asc' }
    });
    
    res.json(sections);
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

module.exports = router;
