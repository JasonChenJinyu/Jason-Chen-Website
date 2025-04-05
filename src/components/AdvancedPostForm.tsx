'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Globe, Eye, EyeOff, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Import AdvancedEditor dynamically to avoid SSR issues
const AdvancedEditor = dynamic(() => import('./AdvancedEditor'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-glass-darker border border-glass-lighter rounded-lg">Loading editor...</div>
});

interface PostFormProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    featuredImage?: string;
    published?: boolean;
    showOnHomepage?: boolean;
    publishedAt?: Date | null;
  };
  isEditing?: boolean;
}

const AdvancedPostForm = ({ initialData, isEditing = false }: PostFormProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [published, setPublished] = useState(initialData?.published || false);
  const [showOnHomepage, setShowOnHomepage] = useState(initialData?.showOnHomepage || false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Set scheduled date from initial data if available
    if (initialData?.publishedAt) {
      const date = new Date(initialData.publishedAt);
      setScheduledDate(date.toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      // In a real app, you would upload to a storage service
      // For demo purposes, we'll convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        setFeaturedImage(reader.result as string);
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setImageUploading(false);
    }
  };

  const togglePreview = () => {
    setPreviewOpen(!previewOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = {
        title,
        content,
        featuredImage,
        published,
        showOnHomepage,
        publishedAt: scheduledDate ? new Date(scheduledDate) : null,
        id: initialData?.id
      };

      // API endpoint based on whether we're creating or editing
      const endpoint = isEditing ? `/api/posts/${initialData?.id}` : '/api/posts';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }

      const data = await response.json();
      router.push(`/blog/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      {error && (
        <div className="mb-4 p-3 bg-red-900/70 border border-red-700 text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2 bg-glass text-white border border-glass-lighter rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Featured image section */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Featured Image
          </label>
          <div className="mt-1 flex items-center gap-4">
            {featuredImage ? (
              <div className="relative h-40 w-64 overflow-hidden rounded-lg border border-glass-lighter">
                <Image 
                  src={featuredImage} 
                  alt="Featured" 
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="h-40 w-64 flex items-center justify-center bg-glass-darker border-2 border-dashed border-glass-lighter rounded-lg">
                {imageUploading ? (
                  <div className="animate-pulse text-white">Uploading...</div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-400">No image selected</p>
                  </div>
                )}
              </div>
            )}
            <div>
              <label htmlFor="featured-image" className="cursor-pointer">
                <span className="px-4 py-2 bg-glass hover:bg-glass-lighter text-white rounded-lg inline-block">
                  {featuredImage ? 'Change Image' : 'Upload Image'}
                </span>
                <input
                  id="featured-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="hidden"
                  disabled={imageUploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Post Content
          </label>
          <div className="bg-glass border border-glass-lighter rounded-lg overflow-hidden">
            <AdvancedEditor
              initialContent={content}
              onChange={setContent}
              placeholder="Write your post content here..."
            />
          </div>
        </div>

        {/* Post settings */}
        <div className="bg-glass-darker p-4 rounded-lg border border-glass-lighter">
          <h3 className="text-lg font-medium mb-4 text-white">Post Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Publish status */}
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-glass-lighter bg-glass text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="published" className="flex items-center gap-1 text-white">
                {published ? <Eye size={16} /> : <EyeOff size={16} />}
                {published ? 'Published' : 'Draft'}
              </label>
            </div>

            {/* Show on homepage */}
            <div className="flex items-center gap-2">
              <input
                id="homepage"
                type="checkbox"
                checked={showOnHomepage}
                onChange={(e) => setShowOnHomepage(e.target.checked)}
                className="h-4 w-4 rounded border-glass-lighter bg-glass text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="homepage" className="flex items-center gap-1 text-white">
                <Globe size={16} />
                Show on Homepage
              </label>
            </div>

            {/* Scheduled publish date */}
            <div className="md:col-span-2">
              <label htmlFor="schedule" className="flex items-center gap-1 text-white mb-2 text-sm">
                <Calendar size={16} />
                Schedule Publication
              </label>
              <input
                type="date"
                id="schedule"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-glass text-white border border-glass-lighter rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={togglePreview}
            className="px-4 py-2 bg-glass hover:bg-glass-lighter text-white rounded-lg"
          >
            {previewOpen ? 'Close Preview' : 'Preview'}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>

      {/* Preview section */}
      {previewOpen && (
        <div className="mt-12 border-t border-glass-lighter pt-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Preview</h2>
          <div className="bg-glass p-8 rounded-lg prose prose-invert max-w-none">
            <h1>{title || 'Untitled Post'}</h1>
            {featuredImage && (
              <div className="my-6">
                <Image 
                  src={featuredImage} 
                  alt="Featured" 
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full"
                />
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPostForm; 