# 📁 App Directory Structure

## 🎯 Route Groups Organization

### `(auth)` - Authentication Pages
- `/login` - User login
- `/register` - User registration  
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset
- `/verify-email` - Email verification
- `/teacher-register` - Teacher registration

### `(dashboard)` - Protected Dashboard Pages
- **`admin/`** - Admin panel (complete with all management features)
- **`teacher/`** - Teacher dashboard 
- **`student/`** - Student dashboard
- **`shared/`** - Shared features across roles
  - `search/` - Global search functionality

### `(marketplace)` - Course Marketplace  
- **`courses/`** - Browse and discover courses
- **`cart/`** - Shopping cart
- **`checkout/`** - Purchase process
- **`payment/`** - Payment handling

### `(community)` - Community Features
- **`forum/`** - Discussion forums
- **`study-groups/`** - Study group management
- **`chat/`** - Real-time messaging

### `(public)` - Public Pages
- `/about` - About page
- `/contact` - Contact information
- `/features` - Feature showcase
- `/pricing` - Pricing information
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### `(misc)` - Miscellaneous Pages
- `/get-started` - Onboarding
- `/teacher-application-pending` - Application status

## 📋 Global Pages
- `/` - Homepage
- `/loading.tsx` - Global loading UI
- `/error.tsx` - Global error handling
- `/not-found.tsx` - 404 page

## 🗂️ Development Files
Development and test files have been moved to `__dev__/` directory:
- `__dev__/examples/` - Form and component examples
- `__dev__/performance-test/` - Performance testing tools
- `__dev__/teacher-tests/` - Teacher API tests
- `__dev__/test/` - General test pages

## 🚀 Benefits of This Structure

1. **Clear Separation of Concerns** - Each route group has a specific purpose
2. **Better SEO** - Logical URL structure
3. **Easier Navigation** - Developers can quickly find relevant pages
4. **Scalable** - Easy to add new features within appropriate groups
5. **Clean Production Build** - Development files are separated

## 🔗 Important Notes

- All dashboard pages require authentication
- Route groups don't affect the URL structure (parentheses are ignored)
- Shared components and features are organized in `shared/` folders
- Development files are excluded from production builds