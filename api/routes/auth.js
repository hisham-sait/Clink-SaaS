const express = require('express');
const router = express.Router();
const { PrismaClient, UserStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email }); // Debug log

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('Found user:', user ? { id: user.id, status: user.status } : null); // Debug log

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== UserStatus.Active) {
      console.log('User not active:', { status: user.status }); // Debug log
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.role.name)
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { userId: user.id }); // Debug log

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { company, admin } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create company
    const newCompany = await prisma.company.create({
      data: {
        name: company.name,
        status: 'Active',
        primaryContact: {
          create: {
            name: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
            phone: admin.phone || '',
            role: 'Company Admin'
          }
        }
      }
    });

    // Get Company Admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Company Admin' }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        ...admin,
        password: hashedPassword,
        status: UserStatus.Active,
        joinedAt: new Date(),
        roles: {
          create: [{
            roleId: adminRole.id
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

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roles: newUser.roles.map(r => r.role.name)
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return success even if user not found for security
      return res.json({ message: 'If an account exists, you will receive a password reset email' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send reset email
    console.log('Reset token for', email, ':', resetToken);

    res.json({ message: 'If an account exists, you will receive a password reset email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
