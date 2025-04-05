'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Save, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

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
}

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [project, setProject] = useState<Project>({
    id: '',
    title: '',
    description: '',
    content: '',
    gradientStart: 'from-purple-500',
    gradientEnd: 'to-blue-500',
    emoji: '🚀',
    technologies: '[]',
    projectUrl: '',
    githubUrl: '',
    featured: false,
    featuredOrder: 0,
    published: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check authentication and fetch project data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERUSER')) {
      router.push('/login');
      return;
    }
    
    if (id === 'new') {
      setLoading(false);
      return;
    }
    
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
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
    
    fetchProject();
  }, [id, router, session, status]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProject(prev => ({ ...prev, [name]: checked }));
    } else {
      setProject(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear any previous messages
    setError(null);
    setSuccess(null);
  };
  
  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Try to parse the current value to verify it's valid JSON
      const techArray = e.target.value.trim() === '' ? [] : e.target.value.split(',').map(t => t.trim());
      const techString = JSON.stringify(techArray);
      
      setProject(prev => ({ ...prev, technologies: techString }));
      setError(null);
    } catch (err) {
      setError('Technologies must be a valid JSON array');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const endpoint = id === 'new' ? '/api/projects' : `/api/projects/${id}`;
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const savedProject = await response.json();
      
      if (id === 'new') {
        router.push(`/admin/projects/edit/${savedProject.id}`);
      } else {
        setProject(savedProject);
        setSuccess('Project saved successfully');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    setDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      router.push('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      setDeleting(false);
    }
  };
  
  const parseTechnologies = (techString: string) => {
    try {
      return JSON.parse(techString);
    } catch (error) {
      return [];
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
        <span className="ml-4 text-xl text-white">Loading...</span>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link 
              href="/projects"
              className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {id === 'new' ? 'Create New Project' : 'Edit Project'}
            </h1>
          </div>
          
          {id !== 'new' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900/70 border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/70 border border-green-700 text-green-100 px-6 py-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-glass-darker rounded-xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={project.title}
                onChange={handleChange}
                required
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="emoji">
                Emoji
              </label>
              <input
                type="text"
                id="emoji"
                name="emoji"
                value={project.emoji}
                onChange={handleChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-white font-medium mb-2" htmlFor="description">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={project.description}
                onChange={handleChange}
                required
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="gradientStart">
                Gradient Start
              </label>
              <input
                type="text"
                id="gradientStart"
                name="gradientStart"
                value={project.gradientStart}
                onChange={handleChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-400 text-sm mt-1">E.g., from-purple-500</p>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="gradientEnd">
                Gradient End
              </label>
              <input
                type="text"
                id="gradientEnd"
                name="gradientEnd"
                value={project.gradientEnd}
                onChange={handleChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-400 text-sm mt-1">E.g., to-blue-500</p>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="projectUrl">
                Project URL
              </label>
              <input
                type="url"
                id="projectUrl"
                name="projectUrl"
                value={project.projectUrl || ''}
                onChange={handleChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="githubUrl">
                GitHub URL
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={project.githubUrl || ''}
                onChange={handleChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="technologies">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={parseTechnologies(project.technologies).join(', ')}
                onChange={handleTechnologiesChange}
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-400 text-sm mt-1">E.g., React, TypeScript, Node.js</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={project.featured}
                  onChange={(e) => setProject(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-glass border-glass-lighter rounded"
                />
                <label htmlFor="featured" className="ml-2 text-white">
                  Featured
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={project.published}
                  onChange={(e) => setProject(prev => ({ ...prev, published: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-glass border-glass-lighter rounded"
                />
                <label htmlFor="published" className="ml-2 text-white">
                  Published
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="featuredOrder">
                Featured Order
              </label>
              <input
                type="number"
                id="featuredOrder"
                name="featuredOrder"
                value={project.featuredOrder}
                onChange={handleChange}
                min="0"
                className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-400 text-sm mt-1">Lower numbers appear first</p>
            </div>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2" htmlFor="content">
              Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              value={project.content}
              onChange={handleChange}
              rows={15}
              className="w-full bg-glass text-white border border-glass-lighter rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {id === 'new' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 