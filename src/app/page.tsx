import Link from 'next/link';
import Image from 'next/image';
import VideoHero from '@/components/VideoHero';
import ProfileImage from '@/components/ProfileImage';
import { Prisma } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { prisma } from '@/lib/prisma';

{/* 
  VIDEO REPLACEMENT INSTRUCTIONS:
  
  To replace the video background:
  1. Prepare an MP4 video file (ideally <10MB for faster loading)
  2. Name it "placeholder.mp4" 
  3. Place it in the /public folder, replacing the existing file
  4. Also update the poster image by replacing /public/video-poster.jpg
  
  For best results:
  - Video resolution: at least 1280x720 (HD)
  - Duration: 10-30 seconds, loops automatically
  - Format: H.264 MP4 for best browser compatibility
*/}

// Define a type for posts with included author data
type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; name: true; image: true } } };
}>;

async function getFeaturedPosts(): Promise<PostWithAuthor[]> {
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
      take: 6, // Limit to 6 featured posts
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

export default async function Home() {
  const featuredPosts = await getFeaturedPosts();

  return (
    <main className="min-h-screen bg-background">
      <VideoHero />
      
      {/* Personal Introduction */}
      <div className="py-16 bg-glass-darker">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 flex justify-center">
              <ProfileImage />
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-white">Hi, I'm Jason Chen</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Welcome to my personal blog and portfolio website. I'm a technology enthusiast, 
                programmer, and digital creator. Here, I share my thoughts on technology, 
                programming tips, and various digital resources.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link 
                  href="/blog" 
                  className="px-6 py-3 bg-glass-lighter text-white rounded-full hover:bg-glass transition-colors"
                >
                  Read My Blog
                </Link>
                <Link 
                  href="/files" 
                  className="px-6 py-3 bg-glass text-white rounded-full hover:bg-glass-lighter transition-colors"
                >
                  Browse My Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 max-w-6xl my-20">
        <h2 className="text-3xl font-bold mb-10 text-center text-white">
          Latest Posts
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-8">
              No featured posts yet. Check back soon or{' '}
              <Link href="/blog" className="text-blue-400 hover:text-blue-300">
                browse all posts
              </Link>
              .
            </p>
          )}
          {featuredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <div className="glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform group-hover:-translate-y-1">
                {post.featuredImage ? (
                  <div className="h-48 relative">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-glass-darker flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No image</span>
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors duration-200">{post.title}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.content.substring(0, 120)}
                    {post.content.length > 120 ? '...' : ''}
                  </p>
                  <div className="flex items-center text-sm text-gray-400 mt-auto">
                    {post.author?.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || 'Author'}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-glass mr-2"></div>
                    )}
                    <span>{post.author?.name || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center px-6 py-3 rounded-full bg-glass-lighter text-white font-medium hover:bg-glass transition-colors duration-200">
            View All Posts 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
