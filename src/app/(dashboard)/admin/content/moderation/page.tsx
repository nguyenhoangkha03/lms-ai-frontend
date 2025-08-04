'use client';

import React, { useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Eye,
  Check,
  X,
  Flag,
  AlertTriangle,
  Clock,
  FileText,
  Video,
  MessageSquare,
  Filter,
  Search,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  Bot,
  ExternalLink,
} from 'lucide-react';
import {
  useGetModerationQueueQuery,
  useModerateContentMutation,
  useBulkModerateContentMutation,
} from '@/lib/redux/api/content-management-api';
import {
  ContentModerationItem,
  ModerationQueryParams,
} from '@/lib/types/content-management';
import { useRBAC } from '@/hooks/use-rbac';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentModerationDetailsModal from '@/components/admin/content-management/ContentModerationDetailsModal';
import BulkModerationPanel from '@/components/admin/content-management/BulkModerationPanel';
import { ModerationFiltersPanel } from '@/components/admin/content-management/ModerationFiltersPanel';
import ModerationAnalyticsWidget from '@/components/admin/content-management/ModerationAnalyticsWidget';
interface ContentModerationPageProps {}

const ContentModerationPage: React.FC<ContentModerationPageProps> = () => {
  const { hasPermission } = useRBAC();
  const { toast } = useToast();

  const [queryParams, setQueryParams] = useState<ModerationQueryParams>({
    page: 1,
    limit: 20,
    status: 'pending',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showItemDetails, setShowItemDetails] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('queue');

  const {
    data: moderationData,
    isLoading: moderationLoading,
    error: moderationError,
  } = useGetModerationQueueQuery(queryParams);

  const [moderateContent] = useModerateContentMutation();
  const [bulkModerateContent] = useBulkModerateContentMutation();

  if (!hasPermission('content.moderate')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access content moderation.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setQueryParams(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  }, []);

  const handleFilterChange = useCallback(
    (filters: Partial<ModerationQueryParams>) => {
      setQueryParams(prev => ({
        ...prev,
        ...filters,
        page: 1,
      }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page: page + 1 }));
  }, []);

  const handleModerationAction = async (
    itemId: string,
    action: 'approve' | 'reject' | 'flag' | 'require_changes',
    reason?: string,
    feedback?: string
  ) => {
    try {
      await moderateContent({
        id: itemId,
        action,
        reason,
        feedback,
      }).unwrap();

      toast({
        title: 'Content moderated successfully',
        description: `Content has been ${action}d`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Moderation failed',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select items to perform bulk operations',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkModerateContent({
        itemIds: selectedItems,
        action,
        reason,
      }).unwrap();

      toast({
        title: 'Bulk moderation completed',
        description: `${selectedItems.length} items have been ${action}d`,
      });

      setSelectedItems([]);
      setShowBulkPanel(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Bulk moderation failed',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, text: 'Approved', icon: Check },
      rejected: { variant: 'destructive' as const, text: 'Rejected', icon: X },
      requires_changes: {
        variant: 'outline' as const,
        text: 'Requires Changes',
        icon: AlertCircle,
      },
      flagged: { variant: 'destructive' as const, text: 'Flagged', icon: Flag },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline' as const, text: 'Low', color: 'text-gray-600' },
      medium: {
        variant: 'secondary' as const,
        text: 'Medium',
        color: 'text-yellow-600',
      },
      high: {
        variant: 'default' as const,
        text: 'High',
        color: 'text-orange-600',
      },
      urgent: {
        variant: 'destructive' as const,
        text: 'Urgent',
        color: 'text-red-600',
      },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.low;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getContentTypeIcon = (contentType: string) => {
    const icons = {
      course: FileText,
      lesson: Video,
      forum_post: MessageSquare,
      comment: MessageSquare,
    };
    return icons[contentType as keyof typeof icons] || FileText;
  };

  const getAIQualityBadge = (score?: number) => {
    if (!score) return null;

    let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
      'outline';
    let text = 'Unknown';

    if (score >= 80) {
      variant = 'default';
      text = 'High Quality';
    } else if (score >= 60) {
      variant = 'secondary';
      text = 'Good Quality';
    } else if (score >= 40) {
      variant = 'outline';
      text = 'Fair Quality';
    } else {
      variant = 'destructive';
      text = 'Low Quality';
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Bot className="h-3 w-3" />
        {text} ({score}%)
      </Badge>
    );
  };

  const getPlagiarismBadge = (status?: string, similarity?: number) => {
    if (!status) return null;

    const config = {
      clean: {
        variant: 'default' as const,
        text: 'Clean',
        color: 'text-green-600',
      },
      suspicious: {
        variant: 'outline' as const,
        text: 'Suspicious',
        color: 'text-yellow-600',
      },
      plagiarized: {
        variant: 'destructive' as const,
        text: 'Plagiarized',
        color: 'text-red-600',
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.clean;
    const displayText = similarity
      ? `${statusConfig.text} (${similarity}%)`
      : statusConfig.text;

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.color}>
        {displayText}
      </Badge>
    );
  };

  const columns: ColumnDef<ContentModerationItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={e => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(!!e.target.checked)}
          className="rounded border border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'content',
      header: 'Content',
      cell: ({ row }) => {
        const item = row.original;
        const ContentIcon = getContentTypeIcon(item.contentType);

        return (
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <ContentIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{item.title}</div>
              <div className="truncate text-sm text-muted-foreground">
                {item.description || 'No description'}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.contentType.replace('_', ' ')}
                </Badge>
                {item.reportCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {item.reportCount} reports
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'submittedBy',
      header: 'Author',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.content?.author.id} />
              <AvatarFallback className="text-xs">
                {item.content?.author.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {item.content?.author.name || 'Unknown'}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {item.content?.author.email || ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => getPriorityBadge(row.original.priority),
    },
    {
      accessorKey: 'aiAnalysis',
      header: 'AI Analysis',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-1">
            {getAIQualityBadge(item.aiAnalysis?.qualityScore)}
            {getPlagiarismBadge(
              item.plagiarismCheck?.status,
              item.plagiarismCheck?.similarityScore
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.submittedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => setShowItemDetails(item.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {item.status === 'pending' && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleModerationAction(item.id, 'approve')}
                    className="text-green-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleModerationAction(
                        item.id,
                        'reject',
                        'Content does not meet quality standards'
                      )
                    }
                    className="text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleModerationAction(
                        item.id,
                        'flag',
                        'Flagged for review'
                      )
                    }
                    className="text-orange-600"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Flag
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Original
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (moderationLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Content Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and moderate content across your platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <Button onClick={() => setShowBulkPanel(true)}>
              Bulk Actions ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      <ModerationAnalyticsWidget />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Moderation Queue</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={e => handleSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {showFilters && (
                <ModerationFiltersPanel
                  onFilterChange={handleFilterChange}
                  currentFilters={queryParams}
                />
              )}

              <DataTable
                columns={columns}
                data={moderationData?.items || []}
                onRowSelectionChange={setSelectedItems}
                pagination={{
                  pageIndex: queryParams.page! - 1,
                  pageSize: queryParams.limit!,
                  pageCount: moderationData?.totalPages || 0,
                  onPageChange: handlePageChange,
                }}
                loading={moderationLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights about content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Advanced analytics features will be implemented here
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>
                Configure content moderation policies and automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Moderation settings configuration will be implemented here
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals and Dialogs */}
      {showItemDetails && (
        <ContentModerationDetailsModal
          itemId={showItemDetails}
          onClose={() => setShowItemDetails(null)}
          onModerate={handleModerationAction}
        />
      )}

      {showBulkPanel && (
        <BulkModerationPanel
          selectedItems={selectedItems}
          onClose={() => setShowBulkPanel(false)}
          onExecute={handleBulkAction}
        />
      )}
    </div>
  );
};

export default ContentModerationPage;
