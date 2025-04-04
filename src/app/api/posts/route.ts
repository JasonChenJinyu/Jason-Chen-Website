import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import { prisma } from '@/lib/prisma';

// GET all published posts, with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showOnHomepageOnly = searchParams.get('homepage') === 'true';
    const authorId = searchParams.get('authorId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;
    
    // Build query filters with specific type
    const filters: {
      published: boolean;
      showOnHomepage?: boolean;
      authorId?: string;
    } = {
      published: true,
    };
    
    // Add optional filters
    if (showOnHomepageOnly) {
      filters.showOnHomepage = true;
    }
    
    if (authorId) {
      filters.authorId = authorId;
    }
    
    const posts = await prisma.post.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      take: limit
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST new blog post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    const requestData = await request.json() as {
      title: string;
      content: string;
      published: boolean;
      featuredImage?: string;
      showOnHomepage?: boolean;
      publishedAt?: string;
    };

    const { title, content, featuredImage, published, showOnHomepage, publishedAt } = requestData;
    
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get user id
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        featuredImage: featuredImage || null,
        published: published || false,
        showOnHomepage: showOnHomepage || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        author: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 