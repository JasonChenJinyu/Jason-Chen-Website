'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Globe, Eye, EyeOff, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Import AdvancedEditor dynamically to avoid SSR issues
const AdvancedEditor = dynamic(() => import('./AdvancedEditor'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-gray-50 border rounded-lg">Loading editor...</div>
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
        </div>

        {/* Featured image section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          <div className="mt-1 flex items-center gap-4">
            {featuredImage ? (
              <div className="relative h-40 w-64 overflow-hidden rounded-lg border">
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
              <div className="h-40 w-64 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                {imageUploading ? (
                  <div className="animate-pulse">Uploading...</div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">No image selected</p>
                  </div>
                )}
              </div>
            )}
            <div>
              <label htmlFor="featured-image" className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg inline-block">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Post Content
          </label>
          <AdvancedEditor
            initialContent={content}
            onChange={setContent}
            placeholder="Write your post content here..."
          />
        </div>

        {/* Post settings */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Post Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Publish status */}
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black"
              />
              <label htmlFor="published" className="flex items-center gap-1">
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
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black"
              />
              <label htmlFor="homepage" className="flex items-center gap-1">
                <Globe size={16} />
                Show on homepage
              </label>
            </div>

            {/* Scheduled publish date */}
            <div className="md:col-span-2">
              <label htmlFor="schedule" className="flex items-center gap-1 mb-1 text-sm">
                <Calendar size={16} />
                Schedule publication
              </label>
              <input
                id="schedule"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-xs text-gray-500">
                {scheduledDate 
                  ? `Post will be published on ${new Date(scheduledDate).toLocaleDateString()}`
                  : 'Post will be published immediately if set to Published'}
              </p>
            </div>
          </div>
        </div>

        {/* Preview button and Save button */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={togglePreview}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1"
          >
            <Eye size={18} />
            {previewOpen ? 'Close Preview' : 'Preview Post'}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>

        {/* Post preview */}
        {previewOpen && (
          <div className="mt-6 border rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <div className="divider mb-4 border-t"></div>
            
            <article className="prose max-w-full">
              <h1>{title || 'Untitled Post'}</h1>
              {featuredImage && (
                <div className="relative w-full h-96 mb-6">
                  <Image
                    src={featuredImage}
                    alt={title || 'Featured image'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedPostForm; 