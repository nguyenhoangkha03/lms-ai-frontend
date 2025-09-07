'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGetUsersQuery } from '@/lib/redux/api/user-api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Users, 
  MapPin, 
  Calendar,
  ExternalLink,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const {
    data: usersData,
    isLoading,
    error,
  } = useGetUsersQuery({
    page: 1,
    limit: 24,
    search: searchQuery,
    role: selectedRole || undefined,
  });

  const publicUsers = usersData?.users?.filter(user => 
    user.userType !== 'admin' && user.status === 'active'
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 pb-16 pt-12">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-4 text-4xl font-bold">Explore Learners</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Discover amazing learners, connect with peers, and find study partners 
              from our learning community.
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, skills, or interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 pl-12 text-white placeholder:text-white/70 focus:bg-white/20"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto -mt-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRole === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('')}
                >
                  All Users
                </Button>
                <Button
                  variant={selectedRole === 'student' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('student')}
                >
                  Students
                </Button>
                <Button
                  variant={selectedRole === 'teacher' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('teacher')}
                >
                  Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-4 h-16 w-16 rounded-full bg-gray-200 mx-auto"></div>
                  <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Users Grid */}
        {!isLoading && publicUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {publicUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-2">
                    <Avatar className="mx-auto h-16 w-16 mb-3">
                      <AvatarImage 
                        src={user.avatarUrl} 
                        alt={`${user.firstName} ${user.lastName}`} 
                      />
                      <AvatarFallback className="text-lg">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {user.displayName || `${user.firstName} ${user.lastName}`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">@{user.username}</p>
                      
                      <Badge 
                        variant={user.userType === 'teacher' ? 'default' : 'secondary'}
                        className="mb-3"
                      >
                        {user.userType === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* User Stats/Info would go here if available */}
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/profile/${user.username}`}>
                          View Profile
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && publicUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-2xl font-bold">No profiles found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or explore different user types.
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-2xl font-bold text-red-600">Error Loading Profiles</h3>
            <p className="text-gray-600 mb-6">
              We couldn't load the profiles. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center text-white">
              <div className="text-3xl font-bold mb-2">{publicUsers.length}+</div>
              <div className="opacity-90">Active Learners</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl font-bold mb-2">
                {publicUsers.filter(u => u.userType === 'student').length}+
              </div>
              <div className="opacity-90">Students</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl font-bold mb-2">
                {publicUsers.filter(u => u.userType === 'teacher').length}+
              </div>
              <div className="opacity-90">Teachers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}