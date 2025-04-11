import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jinyu.asia';

  // Get all published posts
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Get all published projects
  const projects = await prisma.project.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Static routes
  const staticRoutes = [
    '',
    '/blog',
    '/projects',
    '/files',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for posts
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic routes for projects
  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: project.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
} 