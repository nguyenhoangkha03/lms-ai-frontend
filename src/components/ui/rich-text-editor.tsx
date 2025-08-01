'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Italic, Underline, List, ListOrdered, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = 100,
  disabled = false,
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById(
      'rich-text-textarea'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);
      onChange(newText);

      // Focus back to textarea after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    }
  };

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="rounded-md border">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b bg-gray-50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', '*')}
          disabled={disabled}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('__', '__')}
          disabled={disabled}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('`', '`')}
          disabled={disabled}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('- ')}
          disabled={disabled}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('1. ')}
          disabled={disabled}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          disabled={disabled}
        >
          {isPreview ? 'Chỉnh sửa' : 'Xem trước'}
        </Button>
      </div>

      {/* Content Area */}
      <div className="p-3">
        {isPreview ? (
          <div
            className="prose prose-sm min-h-[100px] max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: formatContent(value) }}
          />
        ) : (
          <Textarea
            id="rich-text-textarea"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="resize-none border-0 p-0 focus:ring-0"
            style={{ minHeight }}
            rows={Math.max(3, Math.ceil(minHeight / 24))}
          />
        )}
      </div>

      {/* Helper Text */}
      <div className="px-3 pb-2 text-xs text-gray-500">
        Hỗ trợ Markdown: **bold**, *italic*, __underline__, `code`
      </div>
    </div>
  );
};
