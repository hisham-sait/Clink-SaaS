const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all categories for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const categories = await prisma.productCategory.findMany({
      where: { companyId },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });
    
    // Organize categories into a tree structure
    const categoryMap = {};
    const rootCategories = [];
    
    // First pass: create a map of categories by ID
    categories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        children: []
      };
    });
    
    // Second pass: build the tree structure
    categories.forEach(category => {
      if (category.parentId) {
        // This is a child category, add it to its parent's children array
        if (categoryMap[category.parentId]) {
          categoryMap[category.parentId].children.push(categoryMap[category.id]);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap[category.id]);
      }
    });
    
    res.json({
      categories: categories, // Flat list
      categoryTree: rootCategories // Tree structure
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get a single category
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const category = await prisma.productCategory.findFirst({
      where: { id, companyId },
      include: {
        parent: true,
        children: true
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Get products count for this category
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });
    
    // Get subcategories count
    const subcategoriesCount = await prisma.productCategory.count({
      where: { parentId: id }
    });
    
    res.json({
      ...category,
      productsCount,
      subcategoriesCount
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create a new category
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { parentId, ...categoryData } = req.body;
    
    // Calculate level based on parent
    let level = 1;
    
    if (parentId) {
      const parentCategory = await prisma.productCategory.findUnique({
        where: { id: parentId }
      });
      
      if (!parentCategory) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
      
      level = parentCategory.level + 1;
    }
    
    // Check if code is unique for this company
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        companyId,
        code: categoryData.code
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category code must be unique within the company' });
    }
    
    const category = await prisma.productCategory.create({
      data: {
        ...categoryData,
        level,
        parentId,
        companyId
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// Update a category
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { parentId, ...categoryData } = req.body;
    
    // Check if category exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if code is unique for this company (if changed)
    if (categoryData.code && categoryData.code !== existingCategory.code) {
      const duplicateCode = await prisma.productCategory.findFirst({
        where: {
          companyId,
          code: categoryData.code,
          id: { not: id }
        }
      });
      
      if (duplicateCode) {
        return res.status(400).json({ error: 'Category code must be unique within the company' });
      }
    }
    
    // Calculate level based on parent (if changed)
    let level = existingCategory.level;
    
    if (parentId !== undefined && parentId !== existingCategory.parentId) {
      // Prevent circular references
      if (parentId === id) {
        return res.status(400).json({ error: 'A category cannot be its own parent' });
      }
      
      // Check if the new parent is a descendant of this category (would create a loop)
      if (parentId) {
        let currentParent = parentId;
        let isCircular = false;
        
        while (currentParent && !isCircular) {
          const parent = await prisma.productCategory.findUnique({
            where: { id: currentParent },
            select: { parentId: true }
          });
          
          if (!parent) break;
          
          if (parent.parentId === id) {
            isCircular = true;
          } else {
            currentParent = parent.parentId;
          }
        }
        
        if (isCircular) {
          return res.status(400).json({ error: 'Cannot create circular category hierarchy' });
        }
        
        // Calculate new level
        if (parentId) {
          const parentCategory = await prisma.productCategory.findUnique({
            where: { id: parentId }
          });
          
          if (!parentCategory) {
            return res.status(400).json({ error: 'Parent category not found' });
          }
          
          level = parentCategory.level + 1;
        } else {
          level = 1; // Root category
        }
      }
    }
    
    // Update the category
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        ...categoryData,
        level,
        parentId
      }
    });
    
    // If level changed, update all descendants
    if (level !== existingCategory.level) {
      await updateDescendantLevels(id, level);
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
});

// Helper function to recursively update descendant levels
async function updateDescendantLevels(parentId, parentLevel) {
  const children = await prisma.productCategory.findMany({
    where: { parentId }
  });
  
  for (const child of children) {
    const newLevel = parentLevel + 1;
    
    await prisma.productCategory.update({
      where: { id: child.id },
      data: { level: newLevel }
    });
    
    // Recursively update this child's descendants
    await updateDescendantLevels(child.id, newLevel);
  }
}

// Delete a category
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if category exists
    const category = await prisma.productCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category has children
    const childrenCount = await prisma.productCategory.count({
      where: { parentId: id }
    });
    
    if (childrenCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories',
        childrenCount
      });
    }
    
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated products',
        productsCount
      });
    }
    
    // Delete the category
    await prisma.productCategory.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
