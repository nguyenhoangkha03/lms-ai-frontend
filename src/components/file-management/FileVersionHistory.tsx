'use client';

import React, { useState } from 'react';
import {
  History,
  Download,
  RotateCcw,
  Eye,
  Plus,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import {
  useGetFileVersionsQuery,
  useCreateFileVersionMutation,
  useRestoreFileVersionMutation,
} from '@/lib/redux/api/file-management-api';
import { FileVersion } from '@/lib/types/file-management';
import { formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface FileVersionHistoryProps {
  fileId: string;
  onVersionRestore?: () => void;
}

export function FileVersionHistory({
  fileId,
  onVersionRestore,
}: FileVersionHistoryProps) {
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');

  const {
    data: versions,
    isLoading,
    error,
    refetch,
  } = useGetFileVersionsQuery(fileId);

  const [createFileVersion, { isLoading: isCreating }] =
    useCreateFileVersionMutation();
  const [restoreFileVersion, { isLoading: isRestoring }] =
    useRestoreFileVersionMutation();

  const handleCreateVersion = async () => {
    if (!newVersionFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      await createFileVersion({
        fileId,
        file: newVersionFile,
        versionNotes: versionNotes || undefined,
      }).unwrap();

      toast.success('New version created successfully');
      setShowCreateVersion(false);
      setNewVersionFile(null);
      setVersionNotes('');
      refetch();
    } catch (error) {
      toast.error('Failed to create new version');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await restoreFileVersion({
        fileId,
        versionId,
      }).unwrap();

      toast.success('Version restored successfully');
      onVersionRestore?.();
      refetch();
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load version history. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>

          <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
                <DialogDescription>
                  Upload a new version of this file
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>New File</Label>
                  <Input
                    type="file"
                    onChange={e =>
                      setNewVersionFile(e.target.files?.[0] || null)
                    }
                  />
                  {newVersionFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {newVersionFile.name} (
                      {formatFileSize(newVersionFile.size)})
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Version Notes (optional)</Label>
                  <Textarea
                    placeholder="Describe what changed in this version..."
                    value={versionNotes}
                    onChange={e => setVersionNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateVersion(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={!newVersionFile || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Version'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {!versions || versions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <h3 className="mb-2 font-medium">No Version History</h3>
            <p className="text-sm">
              This is the original version of the file. Create a new version to
              start tracking changes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Version */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    Current Version
                  </Badge>
                  <span className="font-medium">v{versions.length + 1}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Active
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This is the currently active version of the file
              </p>
            </div>

            <Separator />

            {/* Version History */}
            <div className="space-y-3">
              {versions
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map(version => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    onRestore={() => handleRestoreVersion(version.id)}
                    isRestoring={isRestoring}
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VersionItemProps {
  version: FileVersion;
  onRestore: () => void;
  isRestoring: boolean;
}

function VersionItem({ version, onRestore, isRestoring }: VersionItemProps) {
  const [showChanges, setShowChanges] = useState(false);

  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium">
                Version {version.versionNumber}
              </span>
              {version.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {version.createdBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(version.createdAt)}
              </span>
              <span>{formatFileSize(version.fileSize)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          {!version.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRestore}
              disabled={isRestoring}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Version Notes */}
      {version.versionNotes && (
        <div className="mb-3">
          <p className="rounded bg-muted/50 p-2 text-sm">
            {version.versionNotes}
          </p>
        </div>
      )}

      {/* Changes Summary */}
      {version.changes && version.changes.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChanges(!showChanges)}
            className="h-auto p-1 text-xs"
          >
            {showChanges ? 'Hide' : 'Show'} Changes ({version.changes.length})
          </Button>

          {showChanges && (
            <div className="mt-2 space-y-2">
              {version.changes.map((change, index) => (
                <div
                  key={index}
                  className="rounded border-l-2 border-blue-500 bg-muted/30 p-2 text-xs"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {change.type}
                    </Badge>
                    <span className="font-medium">{change.field}</span>
                  </div>
                  <p className="text-muted-foreground">{change.description}</p>
                  {change.oldValue !== change.newValue && (
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-red-600">Old:</span>{' '}
                        {change.oldValue}
                      </div>
                      <div>
                        <span className="text-green-600">New:</span>{' '}
                        {change.newValue}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
