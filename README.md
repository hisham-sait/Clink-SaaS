# Clink SaaS

A modern multi-tenant SaaS application built with the PERN stack (PostgreSQL, Express, React, Node.js) and Prisma ORM.

## Features

- **Multi-tenant Architecture**: Secure data isolation between tenants
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Comprehensive CRM**: Contact management, deal tracking, and pipeline management
- **Billing & Subscription**: Plan management and payment processing
- **Settings Management**: User, role, and company management

## Tech Stack

### Backend
- **Node.js & Express**: RESTful API server
- **PostgreSQL**: Relational database
- **Prisma ORM**: Type-safe database access
- **JWT Authentication**: Secure user authentication
- **Bull**: Background job processing

### Frontend
- **React**: Component-based UI with hooks
- **TypeScript**: Static typing for better developer experience
- **Vite**: Fast build tool
- **React Router**: Client-side routing
- **Bootstrap & React Bootstrap**: Responsive UI components
- **React Hook Form**: Form validation and submission

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/clink-saas.git
cd clink-saas
```

2. Install dependencies:
```bash
# Install all dependencies (API and frontend)
npm run install:all

# Or install them separately:
# Install API dependencies
cd api
npm install

# Install frontend dependencies
cd ../app
npm install
```

3. Set up the database:
```bash
# Create a PostgreSQL database named 'clink_saas'

# From the api directory
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. Start the development servers:
```bash
# Use the provided script to start both servers
./start.sh

# Or start them individually:
# Start API server (from api directory)
cd api
npm run dev

# Start React development server (from app directory)
cd ../app
npm run dev
```

5. Access the application at `http://localhost:5173`

## Multi-tenant Architecture

The application implements multi-tenancy through a Company model:
- Each user can be associated with multiple companies
- Data is isolated at the application level with tenant context
- Role-based permissions control access within each tenant

## Project Structure

```
clink-saas/
├── api/                    # Backend API
│   ├── prisma/            # Database schema and migrations
│   │   ├── schema.prisma  # Prisma schema definition
│   │   ├── migrations/    # Database migrations
│   │   └── seeds/         # Seed data scripts
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── server.js          # Express server setup
│
└── app/                   # React frontend
    ├── public/            # Static assets
    └── src/
        ├── components/    # React components
        ├── contexts/      # React contexts for state management
        ├── services/      # API service integrations
        ├── utils/         # Utility functions
        ├── App.tsx        # Main application component
        └── main.tsx       # Application entry point
```

## Development Guidelines

### Code Standards
- Follow React best practices
- Implement proper TypeScript types
- Use functional components with hooks
- Implement proper error handling
- Follow RESTful API design principles

## License

This project is licensed under the MIT License - see the LICENSE file for details.
