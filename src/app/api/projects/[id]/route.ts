import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If project is not published, check if user is admin
    if (!project.published) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERUSER')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Ensure technologies is valid
    let technologies = body.technologies;
    if (typeof technologies === 'string') {
      try {
        JSON.parse(technologies); // Just to validate
      } catch (error) {
        return NextResponse.json(
          { error: 'Technologies must be a valid JSON string' },
          { status: 400 }
        );
      }
    }

    // If project is being published for the first time, set publishedAt
    const currentProject = await prisma.project.findUnique({
      where: { id },
      select: { published: true }
    });

    const publishedAt = 
      !currentProject?.published && body.published
        ? new Date()
        : undefined;

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        content: body.content,
        gradientStart: body.gradientStart,
        gradientEnd: body.gradientEnd,
        emoji: body.emoji,
        technologies: technologies,
        projectUrl: body.projectUrl,
        githubUrl: body.githubUrl,
        featured: body.featured,
        featuredOrder: body.featuredOrder,
        published: body.published,
        ...(publishedAt && { publishedAt }),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPERUSER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 