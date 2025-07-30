# Westwoods Prayer Requests - Site Index

## 📋 Project Overview

**Westwoods Prayer Requests** is a comprehensive prayer request management system for Westwoods Church, built with modern web technologies including SvelteKit 5, NeonDB (PostgreSQL), and Drizzle ORM.

### 🎯 Core Purpose

- Allow church members to submit prayer requests
- Enable staff to manage and view all requests
- Provide secure authentication with both password and Google OAuth
- Support printing and emailing prayer request lists

---

## 🏗️ Architecture & Tech Stack

### Frontend

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: CSS with OKLCH color space, CSS Grid layouts
- **State Management**: Svelte 5 runes ($state, $effect, $derived)
- **Build Tool**: Vite

### Backend

- **Database**: NeonDB (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Custom session-based auth + Google OAuth
- **Email**: Nodemailer for SMTP integration

### Development Tools

- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest
- **Database Management**: Drizzle Kit

---

## 📁 File Structure

```
prayer-requests/
├── src/
│   ├── app.html                 # Main HTML template
│   ├── app.d.ts                 # Global TypeScript declarations
│   ├── routes/                  # SvelteKit routes
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +page.svelte         # Homepage
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── requests/            # Prayer requests list
│   │   ├── admin/               # Admin dashboard
│   │   ├── debug/               # Debug/testing page
│   │   ├── test-google/         # Google OAuth testing
│   │   └── api/                 # API endpoints
│   │       ├── auth/            # Authentication APIs
│   │       ├── prayer-requests/ # Prayer request APIs
│   │       └── debug/           # Debug APIs
│   ├── lib/
│   │   ├── components/          # Reusable components
│   │   ├── css/                 # Global styles
│   │   └── server/              # Server-side code
│   │       ├── auth.ts          # Authentication logic
│   │       ├── email.ts         # Email functionality
│   │       ├── prayerRequests.ts # Prayer request logic
│   │       └── db/              # Database layer
│   └── static/                  # Static assets
├── scripts/                     # Utility scripts
├── drizzle.config.ts            # Database configuration
├── svelte.config.js             # SvelteKit configuration
├── vite.config.ts               # Vite configuration
└── package.json                 # Dependencies and scripts
```

---

## 🗄️ Database Schema

### Users Table

```sql
users (
  id: serial PRIMARY KEY,
  email: varchar(255) UNIQUE NOT NULL,
  name: varchar(255) NOT NULL,
  password_hash: text,           -- NULL for OAuth users
  google_id: varchar(255),       -- For Google OAuth
  role: varchar(50) DEFAULT 'prayer_partner',
  is_staff: boolean DEFAULT false,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

### Prayer Requests Table

```sql
prayer_requests (
  id: serial PRIMARY KEY,
  request: text NOT NULL,
  name: varchar(255),            -- Optional submitter name
  email: varchar(255),           -- Optional submitter email
  is_staff_only: boolean DEFAULT false,
  submitted_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

### Sessions Table

```sql
sessions (
  id: serial PRIMARY KEY,
  user_id: integer REFERENCES users(id) ON DELETE CASCADE,
  token: text UNIQUE NOT NULL,
  expires_at: timestamp NOT NULL,
  created_at: timestamp DEFAULT NOW()
)
```

---

## 🔐 Authentication System

### Authentication Methods

1. **Password Authentication**
   - bcrypt password hashing
   - Session-based authentication
   - Secure cookie management

2. **Google OAuth**
   - OAuth 2.0 flow
   - Automatic user creation/linking
   - Token verification

### User Roles

- **Prayer Partner**: Basic access to submit and view public requests
- **Staff**: Access to all requests including staff-only ones
- **Admin**: Full administrative access

### API Endpoints

- `POST /api/auth/login` - Password login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth callback
- `GET /api/auth/google/config` - OAuth configuration

---

## 📝 Prayer Request Features

### Submission

- Public form accessible to all visitors
- Optional name and email fields
- Staff-only flag for sensitive requests
- Rich text support with line breaks

### Management

- Filter by date range
- Filter by staff-only status (for staff users)
- Search and sort functionality
- Bulk operations

### Display

- Responsive card layout
- Date formatting
- Staff-only badges
- Print-friendly styling

### API Endpoints

- `POST /api/prayer-requests` - Create new request
- `GET /api/prayer-requests` - List requests with filters
- `POST /api/prayer-requests/email` - Email requests
- `GET /api/prayer-requests/stats` - Statistics

---

## 🎨 UI/UX Design

### Design System

- **Color Palette**: OKLCH color space
  - Primary: `oklch(0.5988 0.1464 40.71)` - Blue
  - Secondary: `oklch(0.854 0.012 262.2)` - Purple
  - Background: Dark theme with light accents

### Layout Principles

- CSS Grid for main layouts
- Flexbox for component layouts
- Responsive design with mobile-first approach
- Print-optimized styles

### Components

- **PrayerRequestForm**: Submission form with validation
- **PrayerRequestList**: Display and filter requests
- **Navigation**: Header with role-based menu items
- **Cards**: Consistent styling for content blocks

---

## 🔧 Development Workflow

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Type checking
pnpm lint         # Linting and formatting
pnpm db:push      # Push database schema
pnpm db:studio    # Open Drizzle Studio
pnpm test         # Run tests
```

### Code Standards

- **Indentation**: Tabs
- **Quotes**: Single quotes
- **Line Width**: 100 characters
- **Naming**: camelCase for variables, PascalCase for components
- **CSS**: Custom properties, OKLCH colors, Grid layouts

---

## 🌐 Pages & Routes

### Public Pages

- **Homepage** (`/`) - Welcome page with prayer request form
- **Login** (`/login`) - Authentication with Google OAuth option
- **Register** (`/register`) - User registration

### Protected Pages

- **Requests** (`/requests`) - View and filter prayer requests
- **Admin** (`/admin`) - Administrative dashboard (staff only)

### Debug/Testing Pages

- **Debug** (`/debug`) - Environment and configuration testing
- **Test Google** (`/test-google`) - Google OAuth testing

---

## 🔒 Security Features

### Authentication Security

- bcrypt password hashing (12 rounds)
- Secure session tokens
- HTTP-only cookies
- CSRF protection via SvelteKit

### Data Protection

- Input validation and sanitization
- SQL injection prevention via Drizzle ORM
- XSS protection via SvelteKit
- Staff-only request isolation

### Environment Security

- Environment variable management
- Secure cookie settings
- HTTPS enforcement in production

---

## 📧 Email Integration

### Email Features

- SMTP integration via Nodemailer
- HTML email templates
- Prayer request summaries
- Configurable recipients

### Email Templates

- Prayer request notifications
- Weekly/monthly summaries
- Staff-only request alerts

---

## 🚀 Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
NODE_ENV="production"
```

### Build Process

1. Install dependencies: `pnpm install`
2. Set environment variables
3. Run database migrations: `pnpm db:push`
4. Build application: `pnpm build`
5. Deploy to hosting platform

---

## 🧪 Testing & Debugging

### Debug Tools

- **Debug Page**: Environment variable checking
- **Drizzle Studio**: Database inspection
- **Console Logging**: Comprehensive OAuth debugging
- **Error Handling**: User-friendly error messages

### Testing Strategy

- Unit tests with Vitest
- Component testing
- API endpoint testing
- Integration testing

---

## 📚 Documentation

### Key Files

- `README.md` - Setup and usage instructions
- `SITE_INDEX.md` - This comprehensive index
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database configuration

### API Documentation

- RESTful API design
- JSON request/response format
- Error handling patterns
- Authentication requirements

---

## 🔄 Future Enhancements

### Planned Features

- Email notifications for new requests
- Prayer request categories/tags
- Advanced filtering and search
- Mobile app integration
- Prayer request status tracking
- Analytics and reporting

### Technical Improvements

- Performance optimization
- Caching strategies
- Enhanced security measures
- Accessibility improvements
- Internationalization support

---

## 📞 Support & Maintenance

### Development Team

- Contact through repository issues
- Code review process
- Documentation updates
- Security updates

### Monitoring

- Error logging and tracking
- Performance monitoring
- User analytics
- Database health checks

---

_This index provides a comprehensive overview of the Westwoods Prayer Requests application architecture, features, and development workflow._
