const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetUserPassword() {
  try {
    // Email of the user to reset password
    const email = 'hisham@seegap.com';
    
    // New password to set
    const newPassword = 'Password123!';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });
    
    console.log(`Password reset successful for user:`);
    console.log(updatedUser);
    console.log(`\nNew password: ${newPassword}`);
    console.log('\nPlease try logging in with these credentials.');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserPassword();
