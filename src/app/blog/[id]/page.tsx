import Link from 'next/link';
import Image from 'next/image';
import { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/authOptions';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { Metadata } from 'next';

// Define a type for posts with included author data
type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; name: true; image: true } } };
}>;

async function getPost(id: string): Promise<PostWithAuthor | null> {
  try {
    return await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

// Use the any type to bypass the type checking issue with Next.js 15
export default async function BlogPostPage({ params, searchParams }: any) {
  const postId = params.id as string;
  const post = await getPost(postId);
  const session = await getServerSession(authOptions);
  const isAdminOrSuperuser = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERUSER';
  const isAuthor = session?.user?.email && post?.author?.id === session?.user?.id;
  const canEdit = isAdminOrSuperuser || isAuthor;

  if (!post) {
    notFound();
  }

  if (!post.published && !canEdit) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to all posts
        </Link>
      </div>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            <div className="flex items-center">
              {post.author?.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 bg-glass rounded-full mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-medium text-white">{post.author?.name || 'Anonymous'}</p>
                <div className="flex items-center text-sm text-gray-400 gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            
            {canEdit && (
              <div className="ml-auto">
                <Link
                  href={`/blog/${post.id}/edit`}
                  className="bg-glass-lighter text-white px-4 py-2 rounded-md hover:bg-glass transition-colors"
                >
                  Edit Post
                </Link>
              </div>
            )}
          </div>

          {post.featuredImage && (
            <div className="w-full h-96 relative rounded-lg overflow-hidden mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        <div 
          className="prose prose-invert max-w-none prose-lg prose-blue"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
} 