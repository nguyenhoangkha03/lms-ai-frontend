'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { ChatRoomList } from '@/components/communication/chat/ChatRoomList';
import { ChatRoomInterface } from '@/components/communication/chat/ChatRoomInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  MessageSquare,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});

  // Socket connection status
  useEffect(() => {
    if (connected) {
      toast.success('Connected to chat');
    } else {
      toast.error('Disconnected from chat');
    }
  }, [connected]);

  // Handle online presence
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (userData: any) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userData.userId]: userData,
      }));
    };

    const handleUserOffline = (userData: any) => {
      setOnlineUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[userData.userId];
        return newUsers;
      });
    };

    const handleBulkPresence = (users: any[]) => {
      const userMap = users.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
      }, {});
      setOnlineUsers(userMap);
    };

    socket.on('presence:update', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('presence:bulk', handleBulkPresence);

    return () => {
      socket.off('presence:update', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('presence:bulk', handleBulkPresence);
    };
  }, [socket]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="mb-4 text-gray-600">
              Please log in to access the chat system.
            </p>
            <Button onClick={() => (window.location.href = '/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chatContent = (
    <div
      className={cn(
        'flex h-screen flex-col bg-gray-50',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Chat System</h1>

          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                connected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Online users count */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{Object.keys(onlineUsers).length} online</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Controls */}
          <Button variant="ghost" size="sm" onClick={handleToggleSidebar}>
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleToggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {!isSidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <ChatRoomList
                  selectedRoomId={selectedRoomId || undefined}
                  onRoomSelect={handleRoomSelect}
                  className="h-full"
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Chat Area */}
          <ResizablePanel defaultSize={isSidebarCollapsed ? 100 : 75}>
            {selectedRoomId ? (
              <ChatRoomInterface
                roomId={selectedRoomId}
                onClose={() => setSelectedRoomId(null)}
                className="h-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-white">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Welcome to Chat
                  </h3>
                  <p className="mb-4 max-w-md text-gray-600">
                    Select a room from the sidebar to start chatting, or create
                    a new room to begin conversations.
                  </p>

                  {/* Quick stats */}
                  <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-xl font-semibold text-gray-900">
                        {Object.keys(onlineUsers).length}
                      </div>
                      <div className="text-sm text-gray-600">Online</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-xl font-semibold text-gray-900">
                        {connected ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                  </div>

                  {/* Welcome tips */}
                  <div className="mx-auto mt-8 max-w-md text-left">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Getting Started:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Select a room to join conversations</li>
                      <li>• Create new rooms for specific topics</li>
                      <li>• Use @mentions to notify other users</li>
                      <li>• Share files by dragging and dropping</li>
                      <li>• Start threads for organized discussions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );

  return chatContent;
}
