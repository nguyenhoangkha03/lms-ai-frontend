import React from 'react';
import {
  ConfirmationModal,
  FormModal,
  Modal,
  useModal,
} from '../ui/enhanced-modal';
import { useTheme } from '@/contexts/theme-context';
import {
  Bell,
  Download,
  Heart,
  Settings,
  Star,
  Upload,
  User,
} from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import { ButtonGroup, IconButton, Button } from '../ui/enhanced-button';
import { PasswordInput, SearchInput, Input } from '../ui/enhanced-input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { ResponsiveContainer } from '../ui/responsive-container';
import { ResponsiveGrid } from '../ui/responsive-grid';
import { ResponsiveStack } from '../ui/responsive-stack';
import { Breadcrumb } from '../navigation/breadcrumb';
import { Pagination } from '../navigation/pagination';
import { Stepper } from '../navigation/stepper';
import { Tabs } from '../ui/tabs';

export const StyleGuide: React.FC = () => {
  const { theme, toggleTheme, actualTheme } = useTheme();
  const modal = useModal();
  const formModal = useModal();
  const confirmModal = useModal();

  const [activeTab, setActiveTab] = React.useState('components');
  const [currentPage, setPagination] = React.useState(1);
  const [stepperStep, setStepperStep] = React.useState('step-1');

  const tabs = [
    { id: 'colors', label: 'Colors', icon: <Heart className="h-4 w-4" /> },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Components' },
    { id: 'layout', label: 'Layout' },
    { id: 'navigation', label: 'Navigation' },
  ];

  const breadcrumbItems = [
    { label: 'Design System', href: '/design-system' },
    { label: 'Style Guide', current: true },
  ];

  const stepperSteps = [
    {
      id: 'step-1',
      title: 'Basic Information',
      description: 'Enter your details',
    },
    { id: 'step-2', title: 'Preferences', description: 'Set your preferences' },
    { id: 'step-3', title: 'Review', description: 'Review and confirm' },
    { id: 'step-4', title: 'Complete', description: 'All done!' },
  ];

  const renderColorPalette = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Primary Colors</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-11">
          {Object.entries(designTokens.colors.primary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="h-16 w-full rounded-md border shadow-sm"
                style={{ backgroundColor: value }}
              />
              <div className="mt-2 text-xs">
                <div className="font-medium">{key}</div>
                <div className="text-muted-foreground">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Semantic Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(designTokens.colors.semantic).map(
            ([colorName, colorValues]) => (
              <div key={colorName}>
                <h4 className="mb-2 font-medium capitalize">{colorName}</h4>
                <div className="space-y-1">
                  {Object.entries(colorValues).map(([shade, value]) => (
                    <div key={shade} className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-xs">
                        {shade}: {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">AI Theme Colors</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Object.entries(designTokens.colors.ai).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="h-16 w-full rounded-md border shadow-sm"
                style={{ backgroundColor: value }}
              />
              <div className="mt-2 text-xs">
                <div className="font-medium capitalize">{key}</div>
                <div className="text-muted-foreground">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Font Families</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Sans (Inter)</h4>
            <p className="font-sans text-lg">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Heading (Cal Sans)</h4>
            <p className="font-heading text-lg">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Monospace</h4>
            <p className="font-mono text-lg">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Font Sizes</h3>
        <div className="space-y-2">
          {Object.entries(designTokens.typography.fontSize).map(
            ([size, [fontSize, config]]) => (
              <div key={size} className="flex items-center gap-4">
                <span className="w-12 text-sm text-muted-foreground">
                  {size}
                </span>
                <span style={{ fontSize, lineHeight: config.lineHeight }}>
                  Sample text ({fontSize})
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Font Weights</h3>
        <div className="space-y-2">
          {Object.entries(designTokens.typography.fontWeight).map(
            ([weight, value]) => (
              <div key={weight} className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">
                  {weight}
                </span>
                <span style={{ fontWeight: value }}>
                  Sample text (weight: {value})
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-8">
      {/* Buttons */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Buttons</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="ai">AI Theme</Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Sizes</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">States</h4>
            <div className="flex flex-wrap gap-2">
              <Button>Normal</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<Download />}>With Left Icon</Button>
              <Button rightIcon={<Upload />}>With Right Icon</Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Button Group</h4>
            <ButtonGroup>
              <Button variant="outline">Option 1</Button>
              <Button variant="outline">Option 2</Button>
              <Button variant="outline">Option 3</Button>
            </ButtonGroup>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Icon Buttons</h4>
            <div className="flex gap-2">
              <IconButton icon={<Heart />} aria-label="Like" />
              <IconButton
                icon={<Star />}
                variant="outline"
                aria-label="Favorite"
              />
              <IconButton
                icon={<Settings />}
                variant="ghost"
                aria-label="Settings"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Inputs</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input placeholder="Default input" />
            <Input placeholder="With label" label="Email Address" />
            <Input
              placeholder="With helper text"
              helper="This is helper text"
            />
            <Input placeholder="With error" error="This field is required" />
            <Input placeholder="With success" success="Looks good!" />
            <Input placeholder="Disabled input" disabled />
          </div>

          <div>
            <h4 className="mb-2 font-medium">Input Variants</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input placeholder="Default variant" variant="default" />
              <Input placeholder="Filled variant" variant="filled" />
              <Input placeholder="Underlined variant" variant="underlined" />
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Specialized Inputs</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SearchInput placeholder="Search..." />
              <PasswordInput placeholder="Password" />
              <Input leftIcon={<User />} placeholder="With left icon" />
              <Input rightIcon={<Bell />} placeholder="With right icon" />
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Textarea</h4>
            <Textarea placeholder="Enter your message..." rows={4} />
          </div>
        </div>
      </div>

      {/* Other Components */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Other Components</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Badges</h4>
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Avatars</h4>
            <div className="flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Cards</h4>
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content with some example text.</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Modals</h4>
            <div className="flex gap-2">
              <Button onClick={modal.openModal}>Basic Modal</Button>
              <Button onClick={formModal.openModal}>Form Modal</Button>
              <Button onClick={confirmModal.openModal} variant="destructive">
                Confirmation Modal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayout = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Responsive Containers</h3>
        <ResponsiveContainer className="rounded-md bg-muted p-4">
          <p>
            This container adapts to different screen sizes with responsive
            padding and max-width.
          </p>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Responsive Grid</h3>
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="1rem">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-md bg-muted p-4 text-center">
              Item {i + 1}
            </div>
          ))}
        </ResponsiveGrid>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Responsive Stack</h3>
        <ResponsiveStack
          direction={{ xs: 'column', md: 'row' }}
          spacing="1rem"
          className="rounded-md bg-muted p-4"
        >
          <div className="rounded bg-background p-3">Item 1</div>
          <div className="rounded bg-background p-3">Item 2</div>
          <div className="rounded bg-background p-3">Item 3</div>
        </ResponsiveStack>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Breadcrumb</h3>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Pagination</h3>
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setPagination}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Stepper</h3>
        <Stepper
          steps={stepperSteps}
          currentStep={stepperStep}
          completedSteps={['step-1']}
          onStepClick={setStepperStep}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'colors':
        return renderColorPalette();
      case 'typography':
        return renderTypography();
      case 'components':
        return renderComponents();
      case 'layout':
        return renderLayout();
      case 'navigation':
        return renderNavigation();
      default:
        return renderComponents();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <ResponsiveContainer maxWidth="1200px">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">LMS AI Design System</h1>
              <p className="text-muted-foreground">
                A comprehensive design system for the LMS AI platform
              </p>
            </div>
            <Button onClick={toggleTheme} variant="outline">
              Current Theme: {actualTheme}
            </Button>
          </div>

          {/* Navigation */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />

          {/* Content */}
          <div className="min-h-[600px]">{renderContent()}</div>
        </div>

        {/* Modals */}
        <Modal open={modal.open} onOpenChange={modal.setOpen}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Basic Modal</Modal.Title>
              <Modal.Description>
                This is a basic modal example with header, body, and footer.
              </Modal.Description>
            </Modal.Header>
            <Modal.Body>
              <p>
                Modal content goes here. You can put any content inside the
                modal body.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onClick={modal.closeModal}>
                Cancel
              </Button>
              <Button onClick={modal.closeModal}>Confirm</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>

        <FormModal
          open={formModal.open}
          onOpenChange={formModal.setOpen}
          title="Form Modal"
          description="This is a form modal example"
          onSubmit={() => {
            console.log('Form submitted');
            formModal.closeModal();
          }}
        >
          <div className="space-y-4">
            <Input label="Name" placeholder="Enter your name" />
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Textarea label="Message" placeholder="Enter your message" />
          </div>
        </FormModal>

        <ConfirmationModal
          open={confirmModal.open}
          onOpenChange={confirmModal.setOpen}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          variant="destructive"
          confirmText="Delete"
          onConfirm={() => {
            console.log('Item deleted');
            confirmModal.closeModal();
          }}
        />
      </ResponsiveContainer>
    </div>
  );
};
