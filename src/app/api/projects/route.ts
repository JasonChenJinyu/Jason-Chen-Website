import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Get all published projects
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  const publishedParam = searchParams.get('published');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  try {
    // Determine what to filter by published status
    let publishedFilter: boolean | undefined;
    if (publishedParam === 'all') {
      publishedFilter = undefined; // Don't filter by published status
    } else {
      publishedFilter = publishedParam !== 'false'; // Default to true if not specified
    }

    // Build the query
    const whereClause: any = {};
    if (publishedFilter !== undefined) {
      whereClause.published = publishedFilter;
    }
    if (featured === 'true') {
      whereClause.featured = true;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: [
        { featured: 'desc' },
        { featuredOrder: 'asc' },
        { publishedAt: 'desc' }
      ],
      take: limit,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project (authenticated admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERUSER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        content: body.content || '',
        gradientStart: body.gradientStart || 'from-blue-500',
        gradientEnd: body.gradientEnd || 'to-purple-500',
        emoji: body.emoji || '🚀',
        technologies: body.technologies || '[]',
        projectUrl: body.projectUrl || null,
        githubUrl: body.githubUrl || null,
        featured: body.featured || false,
        featuredOrder: body.featuredOrder || 0,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        author: {
          connect: { id: session.user.id }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 