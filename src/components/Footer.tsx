import Link from 'next/link';
import Image from 'next/image';

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
            <p className="text-gray-300 text-sm">
              陈劲羽  版权所有  保留一切权利
            </p>
            <p className="text-gray-300 text-sm mt-2">
              <Link 
                href="https://beian.miit.gov.cn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                京ICP备2025119159号-1
              </Link>
            </p>
          </div>
          
          <div className="flex items-center">
            <Image
              src="/CJY2.png"
              alt="CJY Logo"
              width={150}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
} 