# Bradán Accountants

A modern accounting and CRM platform built with Angular, inspired by XERO's functionality and design patterns.

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

## Features

### Books Module
- **Dashboard**: Overview of financial metrics and activities
- **Accounting**: General ledger and accounting operations
- **Banking**: Bank connections and reconciliation
- **Invoicing**: Create and manage invoices
- **Bills**: Track and manage bills and payments
- **Expenses**: Expense tracking and management
- **Payroll**: Employee payroll management
- **Projects**: Project tracking and billing
- **Reports**: Financial reports and analytics
- **Files**: Document management system
- **Contacts**: Customer and vendor management

### CRM Module
- **Dashboard**: CRM metrics and activity overview
- **Contacts**: Contact management and tracking
- **Companies**: Company profiles and relationships
- **Marketing Hub**: Marketing campaign management
- **Sales Hub**: Sales pipeline and opportunity tracking
- **Service Hub**: Customer service and support
- **Operations Hub**: Business operations management
- **CMS Hub**: Content management system

## Technical Features

- **Modern Angular Architecture**
  - Standalone components
  - Lazy loading
  - Route-based code splitting
  - Responsive design

- **UI/UX Features**
  - Responsive sidebar with expand/collapse functionality
  - Dark mode support
  - Mobile-first design
  - Smooth transitions and animations
  - Bootstrap Icons integration

- **Performance Optimizations**
  - Lazy-loaded modules
  - Component-based architecture
  - Efficient routing system
  - Optimized asset loading

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v16 or higher)

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

3. Start the development servers:
```bash
# Start API server (from api directory)
npm run dev

# Start Angular development server (from app directory)
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
bradan-accountants/
├── api/                 # Backend API
└── app/                 # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── books/       # Books module components
    │   │   │   ├── crm/         # CRM module components
    │   │   │   ├── shared/      # Shared components
    │   │   │   └── sidebar/     # Sidebar component
    │   │   ├── app.component.*  # Root component
    │   │   └── app.routes.ts    # Main routes
    │   ├── assets/
    │   └── styles/
    └── package.json
```

## Development

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper type checking
- Maintain consistent component structure

### Component Structure
- Standalone components
- Separate routing modules
- Lazy-loaded feature modules
- Shared components for reusability

### Styling
- SCSS for styling
- Bootstrap Icons for iconography
- Responsive design patterns
- Dark mode support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by XERO's functionality and design
- Built with Angular framework
- Uses Bootstrap Icons for iconography
