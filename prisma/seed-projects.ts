import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Ensure there's at least one admin user
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
  
  // Check if admin exists
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  // Create admin if doesn't exist
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Created admin user');
  }
  
  // Sample default projects
  const defaultProjects = [
    {
      title: 'Personal Blog Platform',
      description: 'A modern and responsive blog platform built with Next.js, Tailwind CSS, and Prisma.',
      content: `
# Personal Blog Platform

This project is a full-featured blog platform built with modern web technologies.

## Features

- Responsive design that works on all devices
- Markdown support for writing posts
- User authentication and authorization
- Admin dashboard for content management
- Comment system for reader engagement
      `,
      gradientStart: 'from-blue-500',
      gradientEnd: 'to-purple-600',
      emoji: '🚀',
      technologies: JSON.stringify(['Next.js', 'React', 'TypeScript']),
      featured: true,
      featuredOrder: 1,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    },
    {
      title: 'File Sharing System',
      description: 'Secure file management and sharing system with user authentication and access control.',
      content: `
# File Sharing System

A secure, cloud-based file sharing system for teams and individuals.

## Features

- End-to-end encryption for all files
- Role-based access control
- Version history for all documents
- Secure sharing via temporary links
- Integration with popular cloud storage providers
      `,
      gradientStart: 'from-emerald-500',
      gradientEnd: 'to-teal-600',
      emoji: '📊',
      technologies: JSON.stringify(['Node.js', 'Express', 'Prisma']),
      featured: true,
      featuredOrder: 2,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    },
    {
      title: 'Interactive Portfolio',
      description: 'A creative portfolio with interactive elements and animations showcasing my work.',
      content: `
# Interactive Portfolio

An engaging, interactive portfolio website that stands out from the crowd.

## Features

- 3D animations and interactions
- Dynamic content loading
- Interactive project showcases
- Animations triggered by scroll events
- Custom-built interactive resume
      `,
      gradientStart: 'from-amber-500',
      gradientEnd: 'to-orange-600',
      emoji: '🎮',
      technologies: JSON.stringify(['Three.js', 'GSAP', 'JavaScript']),
      featured: true,
      featuredOrder: 3,
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id
    }
  ];
  
  // Create projects if they don't exist
  for (const projectData of defaultProjects) {
    const existingProject = await prisma.project.findFirst({
      where: { title: projectData.title }
    });
    
    if (!existingProject) {
      const project = await prisma.project.create({
        data: projectData
      });
      console.log(`Created project: ${project.title}`);
    }
  }
  
  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 