'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Activity,
  Clock,
  Globe,
  GraduationCap,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Smartphone,
} from 'lucide-react';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useGetUserPermissionsQuery,
  useGetUserActivityLogsQuery,
} from '@/lib/redux/api/user-management-api';
import { User as UserType } from '@/types/user-management';
import { useRBAC } from '@/hooks/use-rbac';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserDetailsModalProps {
  userId: string;
  onClose: () => void;
  onUserUpdated?: (user: UserType) => void;
}

interface EditableUserData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  userType: string;
  status: string;
  preferredLanguage: string;
  timezone: string;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  onClose,
  onUserUpdated,
}) => {
  const { hasPermission } = useRBAC();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableUserData>({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    userType: '',
    status: '',
    preferredLanguage: '',
    timezone: '',
  });

  // API queries
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId);

  const { data: userPermissions } = useGetUserPermissionsQuery(userId);

  const { data: activityLogs, isLoading: activityLoading } =
    useGetUserActivityLogsQuery({
      userId,
      page: 1,
      limit: 20,
    });

  // API mutations
  const [updateUser] = useUpdateUserMutation();

  // Initialize edit data when user data loads
  React.useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        userType: user.userType || '',
        status: user.status || '',
        preferredLanguage: user.preferredLanguage || '',
        timezone: user.timezone || '',
      });
    }
  }, [user, isEditing]);

  // Handlers
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data if canceling
      if (user) {
        setEditData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          displayName: user.displayName || '',
          email: user.email || '',
          phone: user.phone || '',
          userType: user.userType || '',
          status: user.status || '',
          preferredLanguage: user.preferredLanguage || '',
          timezone: user.timezone || '',
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUser({
        id: userId,
        data: editData as any,
      }).unwrap();

      toast({
        title: 'User updated successfully',
        description: 'User information has been updated.',
      });

      setIsEditing(false);
      onUserUpdated?.(updatedUser);
      refetchUser();
    } catch (error) {
      toast({
        title: 'Error updating user',
        description:
          error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: 'default' as const,
        text: 'Active',
        icon: CheckCircle,
      },
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      inactive: {
        variant: 'outline' as const,
        text: 'Inactive',
        icon: XCircle,
      },
      suspended: {
        variant: 'destructive' as const,
        text: 'Suspended',
        icon: AlertTriangle,
      },
      banned: {
        variant: 'destructive' as const,
        text: 'Banned',
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getUserTypeIcon = (userType: string) => {
    const icons = {
      student: GraduationCap,
      teacher: User,
      admin: Shield,
    };
    return icons[userType as keyof typeof icons] || User;
  };

  const formatLastLogin = (lastLoginAt?: string) => {
    if (!lastLoginAt) return 'Never';

    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (userLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading user details...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (userError || !user) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load user details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const canEdit = hasPermission('user.edit');
  const UserTypeIcon = getUserTypeIcon(user.userType);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {user.displayName}
                  <UserTypeIcon className="h-4 w-4 text-muted-foreground" />
                </DialogTitle>
                <DialogDescription>
                  {user.email} • {getStatusBadge(user.status)}
                </DialogDescription>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditToggle}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-col"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1 overflow-hidden">
              <TabsContent
                value="overview"
                className="h-full space-y-4 overflow-y-auto"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            First Name
                          </label>
                          {isEditing ? (
                            <Input
                              value={editData.firstName}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 text-sm">{user.firstName}</div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Last Name
                          </label>
                          {isEditing ? (
                            <Input
                              value={editData.lastName}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 text-sm">{user.lastName}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Display Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={editData.displayName}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                displayName: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        ) : (
                          <div className="mt-1 text-sm">{user.displayName}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <div className="mt-1 flex items-center gap-2">
                          {isEditing ? (
                            <Input
                              value={editData.email}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              type="email"
                            />
                          ) : (
                            <>
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{user.email}</span>
                              {user.emailVerified && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <div className="mt-1 flex items-center gap-2">
                          {isEditing ? (
                            <Input
                              value={editData.phone}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              type="tel"
                            />
                          ) : (
                            <>
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {user.phone || 'Not provided'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            User Type
                          </label>
                          {isEditing ? (
                            <Select
                              value={editData.userType}
                              onValueChange={value =>
                                setEditData(prev => ({
                                  ...prev,
                                  userType: value,
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1 text-sm capitalize">
                              {user.userType}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          {isEditing ? (
                            <Select
                              value={editData.status}
                              onValueChange={value =>
                                setEditData(prev => ({
                                  ...prev,
                                  status: value,
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                                <SelectItem value="suspended">
                                  Suspended
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1">
                              {getStatusBadge(user.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Account Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {user.failedLoginAttempts}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Failed Attempts
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {user.emailVerified ? '✓' : '✗'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Email Verified
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Last Login</span>
                          <span className="text-sm font-medium">
                            {formatLastLogin(user.lastLoginAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Last IP</span>
                          <span className="text-sm font-medium">
                            {user.lastLoginIp || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Created</span>
                          <span className="text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Updated</span>
                          <span className="text-sm font-medium">
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        {isEditing ? (
                          <Select
                            value={editData.preferredLanguage}
                            onValueChange={value =>
                              setEditData(prev => ({
                                ...prev,
                                preferredLanguage: value,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="vi">Vietnamese</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1 text-sm">
                            {user.preferredLanguage || 'English'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Timezone</label>
                        {isEditing ? (
                          <Input
                            value={editData.timezone}
                            onChange={e =>
                              setEditData(prev => ({
                                ...prev,
                                timezone: e.target.value,
                              }))
                            }
                            className="mt-1"
                            placeholder="UTC+0"
                          />
                        ) : (
                          <div className="mt-1 text-sm">
                            {user.timezone || 'UTC+0'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="profile"
                className="h-full space-y-4 overflow-y-auto"
              >
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Extended profile information would be loaded from
                    user_profiles table
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent
                value="permissions"
                className="h-full space-y-4 overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      User Permissions
                    </CardTitle>
                    <CardDescription>
                      Direct and inherited permissions for this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userPermissions && userPermissions.length > 0 ? (
                      <div className="space-y-2">
                        {userPermissions.map(permission => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {permission.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {permission.resource}.{permission.action}
                              </div>
                            </div>
                            <Badge variant="outline">Direct</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No direct permissions assigned
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="activity"
                className="h-full space-y-4 overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      User activity logs and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="mb-1 h-4 w-full rounded bg-muted"></div>
                            <div className="h-3 w-3/4 rounded bg-muted"></div>
                          </div>
                        ))}
                      </div>
                    ) : activityLogs?.logs && activityLogs.logs.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {activityLogs.logs.map((log: any, index: number) => (
                            <div
                              key={index}
                              className="rounded border p-3 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {log.action}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1 text-muted-foreground">
                                {log.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No activity logs available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="security"
                className="h-full space-y-4 overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Two-Factor Authentication
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Additional security for account access
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.twoFactorEnabled ? (
                          <Badge variant="default">
                            <Smartphone className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">
                          Account Locked
                        </div>
                        <div className="text-sm">
                          {user.lockedUntil ? (
                            <Badge variant="destructive">
                              Until{' '}
                              {new Date(user.lockedUntil).toLocaleString()}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Password Changed
                        </div>
                        <div className="text-sm">
                          {user.passwordChangedAt
                            ? new Date(
                                user.passwordChangedAt
                              ).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
