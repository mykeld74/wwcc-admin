# Westwoods Prayer Requests

A comprehensive prayer request management system for Westwoods Church, built with SvelteKit, NeonDB, and Drizzle ORM.

## Features

- **Prayer Request Submission**: Public form for submitting prayer requests
- **User Authentication**: Secure login system with session management and Google OAuth
- **Permission Levels**: Staff-only requests and admin access control
- **Request Management**: View, filter, and manage prayer requests
- **Print Functionality**: Print formatted prayer request lists
- **Email Integration**: Email prayer requests to congregation (ready for implementation)
- **Responsive Design**: Modern, mobile-friendly interface
- **Database Integration**: PostgreSQL with NeonDB and Drizzle ORM

## Tech Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Custom session-based auth with bcrypt
- **Styling**: CSS with OKLCH color space and CSS Grid
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+
- pnpm
- NeonDB account
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd prayer-requests
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@host:port/database"

# Email Configuration (for sending prayer requests)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
DEFAULT_EMAIL_RECIPIENTS="recipient1@example.com,recipient2@example.com"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Get your NeonDB connection string from your NeonDB dashboard.

### Google OAuth Setup

To enable Google OAuth login:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
5. Set the authorized redirect URI to: `http://localhost:5173/api/auth/google/callback` (for development)
6. Copy the Client ID and Client Secret to your `.env` file

**Email Setup Notes:**

- For Gmail, use an App Password instead of your regular password
- For other providers, check their SMTP settings
- `DEFAULT_EMAIL_RECIPIENTS` is a comma-separated list of email addresses

### 4. Database Setup

Run the database migrations:

```bash
pnpm db:push
```

### 5. Create Initial Admin User

You'll need to create an initial admin user. You can do this by running a script or directly in the database. Here's a simple script you can run:

```bash
node -e "
const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');
const client = neon(process.env.DATABASE_URL);

async function createAdmin() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  await client.query(`
    INSERT INTO users (email, name, password_hash, is_staff, created_at, updated_at)
    VALUES ('admin@westwoods.org', 'Admin User', $1, true, NOW(), NOW())
  `, [passwordHash]);
  console.log('Admin user created successfully');
}

createAdmin().catch(console.error);
"
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Usage

### For Public Users

1. Visit the homepage to submit prayer requests
2. Fill out the form with your prayer request
3. Optionally mark requests as "staff only"
4. Submit the request

### For Staff Users

1. Login with your staff credentials
2. View all prayer requests (including staff-only ones)
3. Filter requests by date range
4. Print formatted prayer request lists
5. Email prayer requests to congregation

### For Administrators

1. Access the admin dashboard
2. View statistics and manage requests
3. Manage user accounts and permissions
4. Export data and generate reports

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Prayer Requests

- `POST /api/prayer-requests` - Create new prayer request
- `GET /api/prayer-requests` - Get prayer requests (with filters)
- `POST /api/prayer-requests/email` - Email prayer requests
- `GET /api/prayer-requests/stats` - Get prayer request statistics

## Database Schema

### Users Table

- `id` - Primary key
- `email` - User email (unique)
- `name` - User name
- `password_hash` - Hashed password
- `is_staff` - Staff permission flag
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Prayer Requests Table

- `id` - Primary key
- `request` - Prayer request text
- `name` - Submitter name (optional)
- `email` - Submitter email (optional)
- `is_staff_only` - Staff-only flag
- `submitted_at` - Submission timestamp
- `updated_at` - Last update timestamp

### Sessions Table

- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - Session token
- `expires_at` - Session expiration
- `created_at` - Session creation timestamp

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type check
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm db:push` - Push database schema
- `pnpm db:studio` - Open Drizzle Studio

### Code Style

- Use tabs for indentation
- Single quotes for strings
- No trailing commas
- 100 character line width
- camelCase for variables and functions
- PascalCase for components and types

### CSS Guidelines

- Use CSS custom properties for theming
- Prefer OKLCH color space
- Use CSS Grid for layouts
- Use clamp() for responsive typography
- Implement dark/light theme support

## Deployment

### Environment Variables

Set the following environment variables in production:

```env
DATABASE_URL="your-neon-db-connection-string"
NODE_ENV="production"
```

### Build and Deploy

```bash
pnpm build
```

The built application will be in the `build` directory, ready for deployment to your preferred hosting platform.

## Security Considerations

- Passwords are hashed using bcrypt
- Sessions are stored securely with expiration
- Staff-only requests are properly protected
- Input validation on all forms
- CSRF protection via SvelteKit
- Secure cookie settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
