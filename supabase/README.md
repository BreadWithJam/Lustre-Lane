# Database Setup

This directory contains the database schema and migration files for the salon microsite.

## Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql    # Core tables and indexes
│   └── 002_rls_policies.sql      # Row Level Security policies
└── README.md                     # This file
```

## Database Schema

### Tables

1. **services** - Salon service offerings
   - Stores service information (name, price, duration, category)
   - Includes stylist assignment and active status
   - Indexed for performance on category, price, and duration

2. **gallery_images** - Style gallery images
   - Stores image URLs and metadata
   - Supports tagging and categorization
   - Includes featured image functionality

3. **message_threads** - Client conversation threads
   - Groups messages by client email
   - Tracks conversation status and timing
   - Supports client contact information

4. **messages** - Individual messages
   - Stores message content and attachments
   - Tracks sender type (client/admin) and read status
   - Linked to message threads via foreign key

### Indexes

Performance indexes are created on frequently queried fields:
- Service category, active status, price, duration
- Gallery tags (GIN index), category, featured status
- Message thread email, status, last message time
- Message thread ID, sender type, read status

### Row Level Security (RLS)

Security policies ensure proper data access:
- **Public access**: Active services and gallery images
- **User access**: Own message threads and messages
- **Admin access**: Full CRUD operations on all tables
- **Email-based access**: Message threads tied to client email

## Setup Instructions

### 1. Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Initialize Database

Run the initialization script to create tables and seed data:

```bash
npm run db:init
```

This will:
- Execute all migration files in order
- Create tables, indexes, and RLS policies
- Insert sample data for testing
- Verify the setup

### 3. Manual Setup (Alternative)

If you prefer manual setup:

1. Copy the SQL from `migrations/001_initial_schema.sql`
2. Run it in your Supabase SQL editor
3. Copy the SQL from `migrations/002_rls_policies.sql`
4. Run it in your Supabase SQL editor

## Development

### Adding New Migrations

1. Create a new file: `migrations/003_your_migration_name.sql`
2. Use sequential numbering for proper ordering
3. Include both UP and DOWN operations if needed
4. Test thoroughly before deploying

### Sample Data

The initialization script includes sample data:
- 4 sample services across all categories
- 3 sample gallery images with different tags
- No sample messages (created through app usage)

### Testing Database Operations

Use the database utility functions in `src/lib/database.ts`:

```typescript
import { servicesDb, galleryDb, messageThreadsDb, messagesDb } from '@/lib/database'

// Get all active services
const services = await servicesDb.getAll()

// Create a new gallery image
const image = await galleryDb.create({
  image_url: 'https://example.com/image.jpg',
  title: 'New Style',
  tags: ['modern', 'trendy']
})
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables are correct
   - Check Supabase project status
   - Ensure service role key has proper permissions

2. **RLS Policy Errors**
   - Verify user authentication status
   - Check policy conditions match your use case
   - Use service role key for admin operations

3. **Migration Errors**
   - Check for syntax errors in SQL files
   - Ensure proper ordering of migrations
   - Verify foreign key constraints

### Health Check

Use the database health check utility:

```typescript
import { checkDatabaseHealth } from '@/lib/database-health'

const health = await checkDatabaseHealth()
console.log('Database healthy:', health.isHealthy)
console.log('Latency:', health.latency, 'ms')
```

## Security Considerations

1. **Environment Variables**: Never commit real credentials to version control
2. **RLS Policies**: Always test policies thoroughly before production
3. **Service Role Key**: Only use server-side for admin operations
4. **Input Validation**: All user inputs are validated before database operations
5. **Error Handling**: Database errors are properly caught and sanitized