# EduSmart Admin Panel

This is the admin dashboard for the EduSmart platform, providing a comprehensive interface for managing the entire education platform.

## Features

- **User Management**: View, edit, and manage user accounts
- **Course Management**: Create, update, and delete courses and lessons
- **Blog Management**: Publish and manage blog posts
- **Scholarship Management**: Maintain scholarship listings
- **Resource Management**: Upload and organize educational resources
- **Case Studies Management**: Showcase success stories
- **Application Management**: Track and process student applications

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **State Management**: React Context API
- **Notifications**: Notistack
- **Form Handling**: React Hook Form
- **Icons**: React Icons (Material Design)

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Supabase account with project setup

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/edusmart_admin.git
cd edusmart_admin
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. Run the development server
```bash
npm start
```

## Database Setup

The `db_setup.sql` file contains all the SQL commands needed to set up the database tables, security policies, and functions. Run this in your Supabase SQL editor to initialize the database.

## Project Structure

```
/src
  /components           # Reusable UI components
    /layout             # Layout components (Sidebar, Header, etc.)
    /common             # Common UI elements
    /forms              # Form components for data entry
  /pages                # Application pages/routes
  /utils                # Utility functions and helpers
    /api.ts             # API functions for data fetching
    /supabase.ts        # Supabase client setup
    /types.ts           # TypeScript type definitions
    /AuthContext.tsx    # Authentication context provider
    /ProtectedRoute.tsx # Route protection component
    /helpers.ts         # Helper functions
    /fileUpload.ts      # File upload utilities
  /hooks                # Custom React hooks
  /assets               # Static assets (images, etc.)
  App.tsx               # Main application component
  index.tsx             # Application entry point
```

## Authentication

The admin panel uses Supabase for authentication. Only users with the `is_admin` flag set to `true` in their profile can access the admin functions. The authentication flow is managed by the `AuthContext` provider.

## Deployment

1. Build the production bundle
```bash
npm run build
```

2. Deploy the contents of the `build` directory to your hosting service of choice.

## Security

- Row-Level Security (RLS) policies are implemented in Supabase to restrict data access
- Protected routes ensure only authenticated admin users can access the admin panel
- Service role API keys are only used server-side for admin operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/edusmart_admin](https://github.com/yourusername/edusmart_admin)
