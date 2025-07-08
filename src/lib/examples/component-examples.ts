export const componentExamples = {
  button: `
// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="outline" size="lg">Large Outline</Button>

// With loading state
<Button loading loadingText="Saving...">Save Course</Button>

// With icons
<Button leftIcon={<Download />} rightIcon={<ChevronRight />}>
  Download Materials
</Button>
  `,

  input: `
// Basic input
<Input placeholder="Enter your email" />

// With label and validation
<Input
  label="Email Address"
  type="email"
  required
  error={errors.email}
  helperText="We'll send course updates here"
/>

// With icons
<Input
  leftIcon={<Search />}
  placeholder="Search courses..."
/>
  `,

  card: `
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Course Title</CardTitle>
    <CardDescription>Course description here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Course content...</p>
  </CardContent>
  <CardFooter>
    <Button>Enroll Now</Button>
  </CardFooter>
</Card>

// Interactive card
<Card hover="lift" className="cursor-pointer">
  <CardContent>
    Interactive course card
  </CardContent>
</Card>
  `,

  modal: `
// Basic modal
<Modal>
  <ModalTrigger asChild>
    <Button>Open Settings</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Course Settings</ModalTitle>
      <ModalDescription>
        Configure your course preferences
      </ModalDescription>
    </ModalHeader>
    <div className="py-4">
      {/* Modal content */}
    </div>
    <ModalFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
  `,

  grid: `
// Responsive grid
<Grid cols={3} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Custom responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {courses.map(course => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
  `,

  theme: `
// Using theme
const { theme, setTheme, toggleTheme } = useTheme();

// Theme-aware styling
<div className={cn(
  'p-4 rounded-lg',
  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
)}>
  Content here
</div>

// CSS variables (automatically switches with theme)
<div className="bg-background text-foreground border-border">
  Theme-aware content
</div>
  `,
};
