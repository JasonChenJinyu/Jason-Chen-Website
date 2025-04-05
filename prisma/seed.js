const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create superuser if doesn't exist
  const superuserEmail = 'superuser@example.com';
  let superuser = await prisma.user.findUnique({
    where: {
      email: superuserEmail
    }
  });

  if (!superuser) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    superuser = await prisma.user.create({
      data: {
        email: superuserEmail,
        name: 'Super User',
        password: hashedPassword,
        role: 'SUPERUSER',
      },
    });
    console.log(`Created superuser: ${superuser.email}`);
  }

  // Check if an admin user exists
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  let adminUser = await prisma.user.findUnique({
    where: {
      email: adminEmail
    }
  });

  // Create admin user if doesn't exist
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  }

  // Define default projects
  const defaultProjects = [
    {
      title: 'Personal Website',
      description: 'Modern portfolio website built with Next.js and Tailwind CSS',
      content: `
# Personal Website

This is my personal website built with Next.js, Tailwind CSS, and TypeScript. It features a clean, modern design with a focus on performance and accessibility.

## Features

- Responsive design that works on all devices
- Dark mode support
- Blog with markdown support
- Portfolio showcasing my projects
- Contact form with email integration

## Technology Stack

- Next.js for server-side rendering and static site generation
- Tailwind CSS for styling
- TypeScript for type safety
- Prisma for database ORM
- NextAuth.js for authentication
- Vercel for hosting and deployment
      `,
      gradientStart: 'from-blue-600',
      gradientEnd: 'to-indigo-600',
      emoji: '💻',
      technologies: JSON.stringify(['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma']),
      featured: true,
      featuredOrder: 1,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    },
    {
      title: 'E-Commerce Platform',
      description: 'Full-featured online store with product catalog, cart, and checkout',
      content: `
# E-Commerce Platform

A complete e-commerce solution with product management, shopping cart, and secure checkout.

## Features

- Product catalog with categories and search
- User accounts and profiles
- Shopping cart and wishlist
- Secure checkout with Stripe integration
- Order tracking and history
- Admin dashboard for product and order management

## Technology Stack

- React for the frontend
- Node.js and Express for the backend
- MongoDB for database
- Redux for state management
- Stripe for payment processing
- AWS S3 for image storage
      `,
      gradientStart: 'from-green-500',
      gradientEnd: 'to-emerald-500',
      emoji: '🛒',
      technologies: JSON.stringify(['React', 'Node.js', 'Express', 'MongoDB', 'Redux', 'Stripe']),
      featured: true,
      featuredOrder: 2,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    },
    {
      title: 'AI Image Generator',
      description: 'Web application that creates unique images based on text prompts',
      content: `
# AI Image Generator

An innovative web application that uses AI to generate unique images from text descriptions.

## Features

- Text-to-image generation using state-of-the-art AI models
- User gallery of generated images
- Sharing capabilities for social media
- Image editing and enhancement tools
- API for integration with other applications

## Technology Stack

- React for the frontend
- Python and Flask for the backend
- TensorFlow and PyTorch for AI models
- Redis for caching
- PostgreSQL for database
- Docker for containerization
      `,
      gradientStart: 'from-purple-500',
      gradientEnd: 'to-pink-500',
      emoji: '🎨',
      technologies: JSON.stringify(['React', 'Python', 'Flask', 'TensorFlow', 'PostgreSQL', 'Docker']),
      featured: true,
      featuredOrder: 3,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    }
  ];

  // Create default projects if they don't exist
  for (const projectData of defaultProjects) {
    const existingProject = await prisma.project.findFirst({
      where: {
        title: projectData.title,
        authorId: adminUser.id
      }
    });

    if (!existingProject) {
      const project = await prisma.project.create({
        data: projectData
      });
      console.log(`Created project: ${project.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 