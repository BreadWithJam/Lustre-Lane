# Salon Microsite

A modern, responsive microsite for a salon featuring service browsing, style gallery, real-time messaging, and administrative management capabilities.

## Tech Stack

- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom salon theme
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **State Management**: 
  - React Query (TanStack Query) for server state
  - Zustand for client-side UI state
- **Testing**: 
  - Vitest for unit testing
  - Fast-check for property-based testing
  - Testing Library for React component testing
- **Development**: ESLint, Prettier, TypeScript

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Configuration and utilities
├── services/           # API service functions
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials and other configuration values.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service Configuration
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features

- **Service Browser**: Browse salon services by category with filtering
- **Style Gallery**: Infinite scroll gallery with lightbox and organization
- **Real-time Messaging**: Client-salon communication with file attachments
- **Admin Panel**: Content management and customer service tools
- **Responsive Design**: Mobile-first design with custom breakpoints
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Performance**: Optimized images, lazy loading, and Core Web Vitals

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Use meaningful component and function names
- Add JSDoc comments for complex functions

### Testing

- Write unit tests for utility functions
- Write property-based tests for business logic
- Use Testing Library for component tests
- Aim for good test coverage of critical paths

### State Management

- Use React Query for server state (API calls, caching)
- Use Zustand for client-side UI state (modals, filters, etc.)
- Keep state as local as possible

### Styling

- Use Tailwind CSS utility classes
- Leverage the custom salon color palette
- Follow mobile-first responsive design principles
- Use semantic HTML elements for accessibility

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the development guidelines
3. Add tests for new functionality
4. Run the test suite and ensure all tests pass
5. Submit a pull request with a clear description

## License

This project is private and proprietary.