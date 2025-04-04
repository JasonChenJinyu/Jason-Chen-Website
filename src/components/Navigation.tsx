'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Check if user is admin or superuser
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERUSER';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-900">
          Jason Chen
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/blog" className="text-gray-700 hover:text-blue-800 font-medium transition-colors">
            Blog
          </Link>
          {session && (
            <Link href="/new-post" className="text-gray-700 hover:text-blue-800 font-medium transition-colors">
              New Post
            </Link>
          )}
          <Link href="/mac-files" className="text-gray-700 hover:text-blue-800 font-medium transition-colors">
            Mac Files
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-gray-700 hover:text-blue-800 font-medium transition-colors">
              Admin Panel
            </Link>
          )}
          {status === 'loading' ? (
            <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-purple-900 text-white rounded-full hover:shadow-md transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-purple-900 text-white rounded-full hover:shadow-md transition-all"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t mt-2 shadow-lg">
          <div className="container mx-auto px-6 py-4 space-y-3">
            <Link
              href="/blog"
              className="block py-2 text-gray-700 hover:text-blue-800 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            {session && (
              <Link
                href="/new-post"
                className="block py-2 text-gray-700 hover:text-blue-800 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Post
              </Link>
            )}
            <Link
              href="/mac-files"
              className="block py-2 text-gray-700 hover:text-blue-800 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mac Files
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block py-2 text-gray-700 hover:text-blue-800 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {status === 'loading' ? (
              <div className="h-10 bg-gray-200 rounded-md my-2"></div>
            ) : session ? (
              <div className="pt-2 border-t">
                <div className="py-2 flex items-center gap-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-purple-900 text-white rounded-full hover:shadow-md transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block mt-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-purple-900 text-white rounded-full hover:shadow-md transition-all text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 