# Bradán Accountants

A modern corporate compliance and management platform built with the PERN-Prisma stack, focusing on statutory compliance, tax management, and corporate governance.

## Roles and Demo Users

### Platform Level Roles

1. **Super Admin**
   - Full platform access
   - Demo Account: superadmin@bradan.com / superadmin123

2. **Platform Admin**
   - Platform administration
   - Demo Account: platformadmin@bradan.com / platformadmin123

### Company Level Roles

1. **Company Admin**
   - Company administration
   - Demo Account: companyadmin@bradan.com / companyadmin123

2. **Company Manager**
   - Company management
   - Demo Account: manager@bradan.com / manager123

3. **Accountant**
   - Financial access
   - Demo Account: accountant@bradan.com / accountant123

4. **Viewer**
   - Read-only access
   - Demo Account: viewer@bradan.com / viewer123

### Third Party Roles

1. **External Auditor**
   - External auditor access
   - Demo Account: auditor@bradan.com / auditor123

2. **Tax Advisor**
   - External tax advisor access
   - Demo Account: taxadvisor@bradan.com / taxadvisor123

3. **Legal Advisor**
   - External legal advisor access
   - Demo Account: legaladvisor@bradan.com / legaladvisor123

4. **External Consultant**
   - External consultant access
   - Demo Account: consultant@bradan.com / consultant123

## Core Modules

### Statutory Module
- **Dashboard**: Overview of statutory compliance
- **Directors**: Director management and documentation
- **Shareholders**: Shareholder records and communications
- **Shares**: Share allocation and transfer management
- **Board Minutes**: Board meeting minutes and resolutions
- **Beneficial Owners**: UBO tracking and documentation
- **Charges**: Company charges and securities
- **Meetings**: Meeting management and minutes
- **Allotments**: Share allotment tracking
- **Forms**: Statutory form management

### Compliance Module
- **Dashboard**: Compliance overview and metrics
- **Tracking**: Compliance monitoring and tracking
- **Audits**: Internal and external audit management
- **ESG**: Environmental, Social, and Governance tracking
- **Filing**: Regulatory filing management
- **Governance**: Corporate governance framework
- **Policies**: Policy management and distribution
- **Regulatory**: Regulatory compliance tracking
- **Reports**: Compliance reporting
- **Requirements**: Compliance requirement management

### Tax Module
- **Dashboard**: Tax overview and deadlines
- **Corporation Tax**: Corporate tax management
- **Income Tax**: Income tax calculations and filing
- **Capital Gains**: Capital gains tracking
- **VAT**: VAT returns and management
- **Payroll Tax**: Payroll tax calculations
- **Tax Planning**: Strategic tax planning tools

### CRM Module
- **Dashboard**: Client relationship overview
- **Contacts**: Contact management and tracking
- **Organizations**: Organization profiles and relationships
- **Deals**: Deal tracking and pipeline management
- **Products**: Product and service catalog
- **Proposals**: Proposal creation and management
- **Pipelines**: Sales pipeline configuration
- **Automations**: Workflow automation rules

### Settings Module
- **Company Management**: Multi-company administration
- **User Management**: User access and permissions
- **Role Management**: Role definition and assignment
- **Billing**: Subscription and payment management
- **Plans**: Service plan configuration
- **Security**: Security settings and protocols
- **Notifications**: Alert and notification preferences
- **Integrations**: Third-party service connections
- **Forms**: Custom form management
- **Organization**: Organization-wide settings

## Technical Architecture

### PERN-Prisma Stack Overview

The Bradán Accountants platform is built on the PERN-Prisma stack:
- **P**ostgreSQL: Relational database for robust data storage
- **E**xpress.js: Backend web application framework
- **R**eact: Frontend library with TypeScript
- **N**ode.js: JavaScript runtime environment
- **Prisma**: Modern ORM for database access and management

This architecture provides a powerful, type-safe, and scalable foundation for the application's complex business requirements.

### Frontend Architecture

#### Build System & Core Technologies
- **Vite**: Modern build tool for faster development and optimized production builds
- **React 18**: Component-based UI library with hooks and functional components
- **TypeScript**: Static typing for improved code quality and developer experience
- **React Router v6**: Declarative routing with nested routes and route protection
- **Code Splitting**: Lazy loading of components for optimized performance

```typescript
// Example of lazy loading components in App.tsx
const Auth = lazy(() => import('./components/auth/Auth'));
const Dashboard = lazy(() => import('./components/dashboards/Dashboard'));
const Settings = lazy(() => import('./components/settings/Settings'));
```

#### State Management & Data Flow
- **Context API**: Global state management with React Context
- **Custom Hooks**: Encapsulated reusable logic
- **Service Abstraction**: API service layer for data fetching and manipulation

```typescript
// Example of Context API usage
const { user, isAuthenticated } = useAuth();
```

#### UI Framework & Components
- **Bootstrap 5**: Responsive design framework
- **React Bootstrap**: React components implementing Bootstrap
- **Bootstrap Icons**: Modern iconography
- **Theme System**: Support for light, dark, and system preference themes
- **Responsive Design**: Mobile-first approach with adaptive layouts

```typescript
// Example of theme implementation
const [theme, setTheme] = useState<ThemeType>(() => {
  return (localStorage.getItem('theme') as ThemeType) || 'light';
});
```

#### Form Handling & User Input
- **React Hook Form**: Efficient form state management and validation
- **CKEditor**: Rich text editing capabilities
- **Form Validation**: Client-side validation with schema-based rules

#### User Experience Enhancements
- **React Toastify**: Non-intrusive notifications
- **React Beautiful DnD**: Drag-and-drop interfaces for intuitive interactions
- **Loading States**: Suspense boundaries and loading indicators
- **Error Handling**: Graceful error presentation

### Backend Architecture

#### Server Framework & API Design
- **Express.js**: Fast, unopinionated web framework
- **RESTful API**: Structured endpoints following REST principles
- **Middleware Architecture**: Composable middleware for request processing
- **Route Organization**: Feature-based route organization

```javascript
// Example of route organization
app.use('/api/auth', require('./routes/auth'));
app.use('/api/statutory', auth, require('./routes/statutory'));
app.use('/api/settings', auth, require('./routes/settings'));
app.use('/api/crm', auth, require('./routes/crm'));
```

#### Authentication & Security
- **JWT**: Stateless authentication with JSON Web Tokens
- **Role-Based Access Control**: Granular permission system
- **Middleware Protection**: Route protection with authentication middleware
- **Password Security**: Secure password hashing with bcrypt

#### Database Integration
- **Prisma ORM**: Next-generation ORM with type safety
- **Migration System**: Structured database schema evolution
- **Query Building**: Type-safe database queries
- **Relationship Management**: Efficient handling of complex relationships

```javascript
// Example of Prisma query
const director = await prisma.director.create({
  data: directorData,
  include: {
    company: true
  }
});
```

#### Background Processing
- **Bull**: Redis-based queue for background job processing
- **Worker Processes**: Dedicated processes for handling long-running tasks
- **Job Scheduling**: Scheduled and on-demand job execution
- **Error Handling**: Robust error recovery and retry mechanisms

```javascript
// Example of Bull queue implementation
importQueue.process(async (job) => {
  const { filePath, fileName, mimeType, mapping, companyId } = job.data;
  // Process import job
});
```

#### File Handling & Storage
- **Multer**: Middleware for handling multipart/form-data
- **CSV/Excel Processing**: Parsing and processing of imported data
- **File Storage**: Organized file storage with proper directory structure

#### Logging & Monitoring
- **Winston**: Structured logging with multiple transports
- **Error Tracking**: Comprehensive error capturing and reporting
- **Performance Monitoring**: Request timing and resource utilization tracking

```javascript
// Example of Winston logger configuration
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'api/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'api/logs/imports.log', level: 'info' })
  ]
});
```

### Database Architecture

#### Schema Design
- **Entity Relationships**: Carefully designed relationships between models
- **Normalization**: Properly normalized data structure
- **Indexing Strategy**: Strategic indexes for query performance
- **Enum Types**: Strongly typed enumeration values

Key models include:
- User, Role, Permission (authentication & authorization)
- Company, Director, Shareholder (statutory compliance)
- Contact, Deal, Pipeline (CRM)
- Plan, Invoice, Payment (billing)

#### Data Access Patterns
- **Repository Pattern**: Encapsulated data access logic
- **Transaction Handling**: Atomic operations for data integrity
- **Caching Strategy**: Efficient data caching for performance
- **Query Optimization**: Optimized queries for complex operations

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- Redis (for background job processing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/bradan-accountants.git
cd bradan-accountants
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

## Project Structure

```
bradan-accountants/
├── api/                    # Backend API
│   ├── prisma/            # Database schema and migrations
│   │   ├── schema.prisma  # Prisma schema definition
│   │   ├── migrations/    # Database migrations
│   │   └── seeds/         # Seed data scripts
│   ├── routes/            # API endpoints
│   │   ├── auth.js        # Authentication routes
│   │   ├── crm/           # CRM module routes
│   │   ├── settings/      # Settings module routes
│   │   └── statutory/     # Statutory module routes
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # Authentication middleware
│   ├── services/          # Business logic
│   │   └── queue.js       # Background job processing
│   ├── utils/             # Utility functions
│   └── server.js          # Express server setup
│
└── app/                   # React frontend
    ├── public/            # Static assets
    └── src/
        ├── components/    # React components
        │   ├── auth/      # Authentication components
        │   ├── crm/       # CRM module components
        │   ├── dashboards/# Dashboard components
        │   ├── forms/     # Form components
        │   ├── settings/  # Settings components
        │   ├── shared/    # Shared components
        │   └── statutory/ # Statutory module components
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
- Write comprehensive unit tests
- Document complex functionality
- Use meaningful commit messages

### Component Structure
- Feature-based organization
- Functional components with hooks
- Context API for state management
- Custom hooks for reusable logic
- Service abstraction

### Styling
- SCSS methodology
- Bootstrap framework
- Responsive design
- Consistent theming
- Accessibility compliance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Create a Pull Request

## Deployment to Google Cloud Platform (GCP)

### Prerequisites for GCP Deployment

- Google Cloud Platform account with a project set up
- Google Cloud SDK installed locally
- Docker installed locally (for building container images)
- Terraform installed locally (for automated deployment)
- Firebase CLI installed locally (for frontend deployment)

### Deployment Options

#### Option 1: Automated Deployment Script

We provide a fully automated deployment script that sets up all necessary GCP resources and deploys the application:

```bash
# Make the script executable
chmod +x deploy-to-gcp.sh

# Run the deployment script
./deploy-to-gcp.sh
```

The script will:
1. Set up all required GCP resources in the europe-west1 (Ireland) region
2. Deploy the backend to Cloud Run
3. Deploy the frontend to Firebase Hosting
4. Configure Cloud SQL for PostgreSQL
5. Set up Memorystore for Redis
6. Configure security and networking

#### Option 2: Step-by-Step Manual Deployment

For a detailed step-by-step guide, see the [GCP Deployment Guide](./docs/gcp-deployment-guide.md).

#### Option 3: VM-Based Deployment

For deploying on a Google Cloud Platform Virtual Machine (VM) with full OS control:

- Follow the [GCP VM Deployment Guide](./docs/gcp-vm-deployment-guide.md)
- This approach gives you complete control over the operating system and environment
- Suitable for custom configurations and specific performance optimizations

### Deployment Architecture

The application is deployed with the following architecture:

- **Frontend**: Firebase Hosting
- **Backend**: Cloud Run
- **Database**: Cloud SQL for PostgreSQL
- **Cache/Queue**: Memorystore for Redis
- **File Storage**: Cloud Storage
- **Secrets**: Secret Manager
- **Security**: Cloud IAM, VPC Service Controls, Cloud Armor

### Environment Configuration

The deployment uses the following environment variables, which should be configured in Secret Manager:

```
# Server Configuration
PORT=8080  # Cloud Run default port

# Database Configuration
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[INSTANCE_CONNECTION_NAME]/bradan_accountants?host=/cloudsql/[INSTANCE_CONNECTION_NAME]"

# Security
JWT_SECRET=[GENERATED_SECRET]
ENCRYPTION_KEY=[GENERATED_KEY]

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Redis Configuration
REDIS_HOST=[REDIS_IP]
REDIS_PORT=6379

# Import Settings
IMPORT_BATCH_SIZE=1000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/imports
```

### Monitoring and Maintenance

- **Logging**: Cloud Logging
- **Monitoring**: Cloud Monitoring
- **Error Tracking**: Error Reporting
- **Performance**: Cloud Trace

### Scaling Configuration

The deployment is configured for automatic scaling:

- **Backend**: Cloud Run auto-scaling
- **Database**: Cloud SQL automatic storage increase
- **Redis**: Memorystore capacity management

## License

This project is licensed under the MIT License - see the LICENSE file for details.
