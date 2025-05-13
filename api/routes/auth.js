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


// Verify Authentik token
router.post('/verify-authentik-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify the JWT token from Authentik
    const decoded = jwt.verify(token, process.env.AUTHENTIK_JWT_SECRET || 'q1X-z9Lc5N3U8A9b2X-f7Gh4KpWmD6eRuTxZm7PaCbYq2LVrMhFgVnJtwXhCGm94E');

    // Extract user information from the token
    const { sub, email, groups, given_name, family_name } = decoded;
    
    if (!email && !sub) {
      return res.status(400).json({ error: 'Invalid token: missing email or subject' });
    }

    const userEmail = email || `${sub}@clink.com`;

    // Find or create user based on email
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    // If user doesn't exist, create a new one
    if (!user) {
      // Extract name from token or use defaults
      const firstName = given_name || (sub ? sub.split('.')[0] : 'User');
      const lastName = family_name || (sub && sub.includes('.') ? sub.split('.')[1] : '');

      // Find appropriate role based on Authentik groups
      let roleName = 'Viewer'; // Default role
      if (groups) {
        if (groups.includes('superadmins')) {
          roleName = 'Super Admin';
        } else if (groups.includes('admins') || groups.includes('platformadmins')) {
          roleName = 'Platform Admin';
        } else if (groups.includes('companyadmins')) {
          roleName = 'Company Admin';
        } else if (groups.includes('managers')) {
          roleName = 'Manager';
        }
      }

      // Find role in database
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        return res.status(500).json({ error: `Role '${roleName}' not found` });
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: userEmail,
          firstName,
          lastName,
          password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
          status: 'Active',
          joinedAt: new Date(),
          roles: {
            create: [{
              roleId: role.id
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
    }

    // Create a new JWT token for our application
    const appToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get company ID from either billing company or first company association
    const defaultCompanyId = user.userCompanies?.[0]?.companyId;
    const billingCompanyId = user.billingCompany?.id;
    const companyId = billingCompanyId || defaultCompanyId;

    res.json({
      token: appToken,
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
    console.error('Verify Authentik token error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Exchange Authentik code for token
router.post('/authentik-token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange the code for a token with Authentik
    const tokenResponse = await fetch('http://localhost:9000/application/o/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'clink-app', // Changed from 'clink-superset' to 'clink-app'
        client_secret: process.env.AUTHENTIK_CLIENT_SECRET || 'clink-app-secret', // Updated secret to match client ID
        code,
        redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/authentik-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Authentik token exchange error:', errorData);
      return res.status(401).json({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();
    
    res.json({
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  } catch (error) {
    console.error('Authentik token exchange error:', error);
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
