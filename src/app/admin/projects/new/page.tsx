'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function NewProject() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERUSER')) {
      router.push('/login');
      return;
    }
    
    router.push('/admin/projects/edit/new');
  }, [router, session, status]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-white animate-spin" />
      <span className="ml-4 text-xl text-white">Redirecting...</span>
    </div>
  );
} 