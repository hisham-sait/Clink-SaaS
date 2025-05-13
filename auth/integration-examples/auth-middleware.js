/**
 * Example integration of Authelia with the existing auth middleware
 * This file shows how to modify api/middleware/auth.js to work with Authelia SSO
 */

const jwt = require('jsonwebtoken');
const prisma = require('../../api/services/prisma');

/**
 * Combined middleware that supports both existing JWT auth and Authelia SSO
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Determine if this is an Authelia token or a regular app token
    // Authelia tokens typically have different claims structure
    let decoded;
    let isAutheliaToken = false;
    
    try {
      // First try to verify with the app's JWT secret
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (appTokenError) {
      try {
        // If that fails, try to verify with Authelia's JWT secret
        decoded = jwt.verify(token, process.env.AUTHELIA_JWT_SECRET);
        isAutheliaToken = true;
      } catch (autheliaTokenError) {
        throw new Error('Invalid token');
      }
    }

    // Handle Authelia token
    if (isAutheliaToken) {
      // Authelia tokens have different structure
      // Typically: sub (subject/username), email, groups, etc.
      
      // Find user by email from Authelia token
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
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
        // Option 1: Fail if user doesn't exist
        throw new Error('User not found in system');
        
        // Option 2: Auto-provision user (commented out)
        /*
        // Create user in the system based on Authelia info
        const newUser = await prisma.user.create({
          data: {
            email: decoded.email,
            firstName: decoded.given_name || 'New',
            lastName: decoded.family_name || 'User',
            // Add other required fields
            // Map Authelia groups to roles if needed
          }
        });
        // Set user for the request
        req.user = {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roles: [], // Default roles
          companyId: null // No company yet
        };
        next();
        return;
        */
      }

      // Map Authelia groups to roles if needed
      const autheliaGroups = decoded.groups || [];
      
      // Get company ID from header or fallback to user's default company
      const headerCompanyId = req.header('X-Company-ID');
      const defaultCompanyId = user.userCompanies?.[0]?.companyId;
      const billingCompanyId = user.billingCompany?.id;
      const companyId = headerCompanyId || billingCompanyId || defaultCompanyId;

      // Skip company access check for auth routes
      const isAuthRoute = req.baseUrl === '/api/auth';
      if (!isAuthRoute && companyId && !user.userCompanies.some(uc => uc.companyId === companyId)) {
        throw new Error('User does not have access to this company');
      }

      req.token = token;
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(r => r.role.name),
        companyId,
        // Add Authelia-specific info
        autheliaGroups
      };
      
      next();
      return;
    }
    
    // Handle regular app token (existing logic)
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

    // Skip company access check for auth routes
    const isAuthRoute = req.baseUrl === '/api/auth';
    if (!isAuthRoute && companyId && !user.userCompanies.some(uc => uc.companyId === companyId)) {
      throw new Error('User does not have access to this company');
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
