'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import our advanced post form to prevent SSR issues
const AdvancedPostForm = dynamic(() => import('@/components/AdvancedPostForm'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading advanced editor...</div>
});

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check authentication status and redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/new-post');
    }
  }, [status, router]);

  // Don't render anything server-side to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Redirect if not logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Ensure user is authenticated
  if (!session) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">You must be logged in to create a new post.</p>
        </div>
        <button
          onClick={() => router.push('/login?redirect=/new-post')}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Blog Post</h1>
          <p className="text-gray-600 mt-1">
            Use the advanced editor to create a rich, engaging blog post with images, videos, and more.
          </p>
        </div>

        <AdvancedPostForm />
      </div>
    </div>
  );
} 