'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/performance/lazy-image';
import { Linkedin, Twitter, Github } from 'lucide-react';

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Head of AI at Google Education. PhD in Computer Science from Stanford.',
    image: '/images/team/sarah-chen.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
    expertise: ['AI Strategy', 'Product Vision', 'EdTech'],
  },
  {
    name: 'Michael Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Senior Engineer at Netflix. Built scalable learning systems for millions of users.',
    image: '/images/team/michael-rodriguez.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
    expertise: ['System Architecture', 'Machine Learning', 'DevOps'],
  },
  {
    name: 'Dr. Emily Watson',
    role: 'Head of AI Research',
    bio: 'Former Research Scientist at OpenAI. Specialist in adaptive learning algorithms.',
    image: '/images/team/emily-watson.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
    expertise: [
      'AI Research',
      'Natural Language Processing',
      'Learning Analytics',
    ],
  },
  {
    name: 'David Kim',
    role: 'VP of Product',
    bio: 'Product leader with 10+ years experience building educational technology.',
    image: '/images/team/david-kim.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
    },
    expertise: ['Product Strategy', 'User Experience', 'Growth'],
  },
  {
    name: 'Lisa Thompson',
    role: 'Head of Education',
    bio: 'Former university professor and curriculum designer with 15+ years in education.',
    image: '/images/team/lisa-thompson.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
    },
    expertise: ['Curriculum Design', 'Pedagogy', 'Assessment'],
  },
  {
    name: 'Alex Johnson',
    role: 'Lead Designer',
    bio: 'Award-winning UX designer focused on creating intuitive learning experiences.',
    image: '/images/team/alex-johnson.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
    },
    expertise: ['UX Design', 'Design Systems', 'Accessibility'],
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-24 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            Our Team
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Meet the Minds Behind the Platform
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Our diverse team of educators, engineers, and AI researchers is
            passionate about transforming education through technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 text-center">
                    <div className="relative mx-auto mb-4 h-24 w-24">
                      <LazyImage
                        src={member.image}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <h3 className="mb-1 text-xl font-semibold">
                      {member.name}
                    </h3>
                    <p className="mb-3 font-medium text-blue-600 dark:text-blue-400">
                      {member.role}
                    </p>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      {member.bio}
                    </p>
                  </div>

                  {/* Expertise Tags */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {member.expertise.map(skill => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3">
                    {member.social.linkedin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                    {member.social.twitter && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    )}
                    {member.social.github && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Join Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="border-none bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="mb-4 text-2xl font-bold">Join Our Team</h3>
              <p className="mb-6 text-lg opacity-90">
                We're always looking for talented individuals who share our
                passion for education and technology.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="secondary" size="lg">
                  View Open Positions
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Learn About Our Culture
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
