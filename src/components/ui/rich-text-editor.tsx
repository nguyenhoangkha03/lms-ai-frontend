'use client';

import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, Italic, Underline, List, ListOrdered, Code, 
  Quote, Link, Image, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Strikethrough, Superscript, Subscript, Palette,
  Type, Eye, EyeOff, Undo, Redo, Save, Upload,
  Table, Separator, Video, FileText, Lightbulb,
  Paperclip
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  showWordCount?: boolean;
  enableAdvancedFeatures?: boolean;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const TEXT_COLORS = ['#000000', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#be185d'];
const BG_COLORS = ['transparent', '#fef3c7', '#fecaca', '#fed7d7', '#d1fae5', '#dbeafe', '#e9d5ff', '#fce7f3'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = 100,
  disabled = false,
  showWordCount = true,
  enableAdvancedFeatures = true,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('transparent');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '', newLine: boolean = false) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      
      let insertion = before + selectedText + after;
      if (newLine && start > 0 && value[start - 1] !== '\n') {
        insertion = '\n' + insertion;
      }
      
      const newText =
        value.substring(0, start) + insertion + value.substring(end);
      onChange(newText);

      // Focus back to textarea after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length + (newLine && start > 0 && value[start - 1] !== '\n' ? 1 : 0), 
          end + before.length + (newLine && start > 0 && value[start - 1] !== '\n' ? 1 : 0)
        );
      }, 0);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      insertMarkdown(`[${linkText}](${linkUrl})`, '');
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertTable = () => {
    const tableMarkdown = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
    insertMarkdown(tableMarkdown, '', true);
  };

  const formatContent = (text: string) => {
    let formatted = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Text formatting
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/\^(.*?)\^/g, '<sup>$1</sup>')
      .replace(/~(.*?)~/g, '<sub>$1</sub>')
      // Code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')
      // Lists
      .replace(/^\* (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell.trim()).map(cell => 
          `<td class="border px-2 py-1">${cell.trim()}</td>`
        ).join('');
        return `<tr>${cells}</tr>`;
      })
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap table rows
    if (formatted.includes('<tr>')) {
      formatted = formatted.replace(/(<tr>.*?<\/tr>)+/g, '<table class="border-collapse border border-gray-300 my-2">$&</table>');
    }

    return formatted;
  };

  const getWordCount = () => {
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="rounded-md border bg-white">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('**', '**')}
            disabled={disabled}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
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
            onClick={() => insertMarkdown('~~', '~~')}
            disabled={disabled}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Headers */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('# ', '', true)}
            disabled={disabled}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('## ', '', true)}
            disabled={disabled}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('### ', '', true)}
            disabled={disabled}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists and Structure */}
        <div className="flex items-center gap-1 border-r pr-2">
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('> ', '', true)}
            disabled={disabled}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Code and Special */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('`', '`')}
            disabled={disabled}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('```\n', '\n```', true)}
            disabled={disabled}
            title="Code Block"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {enableAdvancedFeatures && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertTable}
              disabled={disabled}
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Advanced Features */}
        {enableAdvancedFeatures && (
          <div className="flex items-center gap-1 border-r pr-2">
            <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  title="Insert Link"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-semibold">Insert Link</h4>
                  <Input
                    placeholder="Link text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={insertLink} size="sm">Insert</Button>
                    <Button variant="outline" onClick={() => setShowLinkDialog(false)} size="sm">Cancel</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('^', '^')}
              disabled={disabled}
              title="Superscript"
            >
              <Superscript className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('~', '~')}
              disabled={disabled}
              title="Subscript"
            >
              <Subscript className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1" />

        {/* Status and Actions */}
        <div className="flex items-center gap-1">
          {showWordCount && (
            <Badge variant="outline" className="text-xs">
              {getWordCount()} words
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            disabled={disabled}
          >
            {isPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {isPreview ? (
          <div className="p-4">
            <div
              className="prose prose-sm min-h-[100px] max-w-none"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: formatContent(value) }}
            />
          </div>
        ) : (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none border-0 p-4 focus:ring-0 focus:border-0 outline-none"
              style={{ minHeight, fontSize }}
              rows={Math.max(6, Math.ceil(minHeight / 24))}
            />
            
            {/* Character limit indicator */}
            {value.length > 1000 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {value.length} characters
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Helper Text */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Supports Markdown formatting
          </span>
          <div className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">**bold**</kbd>
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">*italic*</kbd>
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">`code`</kbd>
            {enableAdvancedFeatures && (
              <>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded"># heading</kbd>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded">- list</kbd>
              </>
            )}
          </div>
        </div>
        
        {showWordCount && (
          <div className="text-xs text-gray-500">
            {getWordCount()} words • {value.length} characters
          </div>
        )}
      </div>
    </div>
  );
};
