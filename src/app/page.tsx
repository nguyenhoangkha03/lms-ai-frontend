import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Users,
  Video,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description:
      'Personalized learning paths and intelligent recommendations powered by advanced AI.',
  },
  {
    icon: Video,
    title: 'Interactive Video Lessons',
    description:
      'Engaging video content with interactive elements and real-time collaboration.',
  },
  {
    icon: MessageCircle,
    title: '24/7 AI Tutor',
    description:
      'Get instant help and answers from our intelligent chatbot assistant.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Track your progress with detailed analytics and performance insights.',
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    description: 'Connect with peers, join study groups, and learn together.',
  },
  {
    icon: BookOpen,
    title: 'Rich Content Library',
    description:
      'Access thousands of courses across various subjects and skill levels.',
  },
];

const stats = [
  { label: 'Active Students', value: '50,000+' },
  { label: 'Expert Instructors', value: '1,200+' },
  { label: 'Course Completion Rate', value: '95%' },
  { label: 'Countries Served', value: '150+' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="text-primary h-6 w-6" />
              <span className="text-xl font-bold">Smart LMS</span>
            </div>
          </div>
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              href="/features"
              className="hover:text-primary text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-primary text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="hover:text-primary text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary text-sm font-medium"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.LOGIN}>Sign In</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.REGISTER}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Powered by Advanced AI Technology
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            The Future of{' '}
            <span className="text-gradient from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">
              Learning
            </span>{' '}
            is Here
          </h1>
          <p className="text-muted-foreground mt-6 text-lg sm:text-xl">
            Experience personalized education with our AI-powered Learning
            Management System. Adaptive learning paths, intelligent tutoring,
            and real-time analytics to maximize your potential.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={ROUTES.REGISTER}>
                Start Learning Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 border-y py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-primary text-3xl font-bold">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Revolutionizing Education with AI
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Discover how our advanced features transform the way you learn and
            teach.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of learners who are already experiencing the future
            of education.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href={ROUTES.REGISTER}>
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="text-primary h-5 w-5" />
                <span className="font-semibold">Smart LMS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering education through AI-driven learning experiences.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            <p>&copy; 2024 Smart LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
