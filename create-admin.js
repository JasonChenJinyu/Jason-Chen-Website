// Script to create an admin user
// This file requires Node.js to run directly, so we can't use the ES module import syntax
// or the singleton pattern from our lib/prisma.ts file
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Create a dedicated Prisma instance for this script
// Since it runs as a standalone Node.js script outside the Next.js application
const prisma = new PrismaClient();

async function main() {
  // Define admin user details
  const adminData = {
    name: 'Admin User',
    email: 'admin@jasonchen.com',
    password: await bcrypt.hash('admin123', 10), // Password: admin123
    role: 'ADMIN'
  };

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingUser) {
      // Update the existing user to admin if needed
      const updatedUser = await prisma.user.update({
        where: { email: adminData.email },
        data: { role: 'ADMIN' }
      });
      console.log(`User ${updatedUser.email} updated to admin role.`);
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: adminData
      });
      console.log(`Admin user created: ${newAdmin.email}`);
    }

    // Create a superuser as well
    const superUserData = {
      name: 'Super User',
      email: 'super@jasonchen.com',
      password: await bcrypt.hash('super123', 10), // Password: super123
      role: 'SUPERUSER'
    };

    const existingSuperUser = await prisma.user.findUnique({
      where: { email: superUserData.email }
    });

    if (existingSuperUser) {
      const updatedSuperUser = await prisma.user.update({
        where: { email: superUserData.email },
        data: { role: 'SUPERUSER' }
      });
      console.log(`User ${updatedSuperUser.email} updated to superuser role.`);
    } else {
      const newSuperUser = await prisma.user.create({
        data: superUserData
      });
      console.log(`Super user created: ${newSuperUser.email}`);
    }

  } catch (error) {
    console.error('Error creating admin/superuser:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 