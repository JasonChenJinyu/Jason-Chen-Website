import Link from 'next/link';
import Image from 'next/image';
import { Prisma } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/authOptions';
import { prisma } from '@/lib/prisma';

// Define a type for posts with included author data
type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; name: true; image: true } } };
}>;

async function getAllPosts(): Promise<PostWithAuthor[]> {
  try {
    return await prisma.post.findMany({
      where: {
        published: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts();
  const session = await getServerSession(authOptions);
  const isAdminOrSuperuser = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERUSER';

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Blog Posts</h1>
        {session && (
          <Link 
            href="/new-post" 
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Write New Post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">No posts yet</h2>
          <p className="text-gray-600 mb-8">Check back soon for new content!</p>
          {session && (
            <Link 
              href="/new-post" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="sm:flex gap-6">
                {post.featuredImage && (
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <div className="relative h-48 sm:h-full w-full rounded-md overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className={post.featuredImage ? "sm:w-2/3" : "w-full"}>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    {isAdminOrSuperuser && (
                      <div className="flex gap-2">
                        <Link 
                          href={`/blog/${post.id}/edit`}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          Edit
                        </Link>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content.substring(0, 250)}
                    {post.content.length > 250 ? '...' : ''}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      {post.author?.image && (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || 'Author'}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                      )}
                      <span className="mr-2">{post.author?.name || 'Anonymous'}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <Link href={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                      Read more →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 