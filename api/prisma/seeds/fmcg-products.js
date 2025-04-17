const { PrismaClient, ProductType, AttributeType } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFMCGProducts() {
  try {
    console.log('Starting to seed FMCG products...');

    // Get all companies to associate products with
    const companies = await prisma.company.findMany({
      where: {
        status: 'Active'
      }
    });

    if (companies.length === 0) {
      throw new Error('No companies found. Please ensure settings seed has been run first.');
    }

    // For each company, create the FMCG products and related data
    for (const company of companies) {
      console.log(`Creating FMCG products for company: ${company.name}`);

      // 1. Create Product Sections
      const sections = [
        {
          name: 'General Information',
          code: 'general-info',
          description: 'Basic product information',
          displayIn: 'both',
          order: 1
        },
        {
          name: 'Packaging',
          code: 'packaging',
          description: 'Packaging details and specifications',
          displayIn: 'right',
          order: 2
        },
        {
          name: 'Ingredients',
          code: 'ingredients',
          description: 'Product ingredients and nutritional information',
          displayIn: 'left',
          order: 3
        },
        {
          name: 'Logistics',
          code: 'logistics',
          description: 'Shipping and storage information',
          displayIn: 'right',
          order: 4
        }
      ];

      const createdSections = {};
      
      for (const section of sections) {
        // Check if section already exists
        let existingSection = await prisma.productSection.findFirst({
          where: {
            companyId: company.id,
            code: section.code
          }
        });

        if (!existingSection) {
          existingSection = await prisma.productSection.create({
            data: {
              ...section,
              company: {
                connect: { id: company.id }
              }
            }
          });
          console.log(`Created section: ${section.name}`);
        }
        
        createdSections[section.code] = existingSection;
      }

      // 2. Create Product Categories
      const categories = [
        {
          name: 'Food & Beverages',
          code: 'food-beverages',
          description: 'Food and beverage products',
          level: 1
        },
        {
          name: 'Personal Care',
          code: 'personal-care',
          description: 'Personal care and hygiene products',
          level: 1
        },
        {
          name: 'Household Products',
          code: 'household',
          description: 'Household cleaning and maintenance products',
          level: 1
        },
        {
          name: 'Snacks',
          code: 'snacks',
          description: 'Snack foods',
          level: 2,
          parentCode: 'food-beverages'
        },
        {
          name: 'Beverages',
          code: 'beverages',
          description: 'Drinks and beverages',
          level: 2,
          parentCode: 'food-beverages'
        },
        {
          name: 'Skincare',
          code: 'skincare',
          description: 'Skincare products',
          level: 2,
          parentCode: 'personal-care'
        },
        {
          name: 'Oral Care',
          code: 'oral-care',
          description: 'Oral hygiene products',
          level: 2,
          parentCode: 'personal-care'
        },
        {
          name: 'Cleaning Products',
          code: 'cleaning',
          description: 'Cleaning products for home',
          level: 2,
          parentCode: 'household'
        }
      ];

      const createdCategories = {};
      
      // First create parent categories
      for (const category of categories.filter(c => c.level === 1)) {
        // Check if category already exists
        let existingCategory = await prisma.productCategory.findFirst({
          where: {
            companyId: company.id,
            code: category.code
          }
        });

        if (!existingCategory) {
          existingCategory = await prisma.productCategory.create({
            data: {
              ...category,
              company: {
                connect: { id: company.id }
              }
            }
          });
          console.log(`Created category: ${category.name}`);
        }
        
        createdCategories[category.code] = existingCategory;
      }
      
      // Then create child categories
      for (const category of categories.filter(c => c.level === 2)) {
        // Check if category already exists
        let existingCategory = await prisma.productCategory.findFirst({
          where: {
            companyId: company.id,
            code: category.code
          }
        });

        if (!existingCategory) {
          existingCategory = await prisma.productCategory.create({
            data: {
              name: category.name,
              code: category.code,
              description: category.description,
              level: category.level,
              parent: {
                connect: { id: createdCategories[category.parentCode].id }
              },
              company: {
                connect: { id: company.id }
              }
            }
          });
          console.log(`Created subcategory: ${category.name}`);
        }
        
        createdCategories[category.code] = existingCategory;
      }

      // 3. Create Product Families
      const families = [
        {
          name: 'Chocolate Products',
          code: 'chocolate',
          description: 'Chocolate bars and confectionery'
        },
        {
          name: 'Fruit Juices',
          code: 'fruit-juices',
          description: 'Natural and processed fruit juices'
        },
        {
          name: 'Natural Skincare',
          code: 'natural-skincare',
          description: 'Natural and organic skincare products'
        },
        {
          name: 'Eco-Friendly Cleaning',
          code: 'eco-cleaning',
          description: 'Environmentally friendly cleaning products'
        }
      ];

      const createdFamilies = {};
      
      for (const family of families) {
        // Check if family already exists
        let existingFamily = await prisma.productFamily.findFirst({
          where: {
            companyId: company.id,
            code: family.code
          }
        });

        if (!existingFamily) {
          existingFamily = await prisma.productFamily.create({
            data: {
              ...family,
              company: {
                connect: { id: company.id }
              }
            }
          });
          console.log(`Created family: ${family.name}`);
        }
        
        createdFamilies[family.code] = existingFamily;
      }

      // 4. Create Product Attributes
      const attributes = [
        // General attributes
        {
          name: 'Brand',
          code: 'brand',
          type: AttributeType.TEXT,
          description: 'Product brand name',
          isRequired: true,
          sectionCode: 'general-info'
        },
        {
          name: 'Country of Origin',
          code: 'country-of-origin',
          type: AttributeType.TEXT,
          description: 'Country where the product is manufactured',
          isRequired: true,
          sectionCode: 'general-info'
        },
        {
          name: 'Barcode',
          code: 'barcode',
          type: AttributeType.TEXT,
          description: 'Product barcode/UPC',
          isRequired: true,
          sectionCode: 'general-info'
        },
        {
          name: 'Weight',
          code: 'weight',
          type: AttributeType.NUMBER,
          description: 'Product weight',
          unit: 'g',
          isRequired: true,
          sectionCode: 'general-info'
        },
        {
          name: 'Price',
          code: 'price',
          type: AttributeType.PRICE,
          description: 'Product retail price',
          isRequired: true,
          sectionCode: 'general-info'
        },
        // Packaging attributes
        {
          name: 'Packaging Type',
          code: 'packaging-type',
          type: AttributeType.SELECT,
          description: 'Type of packaging',
          options: ["Box", "Bottle", "Pouch", "Jar", "Tube", "Sachet", "Other"],
          isRequired: true,
          sectionCode: 'packaging'
        },
        {
          name: 'Recyclable',
          code: 'recyclable',
          type: AttributeType.BOOLEAN,
          description: 'Is the packaging recyclable',
          isRequired: false,
          sectionCode: 'packaging'
        },
        {
          name: 'Package Dimensions',
          code: 'package-dimensions',
          type: AttributeType.TEXT,
          description: 'Dimensions of the package (LxWxH)',
          isRequired: false,
          sectionCode: 'packaging'
        },
        // Ingredients attributes
        {
          name: 'Ingredients List',
          code: 'ingredients-list',
          type: AttributeType.TEXTAREA,
          description: 'List of ingredients',
          isRequired: true,
          sectionCode: 'ingredients'
        },
        {
          name: 'Allergens',
          code: 'allergens',
          type: AttributeType.MULTISELECT,
          description: 'Allergens present in the product',
          options: ["Gluten", "Dairy", "Nuts", "Soy", "Eggs", "Fish", "Shellfish", "None"],
          isRequired: true,
          sectionCode: 'ingredients'
        },
        {
          name: 'Organic',
          code: 'organic',
          type: AttributeType.BOOLEAN,
          description: 'Is the product certified organic',
          isRequired: false,
          sectionCode: 'ingredients'
        },
        {
          name: 'Vegan',
          code: 'vegan',
          type: AttributeType.BOOLEAN,
          description: 'Is the product vegan',
          isRequired: false,
          sectionCode: 'ingredients'
        },
        // Logistics attributes
        {
          name: 'Storage Instructions',
          code: 'storage-instructions',
          type: AttributeType.TEXT,
          description: 'How to store the product',
          isRequired: true,
          sectionCode: 'logistics'
        },
        {
          name: 'Shelf Life',
          code: 'shelf-life',
          type: AttributeType.NUMBER,
          description: 'Product shelf life',
          unit: 'months',
          isRequired: true,
          sectionCode: 'logistics'
        },
        {
          name: 'Units Per Case',
          code: 'units-per-case',
          type: AttributeType.NUMBER,
          description: 'Number of units per shipping case',
          isRequired: false,
          sectionCode: 'logistics'
        }
      ];

      const createdAttributes = {};
      
      for (const attribute of attributes) {
        // Check if attribute already exists
        let existingAttribute = await prisma.productAttribute.findFirst({
          where: {
            companyId: company.id,
            code: attribute.code
          }
        });

        if (!existingAttribute) {
          existingAttribute = await prisma.productAttribute.create({
            data: {
              name: attribute.name,
              code: attribute.code,
              type: attribute.type,
              description: attribute.description,
              options: attribute.options,
              unit: attribute.unit,
              isRequired: attribute.isRequired,
              section: {
                connect: { id: createdSections[attribute.sectionCode].id }
              },
              company: {
                connect: { id: company.id }
              }
            }
          });
          console.log(`Created attribute: ${attribute.name}`);
        }
        
        createdAttributes[attribute.code] = existingAttribute;
      }

      // 5. Associate attributes with families
      const familyAttributes = [
        // Chocolate Products family attributes
        { familyCode: 'chocolate', attributeCode: 'brand', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'country-of-origin', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'barcode', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'weight', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'price', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'packaging-type', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'recyclable', isRequired: false },
        { familyCode: 'chocolate', attributeCode: 'ingredients-list', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'allergens', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'organic', isRequired: false },
        { familyCode: 'chocolate', attributeCode: 'vegan', isRequired: false },
        { familyCode: 'chocolate', attributeCode: 'storage-instructions', isRequired: true },
        { familyCode: 'chocolate', attributeCode: 'shelf-life', isRequired: true },
        
        // Fruit Juices family attributes
        { familyCode: 'fruit-juices', attributeCode: 'brand', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'country-of-origin', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'barcode', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'weight', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'price', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'packaging-type', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'recyclable', isRequired: false },
        { familyCode: 'fruit-juices', attributeCode: 'ingredients-list', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'allergens', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'organic', isRequired: false },
        { familyCode: 'fruit-juices', attributeCode: 'storage-instructions', isRequired: true },
        { familyCode: 'fruit-juices', attributeCode: 'shelf-life', isRequired: true },
        
        // Natural Skincare family attributes
        { familyCode: 'natural-skincare', attributeCode: 'brand', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'country-of-origin', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'barcode', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'weight', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'price', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'packaging-type', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'recyclable', isRequired: false },
        { familyCode: 'natural-skincare', attributeCode: 'ingredients-list', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'allergens', isRequired: true },
        { familyCode: 'natural-skincare', attributeCode: 'organic', isRequired: false },
        { familyCode: 'natural-skincare', attributeCode: 'vegan', isRequired: false },
        { familyCode: 'natural-skincare', attributeCode: 'storage-instructions', isRequired: false },
        { familyCode: 'natural-skincare', attributeCode: 'shelf-life', isRequired: true },
        
        // Eco-Friendly Cleaning family attributes
        { familyCode: 'eco-cleaning', attributeCode: 'brand', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'country-of-origin', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'barcode', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'weight', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'price', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'packaging-type', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'recyclable', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'ingredients-list', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'organic', isRequired: false },
        { familyCode: 'eco-cleaning', attributeCode: 'storage-instructions', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'shelf-life', isRequired: true },
        { familyCode: 'eco-cleaning', attributeCode: 'units-per-case', isRequired: false }
      ];
      
      for (const familyAttribute of familyAttributes) {
        // Check if family attribute already exists
        const existingFamilyAttribute = await prisma.productFamilyAttribute.findFirst({
          where: {
            familyId: createdFamilies[familyAttribute.familyCode].id,
            attributeId: createdAttributes[familyAttribute.attributeCode].id
          }
        });

        if (!existingFamilyAttribute) {
          await prisma.productFamilyAttribute.create({
            data: {
              family: {
                connect: { id: createdFamilies[familyAttribute.familyCode].id }
              },
              attribute: {
                connect: { id: createdAttributes[familyAttribute.attributeCode].id }
              },
              isRequired: familyAttribute.isRequired
            }
          });
        }
      }

      // 6. Create FMCG Products
      const products = [
        {
          name: 'Dark Chocolate Bar',
          description: 'Premium dark chocolate bar made with 70% cocoa',
          type: ProductType.PHYSICAL,
          sku: 'CHOC-DARK-001',
          categoryCode: 'snacks',
          familyCode: 'chocolate',
          attributeValues: [
            { code: 'brand', value: 'ChocoDream' },
            { code: 'country-of-origin', value: 'Belgium' },
            { code: 'barcode', value: '5901234123457' },
            { code: 'weight', value: 100 },
            { code: 'price', value: 3.99 },
            { code: 'packaging-type', value: 'Box' },
            { code: 'recyclable', value: true },
            { code: 'ingredients-list', value: 'Cocoa mass, cocoa butter, sugar, vanilla extract' },
            { code: 'allergens', value: ['Soy'] },
            { code: 'organic', value: false },
            { code: 'vegan', value: true },
            { code: 'storage-instructions', value: 'Store in a cool, dry place' },
            { code: 'shelf-life', value: 12 }
          ]
        },
        {
          name: 'Orange Juice',
          description: 'Fresh-squeezed orange juice with no added sugar',
          type: ProductType.PHYSICAL,
          sku: 'JUICE-ORG-001',
          categoryCode: 'beverages',
          familyCode: 'fruit-juices',
          attributeValues: [
            { code: 'brand', value: 'FreshPress' },
            { code: 'country-of-origin', value: 'Spain' },
            { code: 'barcode', value: '5901234123458' },
            { code: 'weight', value: 1000 },
            { code: 'price', value: 2.49 },
            { code: 'packaging-type', value: 'Bottle' },
            { code: 'recyclable', value: true },
            { code: 'ingredients-list', value: '100% orange juice' },
            { code: 'allergens', value: ['None'] },
            { code: 'organic', value: true },
            { code: 'storage-instructions', value: 'Keep refrigerated' },
            { code: 'shelf-life', value: 1 }
          ]
        },
        {
          name: 'Hydrating Face Cream',
          description: 'Natural face cream with aloe vera and hyaluronic acid',
          type: ProductType.PHYSICAL,
          sku: 'SKIN-FACE-001',
          categoryCode: 'skincare',
          familyCode: 'natural-skincare',
          attributeValues: [
            { code: 'brand', value: 'NaturalGlow' },
            { code: 'country-of-origin', value: 'France' },
            { code: 'barcode', value: '5901234123459' },
            { code: 'weight', value: 50 },
            { code: 'price', value: 14.99 },
            { code: 'packaging-type', value: 'Jar' },
            { code: 'recyclable', value: true },
            { code: 'ingredients-list', value: 'Aqua, Aloe Barbadensis Leaf Juice, Glycerin, Sodium Hyaluronate, Tocopherol, Citrus Aurantium Dulcis Oil' },
            { code: 'allergens', value: ['None'] },
            { code: 'organic', value: true },
            { code: 'vegan', value: true },
            { code: 'shelf-life', value: 12 }
          ]
        },
        {
          name: 'Natural Toothpaste',
          description: 'Fluoride-free toothpaste with mint and tea tree oil',
          type: ProductType.PHYSICAL,
          sku: 'ORAL-TOOTH-001',
          categoryCode: 'oral-care',
          familyCode: 'natural-skincare',
          attributeValues: [
            { code: 'brand', value: 'PureSmile' },
            { code: 'country-of-origin', value: 'Germany' },
            { code: 'barcode', value: '5901234123460' },
            { code: 'weight', value: 75 },
            { code: 'price', value: 4.99 },
            { code: 'packaging-type', value: 'Tube' },
            { code: 'recyclable', value: false },
            { code: 'ingredients-list', value: 'Calcium Carbonate, Aqua, Glycerin, Xylitol, Mentha Piperita Oil, Melaleuca Alternifolia Leaf Oil' },
            { code: 'allergens', value: ['None'] },
            { code: 'organic', value: false },
            { code: 'vegan', value: true },
            { code: 'shelf-life', value: 24 }
          ]
        },
        {
          name: 'Multi-Surface Cleaner',
          description: 'Eco-friendly all-purpose cleaner with essential oils',
          type: ProductType.PHYSICAL,
          sku: 'CLEAN-SURF-001',
          categoryCode: 'cleaning',
          familyCode: 'eco-cleaning',
          attributeValues: [
            { code: 'brand', value: 'EcoClean' },
            { code: 'country-of-origin', value: 'Sweden' },
            { code: 'barcode', value: '5901234123461' },
            { code: 'weight', value: 750 },
            { code: 'price', value: 3.99 },
            { code: 'packaging-type', value: 'Bottle' },
            { code: 'recyclable', value: true },
            { code: 'ingredients-list', value: 'Water, Plant-Based Surfactants, Citric Acid, Lavender Essential Oil, Lemon Essential Oil' },
            { code: 'organic', value: true },
            { code: 'storage-instructions', value: 'Store at room temperature' },
            { code: 'shelf-life', value: 24 },
            { code: 'units-per-case', value: 12 }
          ]
        }
      ];
      
      for (const product of products) {
        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            companyId: company.id,
            sku: product.sku
          }
        });

        if (!existingProduct) {
          // Create the product
          const createdProduct = await prisma.product.create({
            data: {
              name: product.name,
              description: product.description,
              type: product.type,
              sku: product.sku,
              status: 'Active',
              category: {
                connect: { id: createdCategories[product.categoryCode].id }
              },
              family: {
                connect: { id: createdFamilies[product.familyCode].id }
              },
              company: {
                connect: { id: company.id }
              }
            }
          });
          
          // Create attribute values for the product
          for (const attributeValue of product.attributeValues) {
            await prisma.productAttributeValue.create({
              data: {
                product: {
                  connect: { id: createdProduct.id }
                },
                attribute: {
                  connect: { id: createdAttributes[attributeValue.code].id }
                },
                value: attributeValue.value
              }
            });
          }
          
          console.log(`Created product: ${product.name}`);
        }
      }

      console.log(`Successfully created FMCG products for company: ${company.name}`);
    }

    console.log('FMCG products seed completed successfully');
    return true;
  } catch (error) {
    console.error('Error seeding FMCG products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedFMCGProducts;
