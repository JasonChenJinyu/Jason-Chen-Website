'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HeroTitle() {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate opacity based on first 40% of viewport height scroll
      const fadeInProgress = Math.min(scrollPosition / (windowHeight * 0.4), 1);
      setOpacity(fadeInProgress);
      
      // Add a pause between full opacity and movement
      // Only start moving after 50% viewport height (giving 10% "pause zone")
      if (scrollPosition > windowHeight * 0.5) {
        // Calculate movement after pause threshold for perfect synchronization
        const extraScroll = scrollPosition - (windowHeight * 0.5);
        
        // Use a linear mapping without easing for stable movement
        // Scaling factor controls speed but keeps it proportional to scroll
        setTranslateY(extraScroll);
      } else {
        // Keep fixed during the pause and initial fade-in
        setTranslateY(0);
      }
    };

    // Initial call to set starting position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div 
        className="h-screen flex flex-col items-center justify-center z-10"
        style={{
          opacity: opacity,
          transform: `translateY(-${translateY}px)`,
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl text-white">
            Jason Chen
          </h1>
          
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-white">
            Thoughts, stories, and ideas about technology, programming, and digital life
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/blog" 
              className="px-6 py-3 bg-glass-lighter hover:bg-glass text-white rounded-full border border-white/30 transition-colors pointer-events-auto"
            >
              Read Articles
            </Link>
            <Link 
              href="/files" 
              className="px-6 py-3 bg-glass hover:bg-glass-lighter rounded-full border border-white/20 transition-colors pointer-events-auto"
            >
              Mac Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 