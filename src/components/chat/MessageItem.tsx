'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Flag,
  MessageSquare,
  Copy,
  Download,
  ExternalLink,
  User,
  Bot,
  Shield,
  Crown,
  Star,
} from 'lucide-react';
import { ChatMessage } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageItemProps {
  message: ChatMessage;
  isGrouped?: boolean;
  currentUserId?: string;
  canModerate?: boolean;
  onReaction: (messageId: string, emoji: string, isRemoving?: boolean) => void;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string, isPinned: boolean) => void;
  onThreadCreate: (messageId: string) => void;
  onFlag?: (messageId: string, reason: string) => void;
}

const QUICK_REACTIONS = ['👍', '👎', '❤️', '😄', '😮', '😢', '🔥', '👏'];

export function MessageItem({
  message,
  isGrouped = false,
  currentUserId,
  canModerate = false,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onThreadCreate,
  onFlag,
}: MessageItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = message.senderId === currentUserId;
  const isSystemMessage = message.messageType === 'system';
  const isAnnouncementMessage = message.messageType === 'announcement';
  const canEdit =
    isOwnMessage && message.messageType === 'text' && !message.isDeleted;
  const canDelete = (isOwnMessage || canModerate) && !message.isDeleted;

  // Get user role badge
  const getUserRoleBadge = (role?: string) => {
    if (!role) return null;

    const badges = {
      owner: { icon: Crown, label: 'Owner', className: 'text-yellow-600' },
      admin: { icon: Shield, label: 'Admin', className: 'text-red-600' },
      moderator: { icon: Star, label: 'Mod', className: 'text-blue-600' },
      host: { icon: Crown, label: 'Host', className: 'text-purple-600' },
      presenter: {
        icon: User,
        label: 'Presenter',
        className: 'text-green-600',
      },
    };

    const badge = badges[role as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Icon className={cn('ml-1 h-3 w-3', badge.className)} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Handle copy message
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  // Handle quick reaction
  const handleQuickReaction = (emoji: string) => {
    const existingReaction = message.reactions?.[emoji];
    const hasReacted = existingReaction?.users.includes(currentUserId || '');
    onReaction(message.id, emoji, hasReacted);
  };

  // Render message content based on type
  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <div className="rounded bg-gray-50 px-3 py-2 italic text-gray-500">
          <Trash2 className="mr-1 inline h-4 w-4" />
          This message was deleted
        </div>
      );
    }

    switch (message.messageType) {
      case 'text':
        return (
          <div className="break-words">
            {/* Reply reference */}
            {message.replyTo && (
              <div className="mb-2 rounded-r border-l-4 border-blue-500 bg-gray-100 py-2 pl-3">
                <div className="mb-1 flex items-center space-x-2">
                  <Reply className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {message.replyTo.sender?.firstName || 'User'}
                  </span>
                </div>
                <p className="max-w-xs truncate text-sm text-gray-700">
                  {message.replyTo.content}
                </p>
              </div>
            )}

            {/* Main content */}
            <div className="prose prose-sm max-w-none">
              {message.content.split('\n').map((line, index) => (
                <p key={index} className="mb-1 last:mb-0">
                  {line || <br />}
                </p>
              ))}
            </div>

            {/* Edit indicator */}
            {message.isEdited && (
              <span className="ml-2 text-xs text-gray-500">(edited)</span>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {message.attachments?.map(attachment => (
              <div key={attachment.id} className="relative">
                <img
                  src={attachment.filePath}
                  alt={attachment.originalName}
                  className="max-w-xs cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                  onClick={() => window.open(attachment.filePath, '_blank')}
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 px-2"
                    onClick={() => window.open(attachment.filePath, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {message.content && (
              <p className="text-sm text-gray-700">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            {message.attachments?.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 rounded-lg border bg-gray-50 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(attachment.filePath, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
            {message.content && (
              <p className="text-sm text-gray-700">{message.content}</p>
            )}
          </div>
        );

      case 'system':
        return (
          <div className="flex items-center space-x-2 rounded bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <Bot className="h-4 w-4" />
            <span>{message.content}</span>
          </div>
        );

      case 'announcement':
        return (
          <div className="rounded-r border-l-4 border-blue-500 bg-blue-50 px-4 py-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                  <span className="text-sm font-bold text-white">!</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">Announcement</p>
                <p className="text-blue-800">{message.content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-700">{message.content}</p>;
    }
  };

  // System messages have special styling
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-1">{renderMessageContent()}</div>
    );
  }

  return (
    <div
      className={cn(
        'group relative',
        isGrouped ? 'mt-1' : 'mt-4',
        isAnnouncementMessage && 'rounded-lg bg-blue-50/50 p-2'
      )}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className="flex space-x-3">
        {/* Avatar (only show if not grouped) */}
        {!isGrouped && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={message.sender?.avatarUrl} />
            <AvatarFallback>
              {message.sender?.firstName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message content */}
        <div className={cn('min-w-0 flex-1', isGrouped && 'ml-11')}>
          {/* Header (only show if not grouped) */}
          {!isGrouped && (
            <div className="mb-1 flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {message.sender?.firstName} {message.sender?.lastName}
              </span>

              {/* Role badge */}
              {getUserRoleBadge(message.sender?.userType)}

              {/* Timestamp */}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {/* Pin indicator */}
              {message.isPinned && <Pin className="h-3 w-3 text-yellow-600" />}

              {/* Thread indicator */}
              {message.threadId && (
                <MessageSquare className="h-3 w-3 text-blue-600" />
              )}
            </div>
          )}

          {/* Message content */}
          <div className="relative">
            {renderMessageContent()}

            {/* Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(message.reactions).map(([emoji, reaction]) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-6 px-2 py-0 text-xs',
                      reaction.users.includes(currentUserId || '') &&
                        'border-blue-300 bg-blue-100'
                    )}
                    onClick={() => handleQuickReaction(emoji)}
                  >
                    <span className="mr-1">{emoji}</span>
                    <span>{reaction.count}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Quick reaction buttons (show on hover) */}
            {showReactions && !message.isDeleted && (
              <div className="absolute right-0 top-0 z-10 flex -translate-y-2 translate-x-full transform space-x-1 rounded-lg border bg-white p-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {QUICK_REACTIONS.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => handleQuickReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}

                {/* More options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onThreadCreate(message.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Thread
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleCopyMessage}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Message
                    </DropdownMenuItem>

                    {canModerate && (
                      <DropdownMenuItem
                        onClick={() => onPin(message.id, message.isPinned)}
                      >
                        {message.isPinned ? (
                          <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Unpin Message
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin Message
                          </>
                        )}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(message)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Message
                      </DropdownMenuItem>
                    )}

                    {canDelete && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Message
                      </DropdownMenuItem>
                    )}

                    {!isOwnMessage && onFlag && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onFlag(message.id, 'inappropriate')}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          Report Message
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDelete(message.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
