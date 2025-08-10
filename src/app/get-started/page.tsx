import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { GetStartedChoice } from '@/components/auth/get-started-choice';

export const metadata: Metadata = generateSEO({
  title: 'Get Started - Choose Your Learning Journey',
  description:
    'Join our AI-powered learning platform as a student to learn new skills, or apply as an instructor to share your expertise with learners worldwide.',
  keywords: [
    'Get Started',
    'Student Registration', 
    'Teacher Application',
    'Online Learning',
    'Instructor Registration',
    'AI Learning Platform',
  ],
});

export default function GetStartedPage() {
  return <GetStartedChoice />;
}