# Lustre Lane - Premium Salon Microsite

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

A modern, responsive microsite for a premium salon featuring service browsing, style gallery, real-time messaging, and administrative management capabilities.

## ✨ Features

- 🎨 **Service Browser** - Browse salon services by category with advanced filtering
- 📸 **Style Gallery** - Infinite scroll gallery with lightbox and organization
- 💬 **Real-time Messaging** - Client-salon communication with file attachments
- 👨‍💼 **Admin Panel** - Content management and customer service tools
- 📱 **Responsive Design** - Mobile-first design with custom breakpoints
- ♿ **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation
- ⚡ **Performance** - Optimized images, lazy loading, and Core Web Vitals

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom salon theme
- **State Management**: 
  - React Query (TanStack Query) for server state
  - Zustand for client-side UI state

### Backend & Database
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Email**: Resend or SendGrid integration

### Development & Testing
- **Testing**: Vitest + Fast-check + Testing Library
- **Code Quality**: ESLint + Prettier + TypeScript
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

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

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Lustre-Lane.git
   cd Lustre-Lane
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials and other configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Run TypeScript type checking |

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Service Configuration
RESEND_API_KEY=your_resend_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Key Features Implementation

### Service Management
- Dynamic service categories (Cuts, Color, Treatments, Packages)
- Price and duration display
- Stylist assignment
- Favorite functionality

### Gallery System
- Masonry layout with infinite scroll
- Image optimization and lazy loading
- Category and tag-based filtering
- Lightbox with navigation

### Messaging System
- Real-time chat interface
- File attachment support
- Preset conversation prompts
- Admin response management

### Admin Dashboard
- Service CRUD operations
- Gallery management
- Message inbox with filters
- Analytics and metrics

## 🧪 Testing Strategy

The project uses a comprehensive testing approach:

- **Unit Tests**: Vitest for utility functions and components
- **Property-Based Tests**: Fast-check for business logic validation
- **Integration Tests**: Testing Library for user interactions
- **Type Safety**: TypeScript for compile-time error prevention

Run tests with:
```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the development guidelines
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configuration
- Use meaningful component and function names
- Add JSDoc comments for complex functions

### State Management
- Use React Query for server state (API calls, caching)
- Use Zustand for client-side UI state (modals, filters, etc.)
- Keep state as local as possible

### Styling
- Use Tailwind CSS utility classes
- Leverage the custom salon color palette
- Follow mobile-first responsive design principles
- Use semantic HTML elements for accessibility

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vercel](https://vercel.com/) for seamless deployment

---

**Built with ❤️ for premium salon experiences**