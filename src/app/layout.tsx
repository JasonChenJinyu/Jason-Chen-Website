import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jinyu Chen | Jason Chen',
  description: 'Engineering for Good',
  icons: {
    icon: '/webicon.png',
  },
  metadataBase: new URL('https://jinyu.asia'),
  openGraph: {
    title: 'Jinyu Chen | Jason Chen',
    description: 'Engineering for Good',
    url: 'https://jinyu.asia',
    siteName: 'Jinyu Chen',
    images: [
      {
        url: '/profile.jpg',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Jinyu Chen | Jason Chen',
    card: 'summary_large_image',
  },
  verification: {
    google: 'DO84DfCqb16Rakm271YEyy_TnVsQEUO5btkOiQOoZdY',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-white`} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
