'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Github, ExternalLink, ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';

interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  gradientStart: string;
  gradientEnd: string;
  emoji: string;
  technologies: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  featuredOrder: number;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const parseTechnologies = (techString?: string) => {
    if (!techString) return [];
    
    try {
      return JSON.parse(techString) as string[];
    } catch (error) {
      console.error('Error parsing technologies:', error);
      return [];
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  const handleEdit = () => {
    router.push(`/admin/projects/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
        <span className="ml-4 text-xl text-white">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-red-900/70 border border-red-700 text-red-100 px-6 py-4 rounded-lg max-w-3xl mx-auto">
            <p className="text-xl">{error}</p>
            <div className="mt-4">
              <Link 
                href="/projects"
                className="inline-flex items-center bg-glass-darker text-white px-4 py-2 rounded-md hover:bg-glass transition-colors"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Project header */}
        <div className="mb-8">
          <Link 
            href="/projects"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Projects
          </Link>
          
          <div className={`h-64 md:h-80 relative bg-gradient-to-r ${project.gradientStart} ${project.gradientEnd} rounded-xl overflow-hidden mb-8`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">{project.emoji}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0">
              {project.title}
            </h1>
            
            <div className="flex space-x-3">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-glass p-2 rounded-full hover:bg-glass-lighter transition-colors"
                  aria-label="GitHub Repository"
                >
                  <Github className="h-5 w-5 text-white" />
                </a>
              )}
              
              {project.projectUrl && (
                <a 
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-glass p-2 rounded-full hover:bg-glass-lighter transition-colors"
                  aria-label="Live Project"
                >
                  <ExternalLink className="h-5 w-5 text-white" />
                </a>
              )}
              
              {isAdmin && (
                <button
                  onClick={handleEdit}
                  className="bg-glass px-4 py-2 rounded-md hover:bg-glass-lighter transition-colors text-white"
                >
                  Edit Project
                </button>
              )}
            </div>
          </div>
          
          <p className="text-xl text-gray-300 mt-4 mb-6">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {parseTechnologies(project.technologies).map((tech, index) => (
              <span key={index} className="bg-glass px-4 py-1 text-sm rounded-full text-white">
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {/* Project content */}
        <div className="bg-glass-darker rounded-xl p-6 md:p-8 prose prose-invert prose-sm md:prose-base max-w-none">
          <ReactMarkdown>
            {project.content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
} 