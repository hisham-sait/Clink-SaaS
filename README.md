# Bradán Accountants

A modern corporate compliance and management platform built with Angular, focusing on statutory compliance, tax management, and corporate governance.

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

### Frontend (Angular)
- **Modern Architecture**
  - Standalone components
  - Lazy loading
  - Route-based code splitting
  - State management
  - Responsive design

- **UI/UX Features**
  - Dynamic sidebar navigation
  - Role-based interface adaptation
  - Bootstrap-based responsive design
  - Modern iconography
  - Intuitive workflows

### Backend (Node.js/Express)
- **API Structure**
  - RESTful endpoints
  - JWT authentication
  - Role-based access control
  - File upload handling
  - Background workers

### Database (Prisma)
- **Data Management**
  - Structured migrations
  - Relationship management
  - Data seeding
  - Type safety
  - Query optimization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/bradan-accountants.git
cd bradan-accountants
```

2. Install dependencies:
```bash
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
# Start API server (from api directory)
npm run dev

# Start Angular development server (from app directory)
npm run start
```

5. Access the application at `http://localhost:4200`

## Project Structure

```
bradan-accountants/
├── api/                    # Backend API
│   ├── prisma/            # Database schema and migrations
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   └── workers/           # Background workers
│
└── app/                   # Angular frontend
    └── src/
        ├── app/
        │   ├── components/
        │   │   ├── statutory/    # Statutory module
        │   │   ├── compliance/   # Compliance module
        │   │   ├── tax/         # Tax module
        │   │   ├── settings/    # Settings module
        │   │   └── shared/      # Shared components
        │   ├── services/        # Angular services
        │   ├── guards/          # Route guards
        │   └── interceptors/    # HTTP interceptors
        ├── assets/             # Static assets
        └── environments/       # Environment configurations
```

## Development Guidelines

### Code Standards
- Follow Angular style guide
- Implement proper TypeScript types
- Write comprehensive unit tests
- Document complex functionality
- Use meaningful commit messages

### Component Structure
- Feature-based organization
- Shared component library
- Lazy-loaded modules
- State management patterns
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
