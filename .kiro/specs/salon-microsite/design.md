# Design Document

## Overview

The salon microsite is a modern, responsive web application built with Next.js that provides a seamless experience for clients to browse services, explore style galleries, and communicate with salon staff. The architecture emphasizes performance, accessibility, and real-time communication while maintaining a clean separation between client-facing features and administrative functionality.

## Architecture

### Technology Stack

**Frontend Layer:**
- Next.js 14+ with App Router for SSR/ISR capabilities and SEO optimization
- TypeScript for type safety and developer experience
- Tailwind CSS for responsive, utility-first styling
- React Query (TanStack Query) for server state management and caching
- Zustand for lightweight client-side UI state management

**Backend Layer:**
- Next.js API Routes / Vercel Functions for serverless backend logic
- Supabase for PostgreSQL database, real-time subscriptions, and file storage
- Resend or SendGrid for transactional email notifications

**Real-time Communication:**
- Supabase Realtime for live message updates
- WebSocket connections for instant message delivery

**Media & Storage:**
- Supabase Storage for optimized image/video delivery
- Image optimization through Next.js built-in features

**Development & Deployment:**
- Vercel for hosting and CI/CD pipeline
- ESLint, Prettier for code quality
- Vitest for unit testing, Playwright for E2E testing

### System Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Panel    │    │  Notification   │
│  (Mobile/Web)   │    │   (Web Only)     │    │    Services     │
└─────────┬───────┘    └────────┬─────────┘    └─────────┬───────┘
          │                     │                        │
          └─────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     Next.js App        │
                    │   (Frontend + API)     │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │      Supabase          │
                    │ (Database + Realtime   │
                    │    + Storage)          │
                    └────────────────────────┘
```

## Components and Interfaces

### Core Components

**1. Service Browser Component**
- `ServiceGrid`: Displays service cards with filtering and pagination
- `ServiceCard`: Individual service display with pricing and CTA
- `ServiceDetailDrawer`: Modal with detailed service information
- `CategoryTabs`: Horizontal scrollable category navigation

**2. Style Gallery Component**
- `GalleryGrid`: Infinite scroll image grid with masonry layout
- `ImageLightbox`: Full-screen image viewer with navigation
- `GalleryFilters`: Category and tag-based filtering
- `LookbookPlaylist`: Curated style collections

**3. Messaging System**
- `ChatInterface`: Main messaging UI with thread history
- `MessageComposer`: Input field with media upload and preset prompts
- `MessageBubble`: Individual message display component
- `AttachmentPreview`: Image/file attachment handling

**4. Admin Dashboard**
- `AdminLayout`: Authenticated layout wrapper
- `ServiceManager`: CRUD interface for service management
- `GalleryManager`: Media upload and organization tools
- `MessageInbox`: Customer service message management
- `AnalyticsDashboard`: Metrics and performance insights

### API Interface Design

**Service Endpoints:**
```typescript
GET /api/services - Fetch all services with optional filtering
GET /api/services/[id] - Get detailed service information
POST /api/services - Create new service (admin only)
PUT /api/services/[id] - Update service (admin only)
DELETE /api/services/[id] - Remove service (admin only)
```

**Gallery Endpoints:**
```typescript
GET /api/gallery - Fetch gallery images with pagination
POST /api/gallery/upload - Upload new gallery image (admin only)
PUT /api/gallery/[id] - Update image metadata (admin only)
DELETE /api/gallery/[id] - Remove image (admin only)
```

**Messaging Endpoints:**
```typescript
GET /api/messages/[threadId] - Fetch message thread
POST /api/messages - Send new message
PUT /api/messages/[id]/status - Update message status (admin only)
GET /api/messages/threads - List all threads (admin only)
```

## Data Models

### Database Schema

**Services Table:**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  stylist_name VARCHAR(255),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Gallery Table:**
```sql
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[], -- Array of tags
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Message Threads Table:**
```sql
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  client_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'open', -- open, closed, archived
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES message_threads(id),
  sender_type VARCHAR(20) NOT NULL, -- client, admin
  sender_name VARCHAR(255),
  content TEXT NOT NULL,
  attachments JSONB, -- Array of attachment objects
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
interface Service {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  duration: number; // minutes
  stylistName?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GalleryImage {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  category?: string;
  isFeatured: boolean;
  createdAt: Date;
}

interface MessageThread {
  id: string;
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  status: 'open' | 'closed' | 'archived';
  messages: Message[];
  lastMessageAt: Date;
  createdAt: Date;
}

interface Message {
  id: string;
  threadId: string;
  senderType: 'client' | 'admin';
  senderName?: string;
  content: string;
  attachments?: Attachment[];
  readAt?: Date;
  createdAt: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Service display properties (1.1, 1.2, 1.3) can be combined into comprehensive service interface validation
- Gallery interaction properties (2.1, 2.2) can be merged into gallery interface validation  
- Message functionality properties (3.1, 3.2, 3.3) can be consolidated into messaging system validation
- Notification properties (4.1, 4.2) can be combined into notification delivery validation
- Admin interface properties (5.1, 5.3, 5.5) can be merged into admin panel validation

### Core Properties

**Property 1: Service Interface Completeness**
*For any* service data set, the service browser should display all services with category organization, complete information (price, duration, stylist, favorite option), and functional detail drawers with gallery and messaging CTAs
**Validates: Requirements 1.1, 1.2, 1.3**

**Property 2: Service Filtering Accuracy**
*For any* combination of category filters and service data, the displayed results should contain only services that match all applied filter criteria
**Validates: Requirements 1.4**

**Property 3: Favorites Persistence**
*For any* service and user session, adding a service to favorites should persist the preference in storage and provide immediate visual confirmation
**Validates: Requirements 1.5**

**Property 4: Gallery Interface Functionality**
*For any* gallery image collection, the gallery should display images in a scrollable grid layout and open lightboxes with captions, tags, and share/save options when images are selected
**Validates: Requirements 2.1, 2.2**

**Property 5: Gallery Organization Consistency**
*For any* set of gallery images with metadata, images should be properly organized by hair types, color palettes, and trending categories, with related styles grouped in lookbook playlists
**Validates: Requirements 2.3, 2.4**

**Property 6: Media Performance Optimization**
*For any* gallery content request, images should implement lazy loading and responsive breakpoints for optimal performance across devices
**Validates: Requirements 2.5**

**Property 7: Messaging Interface Completeness**
*For any* messaging session, the chat interface should provide preset prompts (Consultation, Booking, Follow-up), photo upload capability, and availability picker functionality
**Validates: Requirements 3.1, 3.2**

**Property 8: Message Thread Management**
*For any* message sent by a client, the system should create or update the appropriate message thread with real-time delivery and maintain conversation history with status updates
**Validates: Requirements 3.3, 3.5**

**Property 9: Contact Information Capture**
*For any* client interaction requiring contact details, the system should capture email/phone through auth-lite flow or anonymous email capture
**Validates: Requirements 3.4**

**Property 10: Notification Delivery Reliability**
*For any* new client message, the notification system should deliver email alerts to salon staff immediately and update notification badges with real-time status updates
**Validates: Requirements 4.1, 4.2**

**Property 11: Notification Preference Compliance**
*For any* user notification preference configuration, the system should respect choices for email and push notification delivery, sending push notifications only to opted-in users when enabled
**Validates: Requirements 4.3, 4.4**

**Property 12: Admin Notification Dashboard**
*For any* admin panel access, the system should display notification history and accurate message volume metrics
**Validates: Requirements 4.5**

**Property 13: Admin Authentication and Access Control**
*For any* admin login attempt, the system should provide secure authentication and appropriate role-based access to administrative functions
**Validates: Requirements 5.1**

**Property 14: Content Management Operations**
*For any* admin content management action, the system should support complete CRUD operations for services, categories, and gallery items
**Validates: Requirements 5.2**

**Property 15: Admin Messaging Interface**
*For any* admin messaging access, the inbox should display message threads with filters, quick replies, status management, and real-time delivery of admin responses to clients
**Validates: Requirements 5.3, 5.4**

**Property 16: Analytics Display Accuracy**
*For any* admin analytics view, the system should show accurate metrics for response time, message volume, and popular services
**Validates: Requirements 5.5**

**Property 17: Accessibility Compliance**
*For any* user interface interaction, the system should support keyboard navigation and provide appropriate focus indicators and screen reader support
**Validates: Requirements 6.1, 6.5**

**Property 18: Responsive Design Consistency**
*For any* device screen size, content should implement responsive design with optimized breakpoints for mobile and desktop viewing
**Validates: Requirements 6.2**

**Property 19: Media Optimization**
*For any* media content request, the system should deliver optimized images and videos with lazy loading implementation
**Validates: Requirements 6.3**

**Property 20: Mobile Navigation Structure**
*For any* mobile device access, the system should provide sticky bottom navigation with Home, Services, Gallery, Chat, and Profile sections
**Validates: Requirements 7.2**

**Property 21: Design Pattern Consistency**
*For any* application section, the system should maintain consistent visual design and interaction patterns throughout the user experience
**Validates: Requirements 7.3**

**Property 22: Contact Method Availability**
*For any* user need to contact the salon, the system should provide multiple contact methods integrated throughout the experience
**Validates: Requirements 7.4**

**Property 23: Preference Persistence**
*For any* returning user session, the system should remember user preferences and provide personalized content where appropriate
**Validates: Requirements 7.5**

## Error Handling

### Client-Side Error Handling

**Network Errors:**
- Implement retry logic with exponential backoff for failed API requests
- Display user-friendly error messages for network connectivity issues
- Provide offline indicators and graceful degradation when possible

**Validation Errors:**
- Real-time form validation with clear error messaging
- Prevent submission of invalid data with visual feedback
- Guide users to correct input errors with specific instructions

**Media Upload Errors:**
- File size and type validation before upload attempts
- Progress indicators and cancellation options for large uploads
- Clear error messages for unsupported file formats or size limits

### Server-Side Error Handling

**Database Errors:**
- Connection pooling and retry logic for database operations
- Transaction rollback for failed multi-step operations
- Logging and monitoring for database performance issues

**Authentication Errors:**
- Secure error messages that don't reveal system information
- Rate limiting for login attempts to prevent brute force attacks
- Session management with automatic cleanup and timeout handling

**API Rate Limiting:**
- Implement rate limiting per user/IP to prevent abuse
- Queue management for high-volume operations
- Graceful degradation when rate limits are exceeded

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing Requirements

**Framework:** Vitest for fast unit testing with TypeScript support
**Coverage Areas:**
- Component rendering with specific props and state combinations
- API endpoint functionality with mock data
- Form validation logic with edge cases
- Error handling scenarios and recovery mechanisms
- Integration points between components and services

**Key Unit Test Categories:**
- Service filtering logic with various filter combinations
- Message composition and validation
- Admin authentication and authorization flows
- Image optimization and lazy loading behavior
- Responsive design breakpoint handling

### Property-Based Testing Requirements

**Framework:** Fast-check for JavaScript/TypeScript property-based testing
**Configuration:** Each property-based test must run a minimum of 100 iterations
**Tagging:** Each property-based test must include a comment with format: `**Feature: salon-microsite, Property {number}: {property_text}**`

**Property Test Implementation:**
- Each correctness property must be implemented by a single property-based test
- Tests should generate random but valid input data to verify properties hold universally
- Focus on testing business logic and data transformations rather than UI specifics
- Verify invariants that should hold regardless of input variations

**Generator Strategy:**
- Smart generators that constrain input space to valid business scenarios
- Realistic data generation for services, gallery images, and messages
- Edge case generation for boundary conditions and error scenarios

### Integration Testing

**Framework:** Playwright for end-to-end testing across browsers
**Test Scenarios:**
- Complete user journeys from landing page to message sending
- Admin workflows from login to content management
- Cross-browser compatibility and responsive behavior
- Real-time messaging functionality with multiple clients
- Performance testing under various load conditions

### Accessibility Testing

**Tools:** axe-core for automated accessibility testing
**Manual Testing:** Keyboard navigation and screen reader compatibility
**Compliance Target:** WCAG 2.1 AA standards
**Test Coverage:** All interactive components and user flows