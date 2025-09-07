'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Upload,
  X,
  Paperclip,
  Smile
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

// Post validation schema
const postSchema = z.object({
  content: z.string().min(10, 'Post content must be at least 10 characters'),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  type: z.enum(['thread', 'reply', 'question', 'answer', 'comment']).default('reply'),
  isAnonymous: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialTags?: string[];
  categoryId?: string;
  threadId?: string;
  parentId?: string;
  postType?: 'thread' | 'reply' | 'question' | 'answer' | 'comment';
  showTitle?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  showTypeSelector?: boolean;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  allowAttachments?: boolean;
  allowAnonymous?: boolean;
  onSubmit: (data: PostFormData & { attachments?: File[] }) => void;
  onCancel?: () => void;
  onSaveDraft?: (data: Partial<PostFormData>) => void;
  isSubmitting?: boolean;
  categories?: Array<{ id: string; name: string; }>;
  availableTags?: string[];
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? "default" : "ghost"}
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const PostEditor: React.FC<PostEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  initialTags = [],
  categoryId,
  threadId,
  parentId,
  postType = 'reply',
  showTitle = false,
  showCategory = false,
  showTags = false,
  showTypeSelector = false,
  placeholder = "Write your post...",
  minHeight = 200,
  maxHeight = 600,
  allowAttachments = true,
  allowAnonymous = false,
  onSubmit,
  onCancel,
  onSaveDraft,
  isSubmitting = false,
  categories = [],
  availableTags = [],
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialContent,
      title: initialTitle,
      tags: initialTags,
      categoryId,
      type: postType,
      isAnonymous: false,
    },
  });

  const watchedContent = watch('content');

  // Auto-save draft functionality
  const saveDraft = useCallback(() => {
    if (onSaveDraft && content.trim()) {
      const formData = {
        content,
        title: watch('title'),
        tags,
        categoryId: watch('categoryId'),
        type: watch('type'),
        isAnonymous: watch('isAnonymous'),
      };
      onSaveDraft(formData);
    }
  }, [content, tags, watch, onSaveDraft]);

  // Auto-save every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Toolbar functions
  const insertTextAtCursor = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    setValue('content', newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertTextAtCursor('**', '**', 'bold text');
        break;
      case 'italic':
        insertTextAtCursor('*', '*', 'italic text');
        break;
      case 'underline':
        insertTextAtCursor('<u>', '</u>', 'underlined text');
        break;
      case 'strikethrough':
        insertTextAtCursor('~~', '~~', 'strikethrough text');
        break;
      case 'code':
        insertTextAtCursor('`', '`', 'code');
        break;
      case 'codeblock':
        insertTextAtCursor('```\n', '\n```', 'code block');
        break;
      case 'quote':
        insertTextAtCursor('> ', '', 'quote text');
        break;
      case 'ul':
        insertTextAtCursor('- ', '', 'list item');
        break;
      case 'ol':
        insertTextAtCursor('1. ', '', 'list item');
        break;
      case 'h1':
        insertTextAtCursor('# ', '', 'Heading 1');
        break;
      case 'h2':
        insertTextAtCursor('## ', '', 'Heading 2');
        break;
      case 'h3':
        insertTextAtCursor('### ', '', 'Heading 3');
        break;
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      insertTextAtCursor(`[${linkText}](${linkUrl})`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const onFormSubmit = (data: PostFormData) => {
    onSubmit({ ...data, attachments });
  };

  // Render markdown preview (simplified)
  const renderPreview = (markdown: string) => {
    // This is a basic markdown renderer - in production, use a proper markdown library
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\n/g, '<br />');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {postType === 'thread' ? 'Create New Thread' : 
             postType === 'question' ? 'Ask Question' : 'Write Reply'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveDraft}
              disabled={!content.trim()}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title Field */}
          {showTitle && (
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter thread title..."
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>
          )}

          {/* Category & Type Selectors */}
          <div className="flex gap-4">
            {showCategory && (
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showTypeSelector && (
              <div className="flex-1">
                <Label htmlFor="type">Post Type</Label>
                <Select onValueChange={(value: any) => setValue('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thread">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="reply">Reply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            
            {/* Toolbar */}
            {!isPreview && (
              <div className="border rounded-t-lg p-2 bg-gray-50 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex items-center gap-1 pr-2 border-r">
                  <ToolbarButton icon={<Bold className="h-4 w-4" />} label="Bold" onClick={() => formatText('bold')} />
                  <ToolbarButton icon={<Italic className="h-4 w-4" />} label="Italic" onClick={() => formatText('italic')} />
                  <ToolbarButton icon={<Underline className="h-4 w-4" />} label="Underline" onClick={() => formatText('underline')} />
                  <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} label="Strikethrough" onClick={() => formatText('strikethrough')} />
                </div>

                {/* Headers */}
                <div className="flex items-center gap-1 pr-2 border-r">
                  <ToolbarButton icon={<Heading1 className="h-4 w-4" />} label="Heading 1" onClick={() => formatText('h1')} />
                  <ToolbarButton icon={<Heading2 className="h-4 w-4" />} label="Heading 2" onClick={() => formatText('h2')} />
                  <ToolbarButton icon={<Heading3 className="h-4 w-4" />} label="Heading 3" onClick={() => formatText('h3')} />
                </div>

                {/* Lists & Quote */}
                <div className="flex items-center gap-1 pr-2 border-r">
                  <ToolbarButton icon={<List className="h-4 w-4" />} label="Bullet List" onClick={() => formatText('ul')} />
                  <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} label="Numbered List" onClick={() => formatText('ol')} />
                  <ToolbarButton icon={<Quote className="h-4 w-4" />} label="Quote" onClick={() => formatText('quote')} />
                </div>

                {/* Code & Links */}
                <div className="flex items-center gap-1 pr-2 border-r">
                  <ToolbarButton icon={<Code className="h-4 w-4" />} label="Inline Code" onClick={() => formatText('code')} />
                  <ToolbarButton icon={<Code2 className="h-4 w-4" />} label="Code Block" onClick={() => formatText('codeblock')} />
                  
                  <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Link className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="link-text">Link Text</Label>
                          <Input
                            id="link-text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Enter link text"
                          />
                        </div>
                        <div>
                          <Label htmlFor="link-url">URL</Label>
                          <Input
                            id="link-url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={insertLink}>
                            Insert
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* File Upload */}
                {allowAttachments && (
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <ToolbarButton
                      icon={<Paperclip className="h-4 w-4" />}
                      label="Attach File"
                      onClick={() => fileInputRef.current?.click()}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Content Area */}
            <div className="border rounded-b-lg min-h-[200px]">
              {isPreview ? (
                <div
                  className="p-4 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
                />
              ) : (
                <Textarea
                  ref={textareaRef}
                  {...register('content')}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setValue('content', e.target.value);
                  }}
                  placeholder={placeholder}
                  className="border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ minHeight, maxHeight }}
                />
              )}
            </div>
            
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {showTags && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim()}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Options */}
          {allowAnonymous && (
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={watch('isAnonymous')}
                onCheckedChange={(checked) => setValue('isAnonymous', checked)}
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostEditor;