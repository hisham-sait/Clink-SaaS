const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;
    console.log('Login credentials:', { email, password: '***' });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        userCompanies: {
          select: {
            companyId: true,
            role: true
          }
        },
        billingCompany: true
      }
    });

    if (!user) {
      console.log('User not found:', req.body.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      roles: user.roles.map(r => r.role.name)
    });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', req.body.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password match successful');

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Generated token:', token);

    // Get company ID from either billing company or first company association
    const defaultCompanyId = user.userCompanies?.[0]?.companyId;
    const billingCompanyId = user.billingCompany?.id;
    const companyId = billingCompanyId || defaultCompanyId;

    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name),
        companyId
      }
    };

    console.log('Login response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { company, admin } = req.body;

    // Create company
    const newCompany = await prisma.company.create({
      data: {
        name: company.name,
        legalName: company.legalName,
        registrationNumber: company.registrationNumber,
        vatNumber: company.vatNumber,
        status: 'Active',
        isPrimary: true,
        isMyOrg: true,
        billingDetails: {
          create: {
            address: company.address,
            city: company.city,
            state: company.state,
            country: company.country,
            postalCode: company.postalCode,
            taxId: company.taxId,
            currency: company.currency || 'EUR',
            paymentTerms: 30
          }
        }
      }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: admin.email,
        password: hashedPassword,
        firstName: admin.firstName,
        lastName: admin.lastName,
        status: 'Active',
        joinedAt: new Date(),
        billingCompanyId: newCompany.id,
        roles: {
          create: [{
            role: {
              connect: {
                name: 'Company Admin'
              }
            }
          }]
        },
        userCompanies: {
          create: [{
            companyId: newCompany.id,
            role: 'Company Admin'
          }]
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Update company with created by
    await prisma.company.update({
      where: { id: newCompany.id },
      data: { createdById: user.id }
    });

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name),
        companyId: newCompany.id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update company
router.post('/update-company', auth, async (req, res) => {
  try {
    const { companyId } = req.body;

    // Verify company exists and user has access
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: req.user.id,
        companyId
      }
    });

    if (!userCompany) {
      return res.status(403).json({ error: 'Access denied to this company' });
    }

    // Update user's billing company
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { billingCompanyId: companyId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create new token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name),
        companyId
      }
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send reset email
    console.log('Reset token:', resetToken);

    res.json({ message: 'Password reset instructions sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
router.post('/refresh-token', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        userCompanies: {
          select: {
            companyId: true,
            role: true
          }
        },
        billingCompany: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get company ID from either billing company or first company association
    const defaultCompanyId = user.userCompanies?.[0]?.companyId;
    const billingCompanyId = user.billingCompany?.id;
    const companyId = billingCompanyId || defaultCompanyId;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name),
        companyId
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
