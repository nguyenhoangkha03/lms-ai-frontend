'use client';

import React, { useState } from 'react';
import {
  Shield,
  Scan,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Lock,
  Unlock,
  UserCheck,
  Users,
  Globe,
  FileX,
  Bug,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  ImageIcon,
  Video,
  Music,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import {
  useGetFilesQuery,
  useScanFileMutation,
  useGetSecurityScanResultsQuery,
  useModerateFileMutation,
} from '@/lib/redux/api/file-management-api';
import {
  FileUpload,
  FileSecurityScan,
  SecurityThreat,
  ContentFlag,
} from '@/lib/types/file-management';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface FileSecurityPanelProps {
  className?: string;
}

export function FileSecurityPanel({ className }: FileSecurityPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedScanType, setSelectedScanType] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanInProgress, setScanInProgress] = useState(false);

  // Fetch files for security monitoring
  const {
    data: filesData,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useGetFilesQuery({
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Mutations
  const [scanFile] = useScanFileMutation();
  const [moderateFile] = useModerateFileMutation();

  const files = filesData?.files || [];

  // Filter files based on security status
  const securityStats = {
    totalFiles: files.length,
    scannedFiles: files.filter(f => f.securityScan).length,
    cleanFiles: files.filter(
      f =>
        f.securityScan?.results.virusScan?.clean &&
        f.securityScan?.results.contentScan?.appropriate
    ).length,
    flaggedFiles: files.filter(
      f => f.isFlagged || (f.securityScan?.riskScore || 0) > 70
    ).length,
    pendingScans: files.filter(
      f =>
        f.securityScan?.status === 'pending' ||
        f.securityScan?.status === 'scanning'
    ).length,
  };

  // Handle security scan
  const handleSecurityScan = async (
    fileIds: string[],
    scanTypes: Array<'virus' | 'malware' | 'content' | 'metadata'>
  ) => {
    setScanInProgress(true);

    try {
      for (const fileId of fileIds) {
        await scanFile({ id: fileId, scanTypes }).unwrap();
      }

      toast.success(`Security scan initiated for ${fileIds.length} file(s)`);
      setShowScanDialog(false);
      setSelectedFiles([]);
      refetchFiles();
    } catch (error) {
      toast.error('Failed to initiate security scan');
    } finally {
      setScanInProgress(false);
    }
  };

  // Handle file moderation
  const handleFileModeration = async (
    fileId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => {
    try {
      await moderateFile({ id: fileId, action, reason }).unwrap();
      toast.success(`File ${action}ed successfully`);
      refetchFiles();
    } catch (error) {
      toast.error(`Failed to ${action} file`);
    }
  };

  // Get risk level color
  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get risk level badge
  const getRiskLevelBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 60)
      return (
        <Badge variant="outline" className="border-orange-600 text-orange-600">
          Medium Risk
        </Badge>
      );
    if (riskScore >= 30)
      return (
        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
          Low Risk
        </Badge>
      );
    return (
      <Badge variant="outline" className="border-green-600 text-green-600">
        Clean
      </Badge>
    );
  };

  // Filter files based on search and filters
  const filteredFiles = files.filter(file => {
    const matchesSearch =
      !searchQuery ||
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRiskLevel =
      selectedRiskLevel === 'all' ||
      (selectedRiskLevel === 'high' &&
        (file.securityScan?.riskScore || 0) >= 80) ||
      (selectedRiskLevel === 'medium' &&
        (file.securityScan?.riskScore || 0) >= 60 &&
        (file.securityScan?.riskScore || 0) < 80) ||
      (selectedRiskLevel === 'low' &&
        (file.securityScan?.riskScore || 0) >= 30 &&
        (file.securityScan?.riskScore || 0) < 60) ||
      (selectedRiskLevel === 'clean' &&
        (file.securityScan?.riskScore || 0) < 30);

    return matchesSearch && matchesRiskLevel;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Security</h2>
          <p className="text-muted-foreground">
            Monitor file security, scanning, and access control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
            <DialogTrigger asChild>
              <Button>
                <Scan className="mr-2 h-4 w-4" />
                Security Scan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initiate Security Scan</DialogTitle>
                <DialogDescription>
                  Select files and scan types to perform security analysis
                </DialogDescription>
              </DialogHeader>
              <SecurityScanDialog
                selectedFiles={selectedFiles}
                onScan={handleSecurityScan}
                scanning={scanInProgress}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => refetchFiles()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Files
                </p>
                <p className="text-2xl font-bold">{securityStats.totalFiles}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scanned
                </p>
                <p className="text-2xl font-bold">
                  {securityStats.scannedFiles}
                </p>
                <Progress
                  value={
                    (securityStats.scannedFiles / securityStats.totalFiles) *
                    100
                  }
                  className="mt-2 h-1"
                />
              </div>
              <Scan className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Clean
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {securityStats.cleanFiles}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Flagged
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {securityStats.flaggedFiles}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scanning
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {securityStats.pendingScans}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedRiskLevel}
            onValueChange={setSelectedRiskLevel}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="clean">Clean</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedScanType} onValueChange={setSelectedScanType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Scan Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scans</SelectItem>
              <SelectItem value="virus">Virus Scan</SelectItem>
              <SelectItem value="malware">Malware Scan</SelectItem>
              <SelectItem value="content">Content Scan</SelectItem>
              <SelectItem value="metadata">Metadata Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{selectedFiles.length} files selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowScanDialog(true)}>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    selectedFiles.forEach(fileId =>
                      handleFileModeration(
                        fileId,
                        'flag',
                        'Bulk flagged for review'
                      )
                    );
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Flag Selected
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedFiles([])}
            >
              Clear Selection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="content">Content Issues</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SecurityOverviewPanel
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onSelectFile={(fileId, selected) => {
              if (selected) {
                setSelectedFiles(prev => [...prev, fileId]);
              } else {
                setSelectedFiles(prev => prev.filter(id => id !== fileId));
              }
            }}
            onModerate={handleFileModeration}
          />
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <ThreatDetectionPanel
            files={filteredFiles.filter(
              f =>
                (f.securityScan?.results.virusScan?.threats?.length ?? 0) > 0 ||
                (f.securityScan?.results.malwareScan?.threats?.length ?? 0) > 0
            )}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentModerationPanel
            files={filteredFiles.filter(
              f =>
                (f.securityScan?.results.contentScan?.flags?.length ?? 0) > 0 ||
                f.securityScan?.results.contentScan?.appropriate === false
            )}
            onModerate={handleFileModeration}
          />
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <AccessControlPanel files={filteredFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Security Scan Dialog
interface SecurityScanDialogProps {
  selectedFiles: string[];
  onScan: (
    fileIds: string[],
    scanTypes: Array<'virus' | 'malware' | 'content' | 'metadata'>
  ) => void;
  scanning: boolean;
}

function SecurityScanDialog({
  selectedFiles,
  onScan,
  scanning,
}: SecurityScanDialogProps) {
  const [scanTypes, setScanTypes] = useState<
    Array<'virus' | 'malware' | 'content' | 'metadata'>
  >(['virus', 'content']);

  const handleScanTypeChange = (
    type: 'virus' | 'malware' | 'content' | 'metadata',
    checked: boolean
  ) => {
    if (checked) {
      setScanTypes(prev => [...prev, type]);
    } else {
      setScanTypes(prev => prev.filter(t => t !== type));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} files selected for scanning`
            : 'No files selected. Select files from the list below.'}
        </p>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="virus-scan"
              checked={scanTypes.includes('virus')}
              onCheckedChange={checked =>
                handleScanTypeChange('virus', checked as boolean)
              }
            />
            <label htmlFor="virus-scan" className="text-sm font-medium">
              Virus Scan - Detect known viruses and malicious code
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="malware-scan"
              checked={scanTypes.includes('malware')}
              onCheckedChange={checked =>
                handleScanTypeChange('malware', checked as boolean)
              }
            />
            <label htmlFor="malware-scan" className="text-sm font-medium">
              Malware Scan - Detect trojans, ransomware, and suspicious behavior
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="content-scan"
              checked={scanTypes.includes('content')}
              onCheckedChange={checked =>
                handleScanTypeChange('content', checked as boolean)
              }
            />
            <label htmlFor="content-scan" className="text-sm font-medium">
              Content Scan - Check for inappropriate or harmful content
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="metadata-scan"
              checked={scanTypes.includes('metadata')}
              onCheckedChange={checked =>
                handleScanTypeChange('metadata', checked as boolean)
              }
            />
            <label htmlFor="metadata-scan" className="text-sm font-medium">
              Metadata Scan - Analyze file metadata for privacy concerns
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={() => onScan(selectedFiles, scanTypes)}
          disabled={
            selectedFiles.length === 0 || scanTypes.length === 0 || scanning
          }
        >
          {scanning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Security Overview Panel
interface SecurityOverviewPanelProps {
  files: FileUpload[];
  selectedFiles: string[];
  onSelectFile: (fileId: string, selected: boolean) => void;
  onModerate: (
    fileId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => void;
}

function SecurityOverviewPanel({
  files,
  selectedFiles,
  onSelectFile,
  onModerate,
}: SecurityOverviewPanelProps) {
  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No files found</h3>
            <p className="text-muted-foreground">
              Upload some files to start security monitoring
            </p>
          </CardContent>
        </Card>
      ) : (
        files.map(file => (
          <SecurityFileCard
            key={file.id}
            file={file}
            selected={selectedFiles.includes(file.id)}
            onSelect={selected => onSelectFile(file.id, selected)}
            onModerate={onModerate}
          />
        ))
      )}
    </div>
  );
}

// Security File Card
interface SecurityFileCardProps {
  file: FileUpload;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onModerate: (
    fileId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => void;
}

function SecurityFileCard({
  file,
  selected,
  onSelect,
  onModerate,
}: SecurityFileCardProps) {
  const riskScore = file.securityScan?.riskScore || 0;
  const scanStatus = file.securityScan?.status;

  return (
    <Card
      className={cn(
        'transition-all',
        selected && 'ring-2 ring-blue-500',
        riskScore >= 80 && 'border-red-200 bg-red-50/50',
        riskScore >= 60 && riskScore < 80 && 'border-orange-200 bg-orange-50/50'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Checkbox checked={selected} onCheckedChange={onSelect} />

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{file.originalName}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>Uploaded {formatDate(file.createdAt)}</span>
                  <Badge variant="outline">{file.accessLevel}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getRiskLevelBadge(riskScore)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onModerate(file.id, 'approve')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onModerate(file.id, 'flag', 'Manual review required')
                      }
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Flag for Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onModerate(file.id, 'reject', 'Security violation')
                      }
                      className="text-destructive"
                    >
                      <FileX className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Security Status */}
            {file.securityScan ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {scanStatus === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {scanStatus === 'scanning' && (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {scanStatus === 'failed' && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {scanStatus === 'completed' && 'Scan completed'}
                      {scanStatus === 'scanning' && 'Scanning in progress...'}
                      {scanStatus === 'failed' && 'Scan failed'}
                      {scanStatus === 'pending' && 'Scan pending'}
                    </span>
                  </div>

                  {scanStatus === 'completed' && (
                    <span
                      className={cn(
                        'font-medium',
                        getRiskLevelColor(riskScore)
                      )}
                    >
                      Risk Score: {riskScore}/100
                    </span>
                  )}
                </div>

                {/* Scan Results Summary */}
                {scanStatus === 'completed' && file.securityScan.results && (
                  <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                    {file.securityScan.results.virusScan && (
                      <div className="flex items-center gap-1">
                        {file.securityScan.results.virusScan.clean ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                        <span>
                          Virus:{' '}
                          {file.securityScan.results.virusScan.clean
                            ? 'Clean'
                            : 'Threats'}
                        </span>
                      </div>
                    )}

                    {file.securityScan.results.contentScan && (
                      <div className="flex items-center gap-1">
                        {file.securityScan.results.contentScan.appropriate ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                        <span>
                          Content:{' '}
                          {file.securityScan.results.contentScan.appropriate
                            ? 'Appropriate'
                            : 'Flagged'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  No security scan performed.{' '}
                  <Button variant="link" className="h-auto p-0">
                    Run scan
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Moderation Status */}
            {file.isFlagged && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This file has been flagged for manual review.
                  {file.moderationNotes && ` Reason: ${file.moderationNotes}`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Threat Detection Panel
interface ThreatDetectionPanelProps {
  files: FileUpload[];
}

function ThreatDetectionPanel({ files }: ThreatDetectionPanelProps) {
  const allThreats: Array<{
    file: FileUpload;
    threat: SecurityThreat;
    type: 'virus' | 'malware';
  }> = [];

  files.forEach(file => {
    if (file.securityScan?.results.virusScan?.threats) {
      file.securityScan.results.virusScan.threats.forEach(threat => {
        allThreats.push({ file, threat, type: 'virus' });
      });
    }
    if (file.securityScan?.results.malwareScan?.threats) {
      file.securityScan.results.malwareScan.threats.forEach(threat => {
        allThreats.push({ file, threat, type: 'malware' });
      });
    }
  });

  const threatsByseverity = allThreats.reduce(
    (groups, item) => {
      const severity = item.threat.severity;
      if (!groups[severity]) groups[severity] = [];
      groups[severity].push(item);
      return groups;
    },
    {} as Record<string, typeof allThreats>
  );

  return (
    <div className="space-y-6">
      {allThreats.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">No Threats Detected</h3>
            <p className="text-muted-foreground">
              All scanned files are clean and safe
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(threatsByseverity)
          .sort(([a], [b]) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 };
            return (
              order[a as keyof typeof order] - order[b as keyof typeof order]
            );
          })
          .map(([severity, threats]) => (
            <Card key={severity}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug
                    className={cn(
                      'h-5 w-5',
                      severity === 'critical' && 'text-red-600',
                      severity === 'high' && 'text-orange-600',
                      severity === 'medium' && 'text-yellow-600',
                      severity === 'low' && 'text-blue-600'
                    )}
                  />
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}{' '}
                  Severity Threats ({threats.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threats.map(({ file, threat, type }, index) => (
                    <div
                      key={`${file.id}-${index}`}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <AlertTriangle
                        className={cn(
                          'mt-0.5 h-5 w-5',
                          severity === 'critical' && 'text-red-600',
                          severity === 'high' && 'text-orange-600',
                          severity === 'medium' && 'text-yellow-600',
                          severity === 'low' && 'text-blue-600'
                        )}
                      />

                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium">{threat.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {threat.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>File: {file.originalName}</span>
                          {threat.location && (
                            <span>Location: {threat.location}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="destructive">
                          <FileX className="mr-2 h-4 w-4" />
                          Quarantine
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}

// Content Moderation Panel
interface ContentModerationPanelProps {
  files: FileUpload[];
  onModerate: (
    fileId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => void;
}

function ContentModerationPanel({
  files,
  onModerate,
}: ContentModerationPanelProps) {
  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">No Content Issues</h3>
            <p className="text-muted-foreground">
              All content has been reviewed and approved
            </p>
          </CardContent>
        </Card>
      ) : (
        files.map(file => (
          <Card key={file.id} className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-1 h-6 w-6 text-orange-600" />

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold">{file.originalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.fileSize)} • Uploaded{' '}
                      {formatDate(file.createdAt)}
                    </p>
                  </div>

                  {/* Content Flags */}
                  {file.securityScan?.results.contentScan?.flags && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Content Issues:</h5>
                      <div className="space-y-1">
                        {file.securityScan.results.contentScan.flags.map(
                          (flag: ContentFlag, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {flag.type}
                                </Badge>
                                <span>{flag.description}</span>
                              </div>
                              <span className="text-muted-foreground">
                                {Math.round(flag.confidence * 100)}% confidence
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        onModerate(
                          file.id,
                          'approve',
                          'Content reviewed and approved'
                        )
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onModerate(
                          file.id,
                          'flag',
                          'Requires additional review'
                        )
                      }
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        onModerate(file.id, 'reject', 'Inappropriate content')
                      }
                    >
                      <FileX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// Access Control Panel
interface AccessControlPanelProps {
  files: FileUpload[];
}

function AccessControlPanel({ files }: AccessControlPanelProps) {
  const accessStats = files.reduce(
    (stats, file) => {
      stats[file.accessLevel] = (stats[file.accessLevel] || 0) + 1;
      return stats;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Access Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Object.entries({
              public: {
                icon: Globe,
                color: 'text-green-600',
                description: 'Anyone can access',
              },
              enrolled_only: {
                icon: UserCheck,
                color: 'text-blue-600',
                description: 'Course students only',
              },
              premium_only: {
                icon: Users,
                color: 'text-purple-600',
                description: 'Premium members only',
              },
              private: {
                icon: Lock,
                color: 'text-red-600',
                description: 'Restricted access',
              },
            }).map(([level, config]) => {
              const Icon = config.icon;
              const count = accessStats[level] || 0;

              return (
                <div key={level} className="rounded-lg border p-4 text-center">
                  <Icon className={cn('mx-auto mb-2 h-8 w-8', config.color)} />
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm font-medium capitalize">
                    {level.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Access Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Access Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock access events */}
            {[
              {
                action: 'download',
                file: 'course-video.mp4',
                user: 'student@example.com',
                time: '2 minutes ago',
                ip: '192.168.1.100',
              },
              {
                action: 'view',
                file: 'lesson-slides.pdf',
                user: 'teacher@example.com',
                time: '5 minutes ago',
                ip: '192.168.1.101',
              },
              {
                action: 'share',
                file: 'assignment.docx',
                user: 'admin@example.com',
                time: '10 minutes ago',
                ip: '192.168.1.102',
              },
            ].map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      event.action === 'download' && 'bg-blue-500',
                      event.action === 'view' && 'bg-green-500',
                      event.action === 'share' && 'bg-purple-500'
                    )}
                  />
                  <div>
                    <p className="font-medium">{event.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.action} {event.file}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{event.time}</p>
                  <p>{event.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>File Permissions Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Access Level</th>
                  <th className="p-2 text-center">View</th>
                  <th className="p-2 text-center">Download</th>
                  <th className="p-2 text-center">Share</th>
                  <th className="p-2 text-center">Edit</th>
                  <th className="p-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    level: 'Public',
                    permissions: [true, true, true, false, false],
                  },
                  {
                    level: 'Enrolled Only',
                    permissions: [true, true, true, false, false],
                  },
                  {
                    level: 'Premium Only',
                    permissions: [true, true, false, false, false],
                  },
                  {
                    level: 'Private',
                    permissions: [false, false, false, true, true],
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{row.level}</td>
                    {row.permissions.map((permitted, i) => (
                      <td key={i} className="p-2 text-center">
                        {permitted ? (
                          <CheckCircle className="mx-auto h-4 w-4 text-green-600" />
                        ) : (
                          <div className="mx-auto h-4 w-4 rounded-full bg-gray-200" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get file icon
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'document':
      return FileText;
    default:
      return FileText;
  }
}

// Helper function to get risk level color
function getRiskLevelColor(riskScore: number) {
  if (riskScore >= 80) return 'text-red-600';
  if (riskScore >= 60) return 'text-orange-600';
  if (riskScore >= 30) return 'text-yellow-600';
  return 'text-green-600';
}

// Helper function to get risk level badge
function getRiskLevelBadge(riskScore: number) {
  if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
  if (riskScore >= 60)
    return (
      <Badge variant="outline" className="border-orange-600 text-orange-600">
        Medium Risk
      </Badge>
    );
  if (riskScore >= 30)
    return (
      <Badge variant="outline" className="border-yellow-600 text-yellow-600">
        Low Risk
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-green-600 text-green-600">
      Clean
    </Badge>
  );
}
