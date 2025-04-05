'use client';

import VideoHero from '@/components/VideoHero';
import HeroTitle from '@/components/HeroTitle';
import ProfileImage from '@/components/ProfileImage';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  gradientStart: string;
  gradientEnd: string;
  emoji: string;
  technologies: string;
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?featured=true&limit=3');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const parseTechnologies = (techString: string): string[] => {
    try {
      return JSON.parse(techString);
    } catch (error) {
      return [];
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <VideoHero />
      <HeroTitle />
    
      {/* Personal Introduction */}
      <div className="py-24 mt-64 bg-glass-darker">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 flex justify-center">
              <ProfileImage />
            </div>
            
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-white">Hi, I'm Jason Chen</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Welcome to my personal blog and portfolio website. I'm a technology enthusiast, 
                programmer, and digital creator. Here, I share my thoughts on technology, 
                programming tips, and various digital resources.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link 
                  href="/blog" 
                  className="px-6 py-3 bg-glass-lighter text-white rounded-full hover:bg-glass transition-colors"
                >
                  Read My Blog
                </Link>
                <Link 
                  href="/files" 
                  className="px-6 py-3 bg-glass text-white rounded-full hover:bg-glass-lighter transition-colors"
                >
                  Browse My Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Projects Section */}
      <div className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Featured Projects</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Dynamic project cards */}
              {featuredProjects.map((project) => (
                <Link 
                  href={`/projects/${project.id}`}
                  key={project.id}
                  className="bg-glass rounded-xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`h-48 relative bg-gradient-to-r ${project.gradientStart} ${project.gradientEnd}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{project.emoji}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                    <p className="text-gray-300 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {parseTechnologies(project.technologies).map((tech, index) => (
                        <span key={index} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">{tech}</span>
                      ))}
                    </div>
                    <span className="text-blue-400 hover:text-blue-300 font-medium">View Project →</span>
                  </div>
                </Link>
              ))}
              
              {/* View All Projects card always appears */}
              <Link 
                href="/projects" 
                className="bg-glass rounded-xl overflow-hidden hover:translate-y-[-5px] transition-all duration-300 hover:shadow-lg flex items-center justify-center"
              >
                <div className="p-8 text-center">
                  <div className="mb-4 text-4xl mx-auto">💻</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">View All Projects</h3>
                  <p className="text-gray-300 mb-4">
                    Explore my full portfolio of projects, from web applications to design work.
                  </p>
                  <span className="text-blue-400 hover:text-blue-300 font-medium">Browse Portfolio →</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
