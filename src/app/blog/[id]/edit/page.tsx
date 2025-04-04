'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';

// Dynamically import our advanced post form
const AdvancedPostForm = dynamic(() => import('@/components/AdvancedPostForm'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading advanced editor...</div>
});

export default function EditPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  // Define a proper type for the post
  interface Post {
    id: string;
    title: string;
    content: string;
    published: boolean;
    featuredImage?: string | null;
    authorId: string;
    author?: {
      id: string;
      name?: string;
      image?: string;
    };
    publishedAt?: Date | null;
    showOnHomepage?: boolean;
  }

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent(`/blog/${postId}/edit`));
      return;
    }

    // Fetch post data
    if (status === 'authenticated' && postId) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/posts/${postId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch post');
          }
          
          const data = await response.json();
          setPost(data);
        } catch (err) {
          setError('Error loading post. It may have been deleted or you may not have permission to edit it.');
          console.error('Error fetching post:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [postId, status, router]);

  // Check if user has permission to edit (post author or admin)
  const canEdit = post && session?.user && (
    post.authorId === session.user.id || 
    session.user.role === 'ADMIN' || 
    session.user.role === 'SUPERUSER'
  );

  if (!isMounted) {
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Handle errors or unauthorized access
  if (error || !canEdit) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">
            {error || "You don't have permission to edit this post."}
          </p>
        </div>
        <button
          onClick={() => router.push(`/blog/${postId}`)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Post
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/blog/${postId}`)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Back to post"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">
              Make changes to your post using the advanced editor
            </p>
          </div>
        </div>

        {post && (
          <AdvancedPostForm 
            initialData={{
              id: post.id,
              title: post.title,
              content: post.content,
              featuredImage: post.featuredImage || undefined,
              published: post.published,
              showOnHomepage: post.showOnHomepage || false,
              publishedAt: post.publishedAt || null
            }}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
} 