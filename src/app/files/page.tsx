'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: string;
}

export default function FilesPage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load files only when path changes or on initial load
  useEffect(() => {
    if (status === 'authenticated') {
      const loadFiles = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const data = await response.json();
          setFiles(data);
        } catch (err) {
          console.error('Error fetching files:', err);
          setError('Failed to load files. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      loadFiles();
    }
  }, [currentPath, status]);

  // Navigate to a directory
  const navigateToDirectory = (dirPath: string) => {
    setCurrentPath(dirPath);
  };

  // Navigate to parent directory
  const navigateUp = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`;
    setCurrentPath(parentPath);
  };

  // Download a file
  const downloadFile = async (filePath: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Create a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again later.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass p-12 rounded-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading file browser...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mac Mini File Browser</h1>
        
        <div className="mb-4 flex items-center">
          <button 
            onClick={navigateUp}
            disabled={currentPath === '/'}
            className="px-4 py-2 mr-4 bg-glass-lighter rounded hover:bg-glass disabled:opacity-50 transition-colors"
          >
            ⬆️ Go Up
          </button>
          <div className="text-gray-300">
            Current path: <span className="font-mono text-white">{currentPath}</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="bg-glass rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-glass-darker">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                      No files found in this directory
                    </td>
                  </tr>
                ) : (
                  files.map((file, index) => (
                    <tr key={index} className="hover:bg-glass-lighter">
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {file.isDirectory ? (
                          <button 
                            onClick={() => navigateToDirectory(file.path)}
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            📁 {file.name}
                          </button>
                        ) : (
                          <span>📄 {file.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {file.isDirectory ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(file.modifiedTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!file.isDirectory && (
                          <button 
                            onClick={() => downloadFile(file.path)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
} 