'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [videoScale, setVideoScale] = useState(1.5);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [isInView, setIsInView] = useState(true);
  
  // Handle video load and play
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleCanPlay = () => {
      setVideoLoaded(true);
      
      // Try to play the video
      if (document.visibilityState === 'visible') {
        try {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              console.log('Autoplay prevented - user interaction required');
            });
          }
        } catch (err) {
          console.error('Error playing video:', err);
        }
      }
    };
    
    videoElement.addEventListener('canplay', handleCanPlay);
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, []);
  
  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const videoElement = videoRef.current;
      if (!videoElement || !videoLoaded) return;
      
      if (document.visibilityState === 'visible') {
        if (isInView) {
          try {
            videoElement.play().catch(error => {
              console.log('Play prevented on visibility change', error);
            });
          } catch (err) {
            console.error('Error playing video on visibility change:', err);
          }
        }
      } else {
        videoElement.pause();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoLoaded, isInView]);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if the video is in view
      const isCurrentlyInView = rect.bottom > 0 && rect.top < viewportHeight;
      setIsInView(isCurrentlyInView);
      
      // Handle video playback based on visibility
      if (videoRef.current) {
        if (isCurrentlyInView) {
          if (videoRef.current.paused) {
            try {
              videoRef.current.play().catch(error => {
                console.log('Play prevented on scroll:', error);
              });
            } catch (err) {
              console.error('Error playing video on scroll:', err);
            }
          }
        } else {
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      }
      
      if (isCurrentlyInView) {
        // Calculate scroll progress
        const scrollProgress = Math.min(
          Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0),
          1
        );
        
        // Apply visual effects based on scroll
        setVideoScale(1.5 - scrollProgress * 0.1);
        setOverlayOpacity(0.5 + scrollProgress * 0.3);
        setVideoOpacity(1 - scrollProgress * 0.3);
        
        // Adjust volume based on scroll if not muted
        if (videoRef.current && !videoRef.current.muted) {
          const newVolume = Math.max(0, 1 - scrollProgress * 1.5);
          videoRef.current.volume = newVolume;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMutedState = !videoRef.current.muted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    
    if (!newMutedState) {
      videoRef.current.volume = isInView ? 0.8 : 0;
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Loading indicator */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Video container */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${videoScale})`,
          opacity: videoOpacity,
          transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
        }}
      >
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          playsInline
          muted={isMuted}
          loop
          preload="auto"
          poster="/video-poster.jpg"
        >
          <source src="/placeholder.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Content overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white text-center px-4 glass-darker"
        style={{
          opacity: overlayOpacity
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
          Jason Chen's Blog
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8">
          Thoughts, stories, and ideas about technology, programming, and digital life
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/blog" 
            className="px-6 py-3 bg-glass-lighter hover:bg-glass text-white rounded-full border border-white/30 transition-colors"
          >
            Read Articles
          </Link>
          <Link 
            href="/mac-files" 
            className="px-6 py-3 bg-glass hover:bg-glass-lighter rounded-full border border-white/20 transition-colors"
          >
            Mac Resources
          </Link>
        </div>
      </div>

      {/* Sound control button */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-50 glass rounded-full p-3 hover:bg-glass-darker transition-colors"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  );
} 