'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Pin,
  Edit3,
  Trash2,
  Share2,
  Clock,
  User,
  Tag,
  BookOpen,
  Eye,
  Download,
  Copy,
  Star,
  MoreHorizontal,
  History,
  Users,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

interface CollaborativeNote {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  type: 'shared' | 'personal' | 'template';
  status: 'active' | 'archived' | 'deleted';
  authorId: string;
  studyGroupId: string;
  courseId?: string;
  lessonId?: string;
  tags: string[];
  isPinned: boolean;
  isTemplate: boolean;
  templateId?: string;
  version: number;
  lastEditedAt: string;
  lastEditedBy: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators: Array<{
    id: string;
    userId: string;
    permission: 'read' | 'write' | 'admin';
    status: 'active' | 'pending' | 'declined';
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
}

interface StudyGroupNotesProps {
  groupId: string;
  canEdit: boolean;
}

export function StudyGroupNotes({ groupId, canEdit }: StudyGroupNotesProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'shared' | 'personal' | 'pinned'
  >('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'created'>(
    'recent'
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CollaborativeNote | null>(
    null
  );
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Create note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'shared' as 'shared' | 'personal' | 'template' | 'pinned',
    tags: [] as string[],
    isPinned: false,
    isTemplate: false,
    templateId: '',
  });

  // RTK Query hooks
  const { data: notes, isLoading } =
    collaborativeApi.useGetCollaborativeNotesQuery({
      studyGroupId: groupId,
      search: searchQuery,
      type: filterType !== 'all' ? filterType : undefined,
      sort: sortBy,
    });
  const { data: templates } = collaborativeApi.useGetNoteTemplatesQuery();

  const [createNote] = collaborativeApi.useCreateCollaborativeNoteMutation();
  const [updateNote] = collaborativeApi.useUpdateCollaborativeNoteMutation();
  const [deleteNote] = collaborativeApi.useDeleteCollaborativeNoteMutation();
  const [shareNote] = collaborativeApi.useShareNoteMutation();
  const [duplicateNote] = collaborativeApi.useDuplicateNoteMutation();

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide both title and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createNote({
        ...newNote,
        studyGroupId: groupId,
      }).unwrap();

      toast({
        title: 'Note created',
        description: 'Your collaborative note has been created.',
      });

      setShowCreateDialog(false);
      setNewNote({
        title: '',
        content: '',
        type: 'shared',
        tags: [],
        isPinned: false,
        isTemplate: false,
        templateId: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create note.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote({ noteId }).unwrap();
      toast({
        title: 'Note deleted',
        description: 'The note has been deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete note.',
        variant: 'destructive',
      });
    }
  };

  const handleShareNote = async (
    noteId: string,
    emails: string[],
    permission: string
  ) => {
    try {
      await shareNote({
        noteId,
        emails,
        permission: permission as 'read' | 'write',
      }).unwrap();

      toast({
        title: 'Note shared',
        description: 'The note has been shared successfully.',
      });

      setShowShareDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to share note.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePin = async (noteId: string, isPinned: boolean) => {
    try {
      await updateNote({
        noteId,
        isPinned: !isPinned,
      }).unwrap();

      toast({
        title: isPinned ? 'Note unpinned' : 'Note pinned',
        description: `The note has been ${isPinned ? 'unpinned' : 'pinned'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update note.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (noteId: string) => {
    try {
      await duplicateNote({ noteId }).unwrap();
      toast({
        title: 'Note duplicated',
        description: 'A copy of the note has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to duplicate note.',
        variant: 'destructive',
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getFilteredNotes = () => {
    if (!notes) return [];

    switch (filterType) {
      case 'pinned':
        return notes.filter(note => note.isPinned);
      case 'shared':
        return notes.filter(note => note.type === 'shared');
      case 'personal':
        return notes.filter(
          note => note.type === 'personal' && note.authorId === user?.id
        );
      default:
        return notes;
    }
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Collaborative Notes</h2>
          <p className="text-gray-600">
            Share and collaborate on notes with your study group
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            From Template
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={value => setFilterType(value as any)}
              >
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notes</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No notes found</h3>
            <p className="mb-4 text-gray-600">
              {searchQuery
                ? 'No notes match your search criteria.'
                : 'Start creating collaborative notes for your study group.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map(note => (
            <Card key={note.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                    {note.type === 'template' && (
                      <Star className="h-4 w-4 text-yellow-600" />
                    )}
                    <Badge
                      variant={note.type === 'shared' ? 'default' : 'secondary'}
                    >
                      {note.type}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/notes/${note.id}`}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePin(note.id, note.isPinned)}
                      >
                        {note.isPinned ? (
                          <>
                            <Unlock className="mr-2 h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(note.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedNote(note as CollaborativeNote);
                          setShowShareDialog(true);
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      {note.permissions.canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link
                  href={`/notes/${note.id}`}
                  className="block hover:text-blue-600"
                >
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold">
                    {note.title}
                  </h3>
                </Link>

                <div
                  className="mb-3 line-clamp-3 text-sm text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html:
                      note.content.substring(0, 150) +
                      (note.content.length > 150 ? '...' : ''),
                  }}
                />

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-2 w-2" />
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={note.author.avatar} />
                      <AvatarFallback>
                        {note.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{note.author.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {note.collaborators.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{note.collaborators.length}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(note.lastEditedAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Note Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Collaborative Note</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Title *</Label>
              <Input
                value={newNote.title}
                onChange={e =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                placeholder="Enter note title..."
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">
                Content *
              </Label>
              <Textarea
                value={newNote.content}
                onChange={e =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                placeholder="Write your note content..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Type</Label>
                <Select
                  value={newNote.type}
                  onValueChange={value =>
                    setNewNote({ ...newNote, type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Shared Note</SelectItem>
                    <SelectItem value="personal">Personal Note</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Template (Optional)
                </Label>
                <Select
                  value={newNote.templateId}
                  onValueChange={value =>
                    setNewNote({ ...newNote, templateId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates?.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Tags</Label>
              <Input
                placeholder="Add tags (comma separated)"
                onChange={e =>
                  setNewNote({
                    ...newNote,
                    tags: e.target.value
                      .split(',')
                      .map(t => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pin-note"
                  checked={newNote.isPinned}
                  onCheckedChange={checked =>
                    setNewNote({ ...newNote, isPinned: checked })
                  }
                />
                <Label htmlFor="pin-note" className="text-sm">
                  Pin this note
                </Label>
              </div>

              {newNote.type !== 'template' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="make-template"
                    checked={newNote.isTemplate}
                    onCheckedChange={checked =>
                      setNewNote({ ...newNote, isTemplate: checked })
                    }
                  />
                  <Label htmlFor="make-template" className="text-sm">
                    Save as template
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={!newNote.title || !newNote.content}
            >
              Create Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Note Dialog */}
      {selectedNote && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Note</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Note: {selectedNote.title}
                </Label>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Email Addresses
                </Label>
                <Textarea
                  placeholder="Enter email addresses (comma separated)"
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Permission
                </Label>
                <Select defaultValue="read">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read only</SelectItem>
                    <SelectItem value="write">Can edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Collaborators */}
              {selectedNote.collaborators.length > 0 && (
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Current Collaborators
                  </Label>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {selectedNote.collaborators.map(collaborator => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={collaborator.user.avatar} />
                            <AvatarFallback>
                              {collaborator.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{collaborator.user.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {collaborator.permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
              >
                Cancel
              </Button>
              <Button>Share Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
