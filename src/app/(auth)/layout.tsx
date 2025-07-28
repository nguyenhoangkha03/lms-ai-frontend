import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthGroupLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
