'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Crown,
  BookOpen,
  Star,
  Search,
  X,
  ChevronRight,
  Plus,
  UserCheck,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useGetSuggestedContactsQuery,
  useCreateDirectMessageRoomMutation,
  useCheckDirectMessagePermissionQuery,
} from '@/lib/redux/api/enhanced-chat-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContactSuggestionsProps {
  onRoomCreated?: (roomId: string) => void;
}

export function ContactSuggestions({ onRoomCreated }: ContactSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: contacts = [], isLoading: isLoadingContacts, error } =
    useGetSuggestedContactsQuery({
      limit: 50,
    }, {
      skip: !isDialogOpen, // Only call API when dialog is open
    });

  const [createDirectRoom, { isLoading: isCreatingRoom }] =
    useCreateDirectMessageRoomMutation();

  // Filter contacts based on search
  const filteredContacts = contacts.filter(
    contact =>
      `${contact.firstName} ${contact.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group contacts by relationship type
  const groupedContacts = filteredContacts.reduce(
    (acc, contact) => {
      if (!acc[contact.relationshipType]) {
        acc[contact.relationshipType] = [];
      }
      acc[contact.relationshipType].push(contact);
      return acc;
    },
    {} as Record<string, typeof contacts>
  );

  const getRelationshipTypeInfo = (type: string) => {
    const info = {
      teacher: {
        label: 'Instructors',
        icon: Crown,
        color:
          'text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50',
        description: 'From your enrolled courses',
      },
      course_mate: {
        label: 'Classmates',
        icon: BookOpen,
        color:
          'text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50',
        description: 'Shared course enrollment',
      },
      study_group_member: {
        label: 'Study Groups',
        icon: Users,
        color:
          'text-purple-600 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50',
        description: 'Study group members',
      },
      frequent_contact: {
        label: 'Frequent Contacts',
        icon: Star,
        color:
          'text-green-600 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50',
        description: 'Previously chatted',
      },
    };

    return (
      info[type as keyof typeof info] || {
        label: 'Others',
        icon: Users,
        color:
          'text-gray-600 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50',
        description: '',
      }
    );
  };

  const handleStartChat = async (contact: any) => {
    try {
      const result = await createDirectRoom({ userId: contact.id }).unwrap();

      if (result && result.id) {
        toast.success(
          `Started conversation with ${contact.firstName} ${contact.lastName}`
        );
        onRoomCreated?.(result.id);
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Unable to create conversation');
    }
  };

  const getOnlineStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500 shadow-green-200 shadow-sm';
      case 'away':
        return 'bg-yellow-500 shadow-yellow-200 shadow-sm';
      default:
        return 'bg-gray-400';
    }
  };

  const formatLastInteraction = (date?: Date) => {
    if (!date) return '';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-fit gap-2 whitespace-nowrap border-border/50 bg-gradient-to-r from-background to-muted/50 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          Find People
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-5xl overflow-hidden border-border/50 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <Users className="h-6 w-6 text-primary" />
              <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-500" />
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Suggested Connections
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-border/50 bg-background/50 pl-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:ring-primary/25"
            />
          </div>

          {/* Loading */}
          {isLoadingContacts && (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-red-600">
                  Error loading contacts
                </h3>
                <p className="text-muted-foreground">
                  {'data' in error ? error.data?.message : 'Failed to load suggested contacts'}
                </p>
                <pre className="mt-2 text-xs text-gray-500">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Contact Groups */}
          <div className="max-h-[50vh] space-y-8 overflow-y-auto pr-2">
            {Object.entries(groupedContacts).map(([type, contacts]) => {
              const typeInfo = getRelationshipTypeInfo(type);
              const TypeIcon = typeInfo.icon;

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-border/30 pb-2">
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 p-2">
                      <TypeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {typeInfo.label}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-muted/50 px-2 py-1 text-xs"
                    >
                      {contacts.length}
                    </Badge>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {contacts.map((contact, index) => (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={cn(
                          'cursor-pointer rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-lg',
                          typeInfo.color,
                          selectedContact === contact.id &&
                            'shadow-lg ring-2 ring-primary/50'
                        )}
                        onClick={() => setSelectedContact(contact.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar with online status */}
                          <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10 text-sm font-semibold">
                                {contact.firstName.charAt(0)}
                                {contact.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background',
                                getOnlineStatusColor(contact.onlineStatus)
                              )}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="truncate font-semibold text-foreground">
                                {contact.firstName} {contact.lastName}
                              </h4>
                              <Badge
                                variant="outline"
                                className="border-border/50 bg-background/50 px-2 py-1 text-xs"
                              >
                                {contact.role}
                              </Badge>
                            </div>

                            <p className="mb-3 truncate text-sm text-muted-foreground">
                              {contact.email}
                            </p>

                            {/* Relationship details */}
                            <div className="mb-4 space-y-2">
                              {contact.relationshipDetails.sharedCourses
                                ?.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <BookOpen className="h-3 w-3" />
                                  <span>
                                    {
                                      contact.relationshipDetails.sharedCourses
                                        .length
                                    }{' '}
                                    shared courses
                                  </span>
                                </div>
                              )}

                              {contact.relationshipDetails.studyGroups?.length >
                                0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {
                                      contact.relationshipDetails.studyGroups
                                        .length
                                    }{' '}
                                    study groups
                                  </span>
                                </div>
                              )}

                              {contact.relationshipDetails.lastInteraction && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Last chat:{' '}
                                    {formatLastInteraction(
                                      contact.relationshipDetails
                                        .lastInteraction
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              {contact.canDirectMessage ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-1"
                                >
                                  <Button
                                    size="sm"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleStartChat(contact);
                                    }}
                                    disabled={isCreatingRoom}
                                    className="h-8 w-full bg-gradient-to-r from-primary to-blue-600 text-xs shadow-sm hover:from-primary/90 hover:to-blue-600/90"
                                  >
                                    <MessageCircle className="mr-2 h-3 w-3" />
                                    Start Chat
                                  </Button>
                                </motion.div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="h-8 flex-1 border-border/50 text-xs"
                                >
                                  <X className="mr-2 h-3 w-3" />
                                  Unavailable
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Empty state */}
            {filteredContacts.length === 0 && !isLoadingContacts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <div className="relative mb-6">
                  <Users className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 blur-2xl" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {searchQuery
                    ? 'No results found'
                    : 'No suggested connections'}
                </h3>
                <p className="mx-auto max-w-md text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Join courses or study groups to connect with other students and instructors'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
