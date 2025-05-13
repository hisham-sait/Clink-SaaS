const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const prisma = new PrismaClient();

dotenv.config();

async function testFolderApi() {
  try {
    // Get a company ID from the database
    const company = await prisma.company.findFirst({
      select: { id: true }
    });
    
    if (!company) {
      console.error('No company found in the database');
      return;
    }
    
    console.log('Using company ID:', company.id);
    
    // Get a user
    const user = await prisma.user.findFirst({
      where: {
        userCompanies: {
          some: {
            companyId: company.id
          }
        }
      },
      select: { 
        id: true, 
        email: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user) {
      console.error('No user found for the company');
      return;
    }
    
    console.log('Using user:', user.email);
    
    // Generate a JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.role.name)
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token:', token);
    
    // Test the API endpoint
    try {
      const url = `http://localhost:3000/api/media/${company.id}/folders`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url, {
        params: {
          parentId: 'null'
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': company.id
        }
      });
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
    } catch (error) {
      console.error('API request error:', error.message);
      if (error.response) {
        console.error('API response status:', error.response.status);
        console.error('API response data:', error.response.data);
      }
    }
    
    // Try a different endpoint to see if it's working
    try {
      const url = `http://localhost:3000/api/media/${company.id}`;
      console.log('\nTrying media endpoint:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': company.id
        }
      });
      
      console.log('Media API response status:', response.status);
      console.log('Media API response data:', response.data);
    } catch (error) {
      console.error('Media API request error:', error.message);
      if (error.response) {
        console.error('Media API response status:', error.response.status);
        console.error('Media API response data:', error.response.data);
      }
    }
  } catch (e) {
    console.error('Error testing folder API:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testFolderApi();
