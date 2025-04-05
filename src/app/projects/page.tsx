'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface Technology {
  name: string;
  color: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  gradientStart: string;
  gradientEnd: string;
  emoji: string;
  technologies: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  featuredOrder: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const parseTechnologies = (techString: string): Technology[] => {
    try {
      const techArray = JSON.parse(techString) as string[];
      return techArray.map(tech => {
        // Map technologies to color classes
        const colorMap: Record<string, string> = {
          'React': 'bg-blue-500/20 text-blue-300',
          'Next.js': 'bg-blue-500/20 text-blue-300',
          'TypeScript': 'bg-blue-500/20 text-blue-300',
          'Node.js': 'bg-emerald-500/20 text-emerald-300',
          'Express': 'bg-emerald-500/20 text-emerald-300',
          'Prisma': 'bg-emerald-500/20 text-emerald-300',
          'Three.js': 'bg-amber-500/20 text-amber-300',
          'GSAP': 'bg-amber-500/20 text-amber-300',
          'JavaScript': 'bg-amber-500/20 text-amber-300',
        };
        
        return {
          name: tech,
          color: colorMap[tech] || 'bg-blue-500/20 text-blue-300'
        };
      });
    } catch (error) {
      console.error('Error parsing technologies:', error);
      return [];
    }
  };

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Projects</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore my recent work and technical projects. Each project showcases different skills and technologies.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
            <span className="ml-4 text-xl text-white">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg max-w-3xl mx-auto">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
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
                      <span key={index} className={`px-3 py-1 text-xs rounded-full ${tech.color}`}>
                        {tech.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-blue-400 hover:text-blue-300 font-medium">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 