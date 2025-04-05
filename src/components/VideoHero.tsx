'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

/**
 * VideoHero Component
 * Handles video playback and fade effect on scroll
 */
export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState({
    isLoaded: false,
    isMuted: false, // Start unmuted
    opacity: 1,
    playbackError: false,
    currentVideo: 0 // 0 for first video, 1 for second video
  });

  // List of videos to play in sequence
  const videos = ['/placeholder.mp4', '/placeholder2.mp4'];
  
  // Reference for the next video to preload
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  // Eagerly preload videos
  useEffect(() => {
    // Create hidden video elements to preload the videos
    videos.forEach(videoSrc => {
      const preloadVideo = document.createElement('video');
      preloadVideo.style.display = 'none';
      preloadVideo.src = videoSrc;
      preloadVideo.muted = true;
      preloadVideo.crossOrigin = "anonymous";
      preloadVideo.preload = 'auto';
      preloadVideo.load();
      
      // Force play and pause to ensure the video is loaded into memory
      const playPromise = preloadVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          preloadVideo.pause();
          preloadVideo.currentTime = 0;
        }).catch(err => {
          console.warn('Preload video could not play:', err);
        });
      }
      
      document.body.appendChild(preloadVideo);
    });
    
    return () => {
      document.querySelectorAll('video[style="display: none;"]').forEach(el => {
        document.body.removeChild(el);
      });
    };
  }, []);

  // Handle video loading and autoplay
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set initial muted state
    videoElement.muted = state.isMuted;
    
    // Force preload
    videoElement.preload = 'auto';
    videoElement.load();

    // Optimistically set as loaded if video has enough data
    if (videoElement.readyState >= 3) {
      setState(prev => ({ ...prev, isLoaded: true }));
      startPlayback(videoElement);
    }

    // Event handlers for various video loading states
    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoaded: true }));
      startPlayback(videoElement);
    };
    
    const handleLoadedData = () => {
      setState(prev => ({ ...prev, isLoaded: true }));
      startPlayback(videoElement);
    };

    // Handle video errors
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      // Try to recover by switching to the next video
      const nextVideoIndex = (state.currentVideo + 1) % videos.length;
      videoElement.src = videos[nextVideoIndex];
      videoElement.load();
      startPlayback(videoElement).catch(() => {
        setState(prev => ({ ...prev, playbackError: true }));
      });
    };

    // Handle video ended - switch to the next video
    const handleEnded = () => {
      try {
        const nextVideoIndex = (state.currentVideo + 1) % videos.length;
        setState(prev => ({ ...prev, currentVideo: nextVideoIndex }));
        
        // Try a different approach for smoother transitions
        if (nextVideoRef.current && nextVideoRef.current.readyState >= 3) {
          // If the next video is preloaded, use it directly
          const currentSrc = nextVideoRef.current.src;
          videoElement.src = currentSrc;
        } else {
          // Fallback to direct loading
          videoElement.src = videos[nextVideoIndex];
        }
        
        videoElement.load();
        
        // Reset to the beginning and play
        videoElement.currentTime = 0;
        
        // Add a small delay before playing to ensure the video is ready
        setTimeout(() => {
          startPlayback(videoElement).catch(err => {
            console.error('Failed to play next video:', err);
            // Another video retry approach
            setTimeout(() => {
              videoElement.play().catch(() => {
                setState(prev => ({ ...prev, playbackError: true }));
              });
            }, 500);
          });
        }, 100);
      } catch (err) {
        console.error('Error during video transition:', err);
        setState(prev => ({ ...prev, playbackError: true }));
      }
    };

    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [state.currentVideo, state.isMuted]);

  // Preload the next video when the current one is playing
  useEffect(() => {
    // Preload the next video that will play after the current one
    const nextIndex = (state.currentVideo + 1) % videos.length;
    const nextVideoSrc = videos[nextIndex];
    
    if (nextVideoRef.current) {
      nextVideoRef.current.src = nextVideoSrc;
      nextVideoRef.current.load();
    }
  }, [state.currentVideo, videos]);

  // Start video playback
  const startPlayback = async (videoElement: HTMLVideoElement) => {
    try {
      // Make sure volume is set correctly before playing
      if (!videoElement.muted && videoRef.current) {
        videoElement.volume = Math.max(0, state.opacity);
      }
      
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Video playback started successfully');
        return true;
      }
      return true;
    } catch (err) {
      console.warn('Autoplay failed:', err);
      // Only set error state if we can't recover
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setState(prev => ({ ...prev, playbackError: true }));
      }
      throw err;
    }
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate opacity based on scroll position (0 to 1)
      const fadeProgress = Math.min(scrollPosition / windowHeight, 1);
      const newOpacity = 1 - fadeProgress;
      
      setState(prev => ({ ...prev, opacity: newOpacity }));

      // Adjust video volume based on opacity
      if (videoRef.current && !videoRef.current.muted) {
        videoRef.current.volume = Math.max(0, newOpacity);
      }
    };

    // Call initially to set the correct starting position
    handleScroll();
    
    // Use passive: true for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newMutedState = !videoElement.muted;
    videoElement.muted = newMutedState;
    setState(prev => ({ ...prev, isMuted: newMutedState }));

    if (!newMutedState) {
      videoElement.volume = state.opacity;
    }
  };

  const retryPlayback = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    try {
      // Reset video source to the first video for a fresh start
      setState(prev => ({ 
        ...prev, 
        playbackError: false,
        currentVideo: 0
      }));
      
      videoElement.muted = true; // Start muted to ensure playback works
      videoElement.src = videos[0];
      videoElement.load();
      
      // Delay playback to ensure video is properly loaded
      setTimeout(async () => {
        try {
          await videoElement.play();
          // If successful and user previously had sound on, unmute after a delay
          if (!state.isMuted) {
            setTimeout(() => {
              videoElement.muted = false;
              videoElement.volume = Math.max(0, state.opacity);
            }, 1000);
          }
        } catch (err) {
          console.warn('Retry playback failed after delay:', err);
          setState(prev => ({ ...prev, playbackError: true }));
        }
      }, 500);
    } catch (err) {
      console.warn('Retry playback setup failed:', err);
      setState(prev => ({ ...prev, playbackError: true }));
    }
  };

  return (
    <>
      {/* Preload links for the videos */}
      <Head>
        {videos.map((src, index) => (
          <link key={index} rel="preload" href={src} as="video" type="video/mp4" />
        ))}
      </Head>
      
      {/* Fixed video container */}
      <div className="fixed inset-0">
        {/* Loading indicator - only shows briefly */}
        {!state.isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" />
          </div>
        )}

        {/* Error message if video fails to play */}
        {state.playbackError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-40">
            <div className="text-white text-center mb-4">
              <p className="text-lg mb-2">Video playback failed</p>
              <p className="text-sm opacity-70 mb-4">The video couldn't be loaded or played. Check if the file exists in the public directory.</p>
              <button 
                onClick={retryPlayback}
                className="px-4 py-2 bg-glass-lighter rounded-full hover:bg-glass transition-colors"
              >
                Retry Playback
              </button>
            </div>
          </div>
        )}

        {/* Video with fade effect */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: state.opacity,
          }}
        >
          <video
            ref={videoRef}
            className="absolute w-full h-full object-cover"
            playsInline
            autoPlay
            muted={state.isMuted}
            preload="auto"
            poster="/video-poster.jpg"
            controls={state.playbackError}
            src={videos[state.currentVideo]}
            crossOrigin="anonymous"
            onError={(e) => {
              console.error("Video error event:", e);
              // Try to recover by reloading
              const target = e.currentTarget;
              target.load();
              setTimeout(() => target.play(), 1000);
            }}
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Hidden video for preloading the next video */}
          <video
            ref={nextVideoRef}
            style={{ display: 'none' }}
            preload="auto"
            muted
            crossOrigin="anonymous"
          />
        </div>

        {/* Fallback background in case video fails */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black"
          style={{ 
            opacity: state.playbackError ? state.opacity : 0,
            zIndex: state.playbackError ? 5 : -1
          }}
        />

        {/* Mute toggle button */}
        {state.isLoaded && !state.playbackError && (
          <button 
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-50 glass rounded-full p-3 hover:bg-glass-darker transition-colors"
            aria-label={state.isMuted ? "Unmute video" : "Mute video"}
          >
            {state.isMuted ? (
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
        )}
      </div>

      {/* Spacer for scrolling */}
      <div className="h-screen" />
    </>
  );
} 