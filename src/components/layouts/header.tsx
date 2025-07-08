'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuthStatus } from '@/components/auth/auth-status';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import {
  Search,
  Bell,
  Menu,
  BookOpen,
  MessageSquare,
  Video,
  Brain,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ onMobileMenuToggle, showMobileMenu }: HeaderProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Live Sessions', href: '/video', icon: Video },
    { name: 'AI Tutor', href: '/ai-chat', icon: Brain },
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="mr-6 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="text-primary h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Smart LMS</span>
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:text-foreground/80 flex items-center space-x-2 transition-colors',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Search */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search courses, lessons..."
                className="w-full pl-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* Theme toggle */}
                <ThemeToggle />

                {/* Auth status */}
                <AuthStatus />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="bg-background border-t md:hidden">
          <nav className="container py-4">
            <div className="grid gap-2">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={onMobileMenuToggle}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
