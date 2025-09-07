'use client';

import React, { useState, useRef } from 'react';
import {
  useGetLessonNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '@/lib/redux/api/learning-api';
import { Note } from '@/types/learning';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  Lock,
  Globe,
  Search,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotesPanelProps {
  lessonId: string;
  className?: string;
}

export function NotesPanel({ lessonId, className }: NotesPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [newNoteIsPrivate, setNewNoteIsPrivate] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: notesData,
    isLoading,
    error,
  } = useGetLessonNotesQuery({ lessonId, includePrivate: true });

  const [createNote, { isLoading: creating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: updating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: deleting }] = useDeleteNoteMutation();

  // Extract notes from API response - convert to array format if needed
  const notes = React.useMemo(() => {
    console.log('📝 NotesPanel API response:', notesData);
    
    if (!notesData) return [];
    
    // If API returns single note string, convert to array format
    if (notesData.notes && typeof notesData.notes === 'string') {
      return [{
        id: `note-${Date.now()}`,
        content: notesData.notes,
        timestamp: Date.now(),
        isPrivate: true
      }];
    }
    
    // If API returns array of notes, use as is
    if (Array.isArray(notesData)) {
      return notesData;
    }
    
    // If notes is already an array in the data
    if (Array.isArray(notesData.notes)) {
      return notesData.notes;
    }
    
    return [];
  }, [notesData]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }

    try {
      await createNote({
        lessonId,
        content: newNoteContent.trim(),
        isPrivate: newNoteIsPrivate,
      }).unwrap();

      setNewNoteContent('');
      setIsCreating(false);
      toast.success('Đã tạo ghi chú thành công');
    } catch (error) {
      toast.error('Không thể tạo ghi chú');
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }

    try {
      await updateNote({
        noteId,
        data: {
          content: editNoteContent.trim(),
        },
      }).unwrap();

      setEditingNoteId(null);
      setEditNoteContent('');
      toast.success('Đã cập nhật ghi chú');
    } catch (error) {
      toast.error('Không thể cập nhật ghi chú');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      return;
    }

    try {
      await deleteNote(noteId).unwrap();
      toast.success('Đã xóa ghi chú');
    } catch (error) {
      toast.error('Không thể xóa ghi chú');
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return null;
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="mb-2 text-red-600">Không thể tải ghi chú</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <StickyNote className="h-5 w-5" />
          Ghi chú ({notes.length})
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm ghi chú
        </Button>
      </div>

      {/* Search */}
      {notes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm ghi chú..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Create New Note */}
      {isCreating && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tạo ghi chú mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              ref={textareaRef}
              placeholder="Nhập nội dung ghi chú..."
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              className="min-h-24 resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newNoteIsPrivate}
                  onChange={e => setNewNoteIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <Lock className="h-4 w-4" />
                Ghi chú riêng tư
              </label>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewNoteContent('');
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={creating || !newNoteContent.trim()}
                >
                  <Save className="mr-1 h-4 w-4" />
                  {creating ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-12 text-center">
          <StickyNote className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="mb-2 text-gray-500">
            {searchTerm ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-gray-400">
              Tạo ghi chú đầu tiên để ghi lại những điểm quan trọng
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <Card key={note.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                {editingNoteId === note.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Textarea
                      value={editNoteContent}
                      onChange={e => setEditNoteContent(e.target.value)}
                      className="min-h-20 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={updating || !editNoteContent.trim()}
                      >
                        <Save className="mr-1 h-4 w-4" />
                        {updating ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                          {note.content}
                        </p>
                        {note.timestamp && (
                          <Badge variant="outline" className="mt-2">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTimestamp(note.timestamp)}
                          </Badge>
                        )}
                      </div>

                      <div className="ml-3 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(note)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deleting}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.student?.avatar} />
                            <AvatarFallback>
                              {note.student?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{note.student?.name || 'Bạn'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {note.isPrivate ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}
                          <span className="text-xs">
                            {note.isPrivate ? 'Riêng tư' : 'Công khai'}
                          </span>
                        </div>
                      </div>

                      <span>{formatTimeAgo(note.createdAt)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notes Stats */}
      {notes.length > 0 && (
        <div className="border-t pt-4 text-center">
          <p className="text-sm text-gray-500">
            Tổng cộng {notes.length} ghi chú •
            {notes.filter(n => n.isPrivate).length} riêng tư •
            {notes.filter(n => !n.isPrivate).length} công khai
          </p>
        </div>
      )}
    </div>
  );
}
