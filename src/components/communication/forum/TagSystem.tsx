'use client';

import React, { useState } from 'react';
import {
  Tag,
  X,
  Plus,
  Search,
  Hash,
  Award,
  CheckCircle,
  Star,
  Crown,
  SortAsc,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';
import { forumApi } from '@/lib/redux/api/forum-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ForumTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  usageCount: number;
  createdAt: string;
  createdBy: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

interface BestAnswerProps {
  threadId: string;
  posts: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      reputation: number;
    };
    score: number;
    isAccepted: boolean;
    createdAt: string;
  }>;
  isThreadAuthor: boolean;
  isResolved: boolean;
  onAnswerSelected?: (postId: string) => void;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 5,
  placeholder = 'Add tags...',
  className = '',
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: availableTags, isLoading } = forumApi.useSearchTagsQuery(
    searchQuery,
    {
      skip: searchQuery.length < 1,
    }
  );
  const { data: popularTags } = forumApi.useGetPopularTagsQuery({ limit: 10 });
  const [createTag] = forumApi.useCreateTagMutation();

  const selectedTagObjects = selectedTags
    .map(tagId =>
      [...(availableTags || []), ...(popularTags || [])].find(
        tag => tag.id === tagId
      )
    )
    .filter(Boolean);

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagId]);
    } else {
      toast(
        <div>
          <strong className="text-red-600">Tag limit reached</strong>
          <p>You can only select up to {maxTags} tags.</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName.trim(),
        description: '',
        color: '#3B82F6',
      }).unwrap();

      onTagsChange([...selectedTags, newTag.id]);
      setNewTagName('');
      setShowCreateDialog(false);
      setOpen(false);

      toast(
        <div>
          <strong className="text-green-600">Tag created</strong>
          <p>Tag "${newTag.name}" has been created and added.</p>
        </div>,
        {
          duration: 4000,
        }
      );
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to create tag.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  const filteredTags = searchQuery
    ? availableTags?.filter(
        (tag: ForumTag) =>
          !selectedTags.includes(tag.id) &&
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : popularTags?.filter((tag: ForumTag) => !selectedTags.includes(tag.id)) ||
      [];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTagObjects.map(tag => (
          <Badge
            key={tag?.id}
            variant="secondary"
            style={{ borderColor: tag?.color, color: tag?.color }}
            className="flex items-center gap-1 px-2 py-1"
          >
            <Hash className="h-3 w-3" />
            {tag?.name}
            <X
              className="h-3 w-3 cursor-pointer hover:text-red-500"
              onClick={() => handleTagSelect(tag!.id!)}
            />
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
            disabled={selectedTags.length >= maxTags}
          >
            <Tag className="mr-2 h-4 w-4" />
            {placeholder}
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedTags.length}/{maxTags}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="mb-2 text-sm text-gray-600">No tags found</p>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                    disabled={!searchQuery.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchQuery}"
                  </Button>
                </div>
              </CommandEmpty>

              {!searchQuery && (
                <CommandGroup heading="Popular Tags">
                  {popularTags?.slice(0, 10).map((tag: ForumTag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {tag.usageCount}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {filteredTags.length > 0 && (
                <CommandGroup
                  heading={searchQuery ? 'Search Results' : 'Available Tags'}
                >
                  {filteredTags.map((tag: ForumTag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {tag.description && (
                        <span className="ml-2 truncate text-xs text-gray-500">
                          {tag.description}
                        </span>
                      )}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {tag.usageCount}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create New Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Tag Name</Label>
              <Input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                maxLength={30}
              />
            </div>
            <div className="text-sm text-gray-600">
              Tags help organize and categorize content. Choose a clear,
              descriptive name.
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Create Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TagCloud({
  tags,
  selectedTags = [],
  onTagClick,
  maxTags = 50,
  showCounts = true,
}: {
  tags: ForumTag[];
  selectedTags?: string[];
  onTagClick?: (tagId: string) => void;
  maxTags?: number;
  showCounts?: boolean;
}) {
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>(
    'popular'
  );
  const [filterQuery, setFilterQuery] = useState('');

  const sortedTags = React.useMemo(() => {
    let filtered = tags.filter(tag =>
      tag.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'recent':
        return filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'alphabetical':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [tags, sortBy, filterQuery]);

  const getTagSize = (usageCount: number, maxUsage: number) => {
    const minSize = 12;
    const maxSize = 20;
    const ratio = usageCount / maxUsage;
    return Math.max(
      minSize,
      Math.min(maxSize, minSize + (maxSize - minSize) * ratio)
    );
  };

  const maxUsage = Math.max(...tags.map(tag => tag.usageCount));

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter tags..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={value => setSortBy(value as any)}>
          <SelectTrigger className="w-40">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2">
        {sortedTags.slice(0, maxTags).map(tag => (
          <Button
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTagClick?.(tag.id)}
            className={`h-auto px-3 py-1 ${selectedTags.includes(tag.id) ? '' : 'hover:border-current'}`}
            style={{
              fontSize: `${getTagSize(tag.usageCount, maxUsage)}px`,
              borderColor: tag.color,
              color: selectedTags.includes(tag.id) ? 'white' : tag.color,
              backgroundColor: selectedTags.includes(tag.id)
                ? tag.color
                : 'transparent',
            }}
          >
            <Hash className="mr-1 h-3 w-3" />
            {tag.name}
            {showCounts && (
              <Badge
                variant="secondary"
                className="ml-2 text-xs"
                style={{
                  backgroundColor: selectedTags.includes(tag.id)
                    ? 'rgba(255,255,255,0.2)'
                    : undefined,
                }}
              >
                {tag.usageCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {sortedTags.length === 0 && filterQuery && (
        <div className="py-8 text-center text-gray-500">
          <Tag className="mx-auto mb-2 h-8 w-8" />
          <p>No tags found matching "{filterQuery}"</p>
        </div>
      )}
    </div>
  );
}

export function BestAnswerSelection({
  threadId,
  posts,
  isThreadAuthor,
  isResolved,
  onAnswerSelected,
}: BestAnswerProps) {
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');

  const [acceptAnswer] = forumApi.useAcceptAnswerMutation();

  const handleAcceptAnswer = async (postId: string) => {
    try {
      await acceptAnswer({ threadId, postId }).unwrap();

      toast(
        <div>
          <strong className="text-green-600">Answer accepted</strong>
          <p>This answer has been marked as the best answer.</p>
        </div>,
        {
          duration: 4000,
        }
      );

      setShowSelectionDialog(false);
      onAnswerSelected?.(postId);
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to accept answer.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
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

  // Filter out posts that are already accepted or are not answers
  const eligibleAnswers = posts.filter(post => !post.isAccepted);
  const acceptedAnswer = posts.find(post => post.isAccepted);

  if (!isThreadAuthor || isResolved) {
    return acceptedAnswer ? (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Best Answer Selected
            </span>
          </div>
          <div className="text-sm text-green-700">
            This question has been resolved with a best answer.
          </div>
        </CardContent>
      </Card>
    ) : null;
  }

  return (
    <div className="space-y-4">
      {acceptedAnswer && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Best Answer Selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelectionDialog(true)}
                className="border-green-300 text-green-700"
              >
                Change Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!acceptedAnswer && eligibleAnswers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Select Best Answer
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Help the community by selecting the most helpful answer.
                </p>
              </div>
              <Button
                onClick={() => setShowSelectionDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Select Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Selection Dialog */}
      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Select Best Answer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <Star className="mt-0.5 h-4 w-4 text-yellow-600" />
                <div className="text-sm">
                  <div className="mb-1 font-medium text-yellow-800">
                    Choose the most helpful answer
                  </div>
                  <div className="text-yellow-700">
                    Select the answer that best solves your question. This helps
                    other users with similar questions find the solution
                    quickly.
                  </div>
                </div>
              </div>
            </div>

            {/* Sort answers by score */}
            <div className="space-y-4">
              {[...eligibleAnswers]
                .sort((a, b) => b.score - a.score)
                .map(post => (
                  <Card
                    key={post.id}
                    className={`cursor-pointer transition-all ${
                      selectedPostId === post.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPostId(post.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                              selectedPostId === post.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedPostId === post.id && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="text-center">
                            <div
                              className={`font-bold ${
                                post.score > 0
                                  ? 'text-green-600'
                                  : post.score < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {post.score}
                            </div>
                            <div className="text-xs text-gray-500">score</div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="prose prose-sm mb-3 max-w-none">
                            <div
                              className="line-clamp-4 text-gray-700"
                              dangerouslySetInnerHTML={{
                                __html:
                                  post.content.substring(0, 300) +
                                  (post.content.length > 300 ? '...' : ''),
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    post.author.avatar || '/default-avatar.png'
                                  }
                                  alt={post.author.name}
                                  className="h-6 w-6 rounded-full"
                                />
                                <span className="text-sm font-medium">
                                  {post.author.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {post.author.reputation} rep
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(post.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {eligibleAnswers.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                <p>No answers available to select from.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSelectionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedPostId && handleAcceptAnswer(selectedPostId)
              }
              disabled={!selectedPostId}
              className="bg-green-600 hover:bg-green-700"
            >
              <Award className="mr-2 h-4 w-4" />
              Accept as Best Answer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TagManagement() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'popular' | 'recent' | 'manage'
  >('all');
  const [sortBy, setSortBy] = useState<'usage' | 'recent' | 'alphabetical'>(
    'usage'
  );
  const [filterQuery, setFilterQuery] = useState('');
  const [editingTag, setEditingTag] = useState<ForumTag | null>(null);

  const { data: allTags, isLoading } = forumApi.useGetAllTagsQuery();
  const { data: popularTags } = forumApi.useGetPopularTagsQuery({ limit: 10 });
  const { data: recentTags } = forumApi.useGetRecentTagsQuery({ limit: 10 });

  const [updateTag] = forumApi.useUpdateTagMutation();
  const [deleteTag] = forumApi.useDeleteTagMutation();

  const handleUpdateTag = async (tagId: string, updates: Partial<ForumTag>) => {
    try {
      await updateTag({ tagId, ...updates }).unwrap();
      toast(
        <div>
          <strong className="text-green-600">Tag updated</strong>
          <p>Tag has been updated successfully.</p>
        </div>,
        {
          duration: 4000,
        }
      );
      setEditingTag(null);
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to update tag.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag({ tagId }).unwrap();
      toast(
        <div>
          <strong className="text-green-600">Tag deleted</strong>
          <p>Tag has been deleted successfully.</p>
        </div>,
        {
          duration: 4000,
        }
      );
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to delete tag.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  const getTagsForTab = () => {
    switch (activeTab) {
      case 'popular':
        return popularTags || [];
      case 'recent':
        return recentTags || [];
      case 'manage':
      case 'all':
      default:
        return allTags || [];
    }
  };

  const filteredAndSortedTags = React.useMemo(() => {
    let tags = getTagsForTab();

    if (filterQuery) {
      tags = tags.filter(
        tag =>
          tag.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          tag.description.toLowerCase().includes(filterQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'usage':
        return tags.sort(
          (a: ForumTag, b: ForumTag) => b.usageCount - a.usageCount
        );
      case 'recent':
        return tags.sort(
          (a: ForumTag, b: ForumTag) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'alphabetical':
        return tags.sort((a: ForumTag, b: ForumTag) =>
          a.name.localeCompare(b.name)
        );
      default:
        return tags;
    }
  }, [activeTab, filterQuery, sortBy, allTags, popularTags, recentTags]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tag Management</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList>
          <TabsTrigger value="all">All Tags</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tags..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={value => setSortBy(value as any)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage">Most Used</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="mb-2 h-6 rounded bg-gray-200"></div>
                    <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedTags.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">No tags found</h3>
                <p className="text-gray-600">
                  {filterQuery
                    ? `No tags match "${filterQuery}"`
                    : 'No tags available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedTags.map((tag: ForumTag) => (
                <Card
                  key={tag.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <h3 className="font-medium">#{tag.name}</h3>
                        {tag.isFeatured && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      {activeTab === 'manage' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setEditingTag(tag)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTag(tag.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {tag.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {tag.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{tag.usageCount}</span>
                        </div>
                      </div>
                      <Link
                        href={`/forum/tags/${tag.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        View threads
                      </Link>
                    </div>

                    {tag.category && (
                      <div className="mt-2 border-t pt-2">
                        <span
                          className="inline-block rounded px-2 py-1 text-xs text-white"
                          style={{ backgroundColor: tag.category.color }}
                        >
                          {tag.category.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Tag Dialog */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Name</Label>
                <Input
                  value={editingTag.name}
                  onChange={e =>
                    setEditingTag({ ...editingTag, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  value={editingTag.description}
                  onChange={e =>
                    setEditingTag({
                      ...editingTag,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Color</Label>
                <Input
                  type="color"
                  value={editingTag.color}
                  onChange={e =>
                    setEditingTag({ ...editingTag, color: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateTag(editingTag.id, editingTag)}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
