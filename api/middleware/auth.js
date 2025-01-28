const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      throw new Error('User not found');
    }

    // Check if token is expired
    const tokenExp = new Date(decoded.exp * 1000);
    if (tokenExp < new Date()) {
      throw new Error('Token expired');
    }

    req.token = token;
    // Get company ID from header or fallback to user's default company
    const headerCompanyId = req.header('X-Company-ID');
    const defaultCompanyId = user.userCompanies?.[0]?.companyId;
    const billingCompanyId = user.billingCompany?.id;
    const companyId = headerCompanyId || billingCompanyId || defaultCompanyId;

    // Verify user has access to the company
    if (companyId && !user.userCompanies.some(uc => uc.companyId === companyId)) {
      throw new Error('User does not have access to this company');
    }

    if (!companyId) {
      console.error('[Auth Error]: No company found for user', {
        userId: user.id,
        userRoles: user.roles.map(r => r.role.name),
        headerCompanyId,
        billingCompanyId,
        defaultCompanyId
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.role.name),
      companyId
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentication failed', 
      message: error.message 
    });
  }
};

module.exports = auth;
