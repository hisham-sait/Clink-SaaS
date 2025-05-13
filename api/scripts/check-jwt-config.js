const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function checkJwtConfig() {
  console.log('Checking JWT configuration...');
  
  // Check if JWT_SECRET is set
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('ERROR: JWT_SECRET is not set in the environment variables.');
    console.log('This is required for token generation and verification.');
  } else {
    console.log('JWT_SECRET is set.');
    // Don't log the actual secret for security reasons
    console.log('JWT_SECRET length:', jwtSecret.length);
  }
  
  // Check other relevant environment variables
  console.log('\nOther relevant environment variables:');
  
  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL is not set in the environment variables.');
  } else {
    console.log('DATABASE_URL is set.');
    // Don't log the full URL for security reasons
    console.log('DATABASE_URL starts with:', dbUrl.split('://')[0] + '://');
  }
  
  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  console.log('NODE_ENV:', nodeEnv || 'not set');
  
  // List all environment variables (without values for security)
  console.log('\nAll environment variables (names only):');
  const envVars = Object.keys(process.env).sort();
  envVars.forEach(key => {
    console.log(`- ${key}`);
  });
}

checkJwtConfig();
