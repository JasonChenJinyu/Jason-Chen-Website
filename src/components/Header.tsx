'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'glass-darker shadow-md' : 'glass'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white text-2xl font-bold hover:text-gray-300 transition-colors">
            Jason Chen
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/') ? 'text-white' : 'text-gray-400'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/blog" 
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/blog') ? 'text-white' : 'text-gray-400'
              }`}
            >
              Blog
            </Link>
            <Link 
              href="/mac-files" 
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/mac-files') || isActive('/files') ? 'text-white' : 'text-gray-400'
              }`}
            >
              Mac Files
            </Link>
            {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
              <Link 
                href="/admin" 
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive('/admin') ? 'text-white' : 'text-gray-400'
                }`}
              >
                Admin
              </Link>
            )}
            
            {status === 'authenticated' ? (
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 rounded bg-glass-lighter hover:bg-glass-darker text-white text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link 
                href="/login" 
                className={`px-4 py-2 rounded bg-glass-lighter hover:bg-glass-darker text-white text-sm font-medium transition-colors ${
                  isActive('/login') ? 'bg-glass-darker' : ''
                }`}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 glass-lighter rounded-lg">
            <div className="flex flex-col space-y-2 p-3">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-glass-darker text-white' : 'text-gray-300 hover:bg-glass'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/blog" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/blog') ? 'bg-glass-darker text-white' : 'text-gray-300 hover:bg-glass'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/mac-files" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/mac-files') || isActive('/files') ? 'bg-glass-darker text-white' : 'text-gray-300 hover:bg-glass'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mac Files
              </Link>
              {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'bg-glass-darker text-white' : 'text-gray-300 hover:bg-glass'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              
              {status === 'authenticated' ? (
                <button 
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-glass-darker text-white hover:bg-opacity-90 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/login') ? 'bg-glass-darker text-white' : 'text-gray-300 hover:bg-glass'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 