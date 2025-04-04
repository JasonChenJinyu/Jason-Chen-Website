'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Image as ImageIcon,
  Youtube,
  FileVideo
} from 'lucide-react';

interface AdvancedEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const AdvancedEditor = ({ 
  initialContent = '', 
  onChange,
  placeholder = 'Start writing your amazing blog post...'
}: AdvancedEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      YouTube.configure({
        controls: true,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Font options
  const fonts = [
    { name: 'Default', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'Georgia, serif' },
    { name: 'Monospace', value: 'monospace' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uploadImage = () => {
    fileInputRef.current?.click();
  };

  const uploadVideo = () => {
    videoInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result as string;
        // Insert video as HTML
        editor.chain().focus().insertContent(`
          <video controls width="100%">
            <source src="${result}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
        `).run();
      };
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  const insertYoutubeVideo = () => {
    if (editor) {
      const url = prompt('Enter YouTube video URL');
      if (url) {
        editor.commands.setYoutubeVideo({ src: url });
      }
    }
  };

  const setLink = () => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      const url = prompt('URL', previousUrl);
      
      // cancelled
      if (url === null) {
        return;
      }
      
      // empty
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      
      // update link
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="advanced-editor">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-1 flex gap-1">
            <button 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'bg-white'}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'bg-white'}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'bg-white'}`}
              title="Underline"
            >
              <UnderlineIcon size={16} />
            </button>
            <button 
              onClick={setLink}
              className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'bg-white'}`}
              title="Add link"
            >
              <LinkIcon size={16} />
            </button>
          </div>
        </BubbleMenu>
      )}

      <div className="editor-toolbar bg-white shadow-sm border border-gray-200 rounded-t-lg p-2 flex flex-wrap gap-1">
        <div className="formatting-tools flex gap-1 mr-2">
          <button 
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : 'bg-white'}`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : 'bg-white'}`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('underline') ? 'bg-gray-200' : 'bg-white'}`}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>
        </div>

        <div className="text-options flex gap-1 mr-2">
          <button 
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'bg-white'}`}
            title="Heading"
          >
            <Type size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'bg-white'}`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'bg-white'}`}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="alignment-tools flex gap-1 mr-2">
          <button 
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'bg-white'}`}
            title="Align left"
          >
            <AlignLeft size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'bg-white'}`}
            title="Align center"
          >
            <AlignCenter size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'bg-white'}`}
            title="Align right"
          >
            <AlignRight size={18} />
          </button>
          <button 
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : 'bg-white'}`}
            title="Justify"
          >
            <AlignJustify size={18} />
          </button>
        </div>

        <div className="font-tools flex gap-1 mr-2">
          <select 
            onChange={(e) => {
              editor?.chain().focus().setFontFamily(e.target.value).run();
            }}
            className="text-sm border rounded p-1"
            title="Font Family"
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
          <input 
            type="color" 
            onChange={(e) => {
              editor?.chain().focus().setColor(e.target.value).run();
            }}
            className="h-[30px] w-[30px] p-0 cursor-pointer border rounded"
            title="Text color"
          />
        </div>

        <div className="media-tools flex gap-1">
          <button 
            onClick={uploadImage}
            className="p-1 rounded hover:bg-gray-100"
            title="Insert image"
          >
            <ImageIcon size={18} />
          </button>
          <button 
            onClick={uploadVideo}
            className="p-1 rounded hover:bg-gray-100"
            title="Insert video"
          >
            <FileVideo size={18} />
          </button>
          <button 
            onClick={insertYoutubeVideo}
            className="p-1 rounded hover:bg-gray-100"
            title="Insert YouTube video"
          >
            <Youtube size={18} />
          </button>
          <button 
            onClick={setLink}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('link') ? 'bg-gray-200' : 'bg-white'}`}
            title="Insert link"
          >
            <LinkIcon size={18} />
          </button>
        </div>
      </div>

      <div className="editor-content border border-t-0 border-gray-200 rounded-b-lg p-4 min-h-[500px] bg-white">
        <EditorContent editor={editor} className="prose max-w-full h-full" />
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input 
        type="file" 
        ref={videoInputRef}
        onChange={handleVideoUpload}
        accept="video/*"
        className="hidden"
      />
    </div>
  );
};

export default AdvancedEditor; 