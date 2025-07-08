'use client';

import * as React from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Progress,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Container,
  Grid,
  Flex,
  Switch,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  Heart,
  Star,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

export function DesignSystemShowcase() {
  return (
    <Container size="xl" className="py-12">
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Smart LMS Design System
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            A comprehensive component library built for modern educational
            platforms. Consistent, accessible, and beautiful by default.
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Color Palette</h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-lg font-medium">Primary Colors</h3>
              <Flex gap={4} wrap="wrap">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                  shade => (
                    <div key={shade} className="text-center">
                      <div
                        className={`mb-2 h-16 w-16 rounded-lg`}
                        style={{ backgroundColor: `hsl(var(--color-primary))` }}
                      />
                      <p className="font-mono text-xs">primary-{shade}</p>
                    </div>
                  )
                )}
              </Flex>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">Semantic Colors</h3>
              <Flex gap={4}>
                <div className="text-center">
                  <div className="bg-success mb-2 h-16 w-16 rounded-lg" />
                  <p className="font-mono text-xs">success</p>
                </div>
                <div className="text-center">
                  <div className="bg-warning mb-2 h-16 w-16 rounded-lg" />
                  <p className="font-mono text-xs">warning</p>
                </div>
                <div className="text-center">
                  <div className="bg-destructive mb-2 h-16 w-16 rounded-lg" />
                  <p className="font-mono text-xs">error</p>
                </div>
                <div className="text-center">
                  <div className="bg-info mb-2 h-16 w-16 rounded-lg" />
                  <p className="font-mono text-xs">info</p>
                </div>
              </Flex>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Typography</h2>

          <div className="space-y-4">
            <div>
              <h1 className="text-6xl font-bold">Heading 1</h1>
              <p className="text-muted-foreground font-mono text-sm">
                text-6xl font-bold
              </p>
            </div>
            <div>
              <h2 className="text-4xl font-semibold">Heading 2</h2>
              <p className="text-muted-foreground font-mono text-sm">
                text-4xl font-semibold
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-muted-foreground font-mono text-sm">
                text-2xl font-medium
              </p>
            </div>
            <div>
              <h4 className="text-xl font-medium">Heading 4</h4>
              <p className="text-muted-foreground font-mono text-sm">
                text-xl font-medium
              </p>
            </div>
            <div>
              <p className="text-base">
                Body text - Lorem ipsum dolor sit amet, consectetur adipiscing
                elit.
              </p>
              <p className="text-muted-foreground font-mono text-sm">
                text-base
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Small text - Supporting information and captions
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                text-sm text-muted-foreground
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Buttons</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Variants</h3>
              <Flex gap={3} wrap="wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </Flex>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Sizes</h3>
              <Flex gap={3} align="center" wrap="wrap">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </Flex>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">States</h3>
              <Flex gap={3} wrap="wrap">
                <Button>Normal</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Heart className="h-4 w-4" />}>
                  With Icon
                </Button>
                <Button rightIcon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
              </Flex>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Form Components</h2>

          <Grid cols={2} gap={6}>
            <Card padding="md">
              <CardHeader>
                <CardTitle>Input Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Default input" />
                <Input variant="filled" placeholder="Filled input" />
                <Input variant="flushed" placeholder="Flushed input" />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  helperText="We'll never share your email"
                />
                <Input
                  label="Password"
                  type="password"
                  error="Password is required"
                  required
                />
              </CardContent>
            </Card>

            <Card padding="md">
              <CardHeader>
                <CardTitle>Selection Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React Fundamentals</SelectItem>
                    <SelectItem value="vue">Vue.js Complete Guide</SelectItem>
                    <SelectItem value="angular">Angular Mastery</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <label htmlFor="notifications" className="text-sm">
                    Enable notifications
                  </label>
                </div>

                <RadioGroup defaultValue="beginner">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <label htmlFor="beginner" className="text-sm">
                      Beginner
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <label htmlFor="intermediate" className="text-sm">
                      Intermediate
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <label htmlFor="advanced" className="text-sm">
                      Advanced
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Feedback Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Feedback Components</h2>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational alert with some important details.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your course has been successfully published!
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Your subscription will expire in 3 days. Please renew to
                continue.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to upload the video. Please check your connection and try
                again.
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Badges</h3>
            <Flex gap={2} wrap="wrap">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </Flex>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Progress</h3>
            <div className="space-y-2">
              <Progress value={25} />
              <Progress value={50} />
              <Progress value={75} />
              <Progress value={100} />
            </div>
          </div>
        </section>

        {/* Data Display */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Data Display</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Avatars</h3>
              <Flex gap={4} align="center">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">AB</AvatarFallback>
                </Avatar>
              </Flex>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Skeleton Loading</h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Tooltips</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a helpful tooltip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </section>

        {/* Layout Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Layout Examples</h2>

          <div>
            <h3 className="mb-4 text-lg font-medium">Grid System</h3>
            <Grid cols={4} gap={4}>
              <Card padding="sm" className="text-center">
                <p className="text-sm">Col 1</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-sm">Col 2</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-sm">Col 3</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-sm">Col 4</p>
              </Card>
            </Grid>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Course Card Example</h3>
            <Grid cols={3} gap={6}>
              {[1, 2, 3].map(i => (
                <Card key={i} hover="lift" className="overflow-hidden">
                  <div className="from-primary/20 to-primary/5 flex h-48 items-center justify-center bg-gradient-to-br">
                    <p className="text-muted-foreground">Course Thumbnail</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" size="sm">
                        React
                      </Badge>
                      <Badge variant="outline" size="sm">
                        Beginner
                      </Badge>
                    </div>
                    <h3 className="mb-2 font-semibold">React Fundamentals</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Learn the basics of React including components, props, and
                      state management.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-muted-foreground text-sm">
                          (234)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">$29</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <Progress value={75} className="mb-2" />
                    <p className="text-muted-foreground text-xs">
                      75% completed
                    </p>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* Dark Mode Demo */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Dark Mode Support</h2>
          <p className="text-muted-foreground">
            All components automatically adapt to light and dark themes. Use the
            theme toggle in the header to see the difference.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Light Mode Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  <div className="flex h-8 items-center justify-center rounded bg-blue-500 text-sm text-white">
                    Button
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dark Mode Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="h-3 w-3/4 rounded bg-gray-700"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-700"></div>
                  <div className="flex h-8 items-center justify-center rounded bg-blue-500 text-sm text-white">
                    Button
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Usage Guidelines</h2>

          <Grid cols={1} gap={6} className="md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-success">✅ Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Use consistent spacing throughout your designs</p>
                <p>• Choose appropriate semantic colors for different states</p>
                <p>• Maintain proper contrast ratios for accessibility</p>
                <p>• Use loading states for better user experience</p>
                <p>• Provide clear error messages and validation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">❌ Don't</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Mix different button styles in the same context</p>
                <p>• Use colors without considering accessibility</p>
                <p>• Create custom components when existing ones work</p>
                <p>• Ignore responsive design principles</p>
                <p>• Skip proper keyboard navigation support</p>
              </CardContent>
            </Card>
          </Grid>
        </section>
      </div>
    </Container>
  );
}
