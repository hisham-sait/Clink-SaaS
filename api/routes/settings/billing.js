const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Role-based access middleware
const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user is Super Admin first
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: true
      }
    });

    const isSuperAdmin = userRoles.some(ur => ur.role.name === 'Super Admin');
    if (isSuperAdmin) {
      return next();
    }

    // Check specific permission for other roles
    const hasPermission = await prisma.userRole.findFirst({
      where: { 
        userId: user.id,
        role: {
          permissions: {
            some: {
              permission: {
                code: requiredPermission
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billing details for a company
router.get('/:companyId', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const billingDetails = await prisma.billingDetails.findUnique({
      where: { companyId },
      include: {
        company: true,
        paymentMethods: true
      }
    });
    res.json(billingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update billing details
router.put('/:companyId', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const billingDetails = await prisma.billingDetails.update({
      where: { companyId },
      data: req.body,
      include: {
        company: true,
        paymentMethods: true
      }
    });
    res.json(billingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Methods
router.get('/:companyId/payment-methods', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        billingDetails: {
          companyId
        }
      }
    });
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/payment-methods', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const billingDetails = await prisma.billingDetails.findUnique({
      where: { companyId }
    });
    
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        ...req.body,
        billingDetailsId: billingDetails.id
      }
    });
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/payment-methods/:methodId', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { methodId } = req.params;
    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: req.body
    });
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:companyId/payment-methods/:methodId', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { methodId } = req.params;
    await prisma.paymentMethod.delete({
      where: { id: methodId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/payment-methods/:methodId/default', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { companyId, methodId } = req.params;
    
    // First, set all payment methods to non-default
    await prisma.paymentMethod.updateMany({
      where: {
        billingDetails: {
          companyId
        }
      },
      data: {
        isDefault: false
      }
    });

    // Then set the selected method as default
    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: {
        isDefault: true
      }
    });
    
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
router.get('/:companyId/invoices', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        company: true,
        createdBy: true,
        payments: true
      }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:companyId/invoices/:invoiceId', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        company: true,
        createdBy: true,
        payments: true
      }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/invoices', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const invoice = await prisma.invoice.create({
      data: {
        ...req.body,
        companyId,
        createdById: req.user.id
      },
      include: {
        company: true,
        createdBy: true
      }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:companyId/invoices/:invoiceId', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: req.body,
      include: {
        company: true,
        createdBy: true,
        payments: true
      }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:companyId/invoices/:invoiceId', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const { invoiceId } = req.params;
    await prisma.invoice.delete({
      where: { id: invoiceId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payments
router.get('/:companyId/payments', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { companyId },
      include: {
        invoice: true,
        company: true
      }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:companyId/payments/:paymentId', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: true,
        company: true
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/invoices/:invoiceId/payments', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { companyId, invoiceId } = req.params;
    const payment = await prisma.payment.create({
      data: {
        ...req.body,
        companyId,
        invoiceId
      },
      include: {
        invoice: true,
        company: true
      }
    });

    // Update invoice status if payment is completed
    if (payment.status === 'Completed') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'Paid',
          paidDate: new Date()
        }
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Platform Admin Operations
router.get('/invoices', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        company: true,
        createdBy: true,
        payments: true
      }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payments', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: true,
        company: true
      }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/generate-invoice-number', auth, checkPermission('billing:admin'), async (req, res) => {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of invoices for this month
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), 1),
          lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
        }
      }
    });

    // Generate invoice number: INV-YY-MM-XXXX
    const invoiceNumber = `INV-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    res.json(invoiceNumber);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Plan Operations
router.get('/:companyId/plan', auth, checkPermission('billing:view'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        plan: true
      }
    });
    
    if (!company || !company.plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json(company.plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:companyId/plan', auth, checkPermission('billing:manage'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const { planId } = req.body;

    // Get the plan to verify it exists and is active
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (plan.status !== 'Active') {
      return res.status(400).json({ error: 'Selected plan is not active' });
    }

    // Update company's plan
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        planId
      },
      include: {
        plan: true
      }
    });

    // Create an invoice for the plan change
    const invoice = await prisma.invoice.create({
      data: {
        number: await generateInvoiceNumber(),
        companyId,
        amount: plan.price,
        currency: company.currency,
        status: 'Pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: {
          items: [
            {
              description: `${plan.name} Plan - ${plan.billingCycle} Subscription`,
              quantity: 1,
              unitPrice: plan.price,
              total: plan.price
            }
          ],
          subtotal: plan.price,
          tax: 0,
          total: plan.price
        },
        createdById: req.user.id
      }
    });

    res.json(company.plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate invoice number
async function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
        lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    }
  });

  return `INV-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
}

module.exports = router;
