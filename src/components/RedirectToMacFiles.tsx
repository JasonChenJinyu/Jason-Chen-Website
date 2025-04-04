'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToMacFiles() {
  const router = useRouter();

  useEffect(() => {
    const redirect = setTimeout(() => {
      router.push('/files');
    }, 1000); // Add a small delay to reduce flickering

    return () => clearTimeout(redirect);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="glass p-10 rounded-xl flex flex-col items-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-xl text-white mb-2">Redirecting to File Browser...</p>
        <p className="text-gray-400 text-center">
          Access Mac mini files and resources for download
        </p>
      </div>
    </div>
  );
} 