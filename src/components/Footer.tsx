import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="glass-darker py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-300 text-sm">
              &copy; {currentYear} Jason Chen. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/blog" className="text-gray-300 hover:text-white text-sm transition-colors">
              Blog
            </Link>
            <Link href="/files" className="text-gray-300 hover:text-white text-sm transition-colors">
              Mac Files
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 