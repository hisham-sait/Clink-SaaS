const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEngage() {
  console.log('Creating engage data...');

  try {
    // Get companies
    const companies = await prisma.company.findMany({
      take: 3,
    });

    if (companies.length === 0) {
      console.log('No companies found. Please run the auth seed first.');
      return;
    }

    // Create categories for each company
    for (const company of companies) {
      console.log(`Creating engage data for company: ${company.name}`);

      // Create page categories
      const pageCategories = await createPageCategories(company.id);
      
      // Create form categories
      const formCategories = await createFormCategories(company.id);
      
      // Create survey categories
      const surveyCategories = await createSurveyCategories(company.id);
      
      // Create pages
      await createPages(company.id, pageCategories);
      
      // Create forms
      await createForms(company.id, formCategories);
      
      // Create surveys
      await createSurveys(company.id, surveyCategories);
      
      // Create link categories
      const linkCategories = await createLinkCategories(company.id);
      
      // Create shortlinks
      await createShortlinks(company.id, linkCategories);
      
      // Create digitallinks
      await createDigitalLinks(company.id, linkCategories);
    }

    console.log('Engage data created successfully');
  } catch (error) {
    console.error('Error creating engage data:', error);
  }
}

async function createPageCategories(companyId) {
  console.log('Creating page categories...');
  
  const categories = [
    {
      name: 'Marketing',
      description: 'Marketing pages',
      color: '#FF5733',
    },
    {
      name: 'Product',
      description: 'Product pages',
      color: '#33FF57',
    },
    {
      name: 'Support',
      description: 'Support pages',
      color: '#3357FF',
    },
  ];
  
  const createdCategories = [];
  
  for (const category of categories) {
    const createdCategory = await prisma.pageCategory.create({
      data: {
        ...category,
        companyId,
      },
    });
    
    createdCategories.push(createdCategory);
    console.log(`Created page category: ${createdCategory.name}`);
  }
  
  return createdCategories;
}

async function createFormCategories(companyId) {
  console.log('Creating form categories...');
  
  const categories = [
    {
      name: 'Contact',
      description: 'Contact forms',
      color: '#FF5733',
    },
    {
      name: 'Feedback',
      description: 'Feedback forms',
      color: '#33FF57',
    },
    {
      name: 'Registration',
      description: 'Registration forms',
      color: '#3357FF',
    },
  ];
  
  const createdCategories = [];
  
  for (const category of categories) {
    const createdCategory = await prisma.formCategory.create({
      data: {
        ...category,
        companyId,
      },
    });
    
    createdCategories.push(createdCategory);
    console.log(`Created form category: ${createdCategory.name}`);
  }
  
  return createdCategories;
}

async function createSurveyCategories(companyId) {
  console.log('Creating survey categories...');
  
  const categories = [
    {
      name: 'Customer Satisfaction',
      description: 'Customer satisfaction surveys',
      color: '#FF5733',
    },
    {
      name: 'Product Feedback',
      description: 'Product feedback surveys',
      color: '#33FF57',
    },
    {
      name: 'Market Research',
      description: 'Market research surveys',
      color: '#3357FF',
    },
  ];
  
  const createdCategories = [];
  
  for (const category of categories) {
    const createdCategory = await prisma.surveyCategory.create({
      data: {
        ...category,
        companyId,
      },
    });
    
    createdCategories.push(createdCategory);
    console.log(`Created survey category: ${createdCategory.name}`);
  }
  
  return createdCategories;
}

async function createPages(companyId, categories) {
  console.log('Creating pages...');
  
  const pages = [
    {
      title: 'Welcome Page',
      description: 'Welcome to our company',
      slug: `welcome-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      sections: [
        {
          id: '1',
          type: 'header',
          content: {
            title: 'Welcome to Our Company',
            subtitle: 'We are glad to have you here',
          },
        },
        {
          id: '2',
          type: 'text',
          content: {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.',
          },
        },
        {
          id: '3',
          type: 'image',
          content: {
            url: 'https://via.placeholder.com/800x400',
            alt: 'Welcome Image',
          },
        },
      ],
      settings: {
        enableAnalytics: true,
        showHeader: true,
        showFooter: true,
      },
      appearance: {
        theme: 'light',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      categoryId: categories[0].id,
    },
    {
      title: 'Product Page',
      description: 'Our products',
      slug: `products-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      sections: [
        {
          id: '1',
          type: 'header',
          content: {
            title: 'Our Products',
            subtitle: 'Check out our amazing products',
          },
        },
        {
          id: '2',
          type: 'text',
          content: {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.',
          },
        },
        {
          id: '3',
          type: 'gallery',
          content: {
            images: [
              {
                url: 'https://via.placeholder.com/400x300',
                alt: 'Product 1',
              },
              {
                url: 'https://via.placeholder.com/400x300',
                alt: 'Product 2',
              },
              {
                url: 'https://via.placeholder.com/400x300',
                alt: 'Product 3',
              },
            ],
          },
        },
      ],
      settings: {
        enableAnalytics: true,
        showHeader: true,
        showFooter: true,
      },
      appearance: {
        theme: 'light',
        primaryColor: '#28a745',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      categoryId: categories[1].id,
    },
    {
      title: 'Contact Page',
      description: 'Contact us',
      slug: `contact-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      sections: [
        {
          id: '1',
          type: 'header',
          content: {
            title: 'Contact Us',
            subtitle: 'Get in touch with us',
          },
        },
        {
          id: '2',
          type: 'text',
          content: {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.',
          },
        },
        {
          id: '3',
          type: 'contact',
          content: {
            email: 'contact@example.com',
            phone: '+1 123 456 7890',
            address: '123 Main St, City, Country',
          },
        },
      ],
      settings: {
        enableAnalytics: true,
        showHeader: true,
        showFooter: true,
      },
      appearance: {
        theme: 'light',
        primaryColor: '#dc3545',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      categoryId: categories[2].id,
    },
  ];
  
  for (const page of pages) {
    const createdPage = await prisma.page.create({
      data: {
        ...page,
        companyId,
      },
    });
    
    console.log(`Created page: ${createdPage.title}`);
    
    // Create page views
    await createPageViews(createdPage.id);
  }
}

async function createPageViews(pageId) {
  console.log(`Creating page views for page: ${pageId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numViews = Math.floor(Math.random() * 20) + 10; // 10-30 views
  
  for (let i = 0; i < numViews; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const timeOnPage = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    
    await prisma.pageView.create({
      data: {
        pageId,
        visitorId: `visitor-${Math.random().toString(36).substring(2, 10)}`,
        device,
        browser,
        location,
        referrer,
        timeOnPage,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
      },
    });
  }
  
  console.log(`Created ${numViews} page views for page: ${pageId}`);
}

async function createForms(companyId, categories) {
  console.log('Creating forms...');
  
  const forms = [
    {
      title: 'Contact Form',
      description: 'Contact us form',
      slug: `contact-form-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Submit',
        successMessage: 'Thank you for contacting us!',
        redirectUrl: '',
        notifyEmail: 'contact@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: JSON.stringify([
        {
          id: '1',
          title: 'Contact Information',
          description: 'Please provide your contact information',
        },
      ]),
      elements: JSON.stringify([
        {
          id: '1',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true,
          sectionId: '1',
        },
        {
          id: '2',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          sectionId: '1',
        },
        {
          id: '3',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Enter your message',
          required: true,
          sectionId: '1',
        },
      ]),
      categoryId: categories[0].id,
    },
    {
      title: 'Feedback Form',
      description: 'Feedback form',
      slug: `feedback-form-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Submit Feedback',
        successMessage: 'Thank you for your feedback!',
        redirectUrl: '',
        notifyEmail: 'feedback@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#28a745',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: JSON.stringify([
        {
          id: '1',
          title: 'Your Feedback',
          description: 'Please provide your feedback',
        },
      ]),
      elements: JSON.stringify([
        {
          id: '1',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          required: true,
          sectionId: '1',
        },
        {
          id: '2',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          sectionId: '1',
        },
        {
          id: '3',
          type: 'select',
          label: 'Rating',
          options: [
            { label: '1 - Poor', value: '1' },
            { label: '2 - Fair', value: '2' },
            { label: '3 - Good', value: '3' },
            { label: '4 - Very Good', value: '4' },
            { label: '5 - Excellent', value: '5' },
          ],
          required: true,
          sectionId: '1',
        },
        {
          id: '4',
          type: 'textarea',
          label: 'Comments',
          placeholder: 'Enter your comments',
          required: true,
          sectionId: '1',
        },
      ]),
      categoryId: categories[1].id,
    },
    {
      title: 'Registration Form',
      description: 'Registration form',
      slug: `registration-form-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Register',
        successMessage: 'Thank you for registering!',
        redirectUrl: '',
        notifyEmail: 'registration@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#dc3545',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: JSON.stringify([
        {
          id: '1',
          title: 'Personal Information',
          description: 'Please provide your personal information',
        },
        {
          id: '2',
          title: 'Account Information',
          description: 'Please provide your account information',
        },
      ]),
      elements: JSON.stringify([
        {
          id: '1',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true,
          sectionId: '1',
        },
        {
          id: '2',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          required: true,
          sectionId: '1',
        },
        {
          id: '3',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          required: true,
          sectionId: '2',
        },
        {
          id: '4',
          type: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          required: true,
          sectionId: '2',
        },
        {
          id: '5',
          type: 'checkbox',
          label: 'I agree to the terms and conditions',
          required: true,
          sectionId: '2',
        },
      ]),
      categoryId: categories[2].id,
    },
  ];
  
  for (const form of forms) {
    const createdForm = await prisma.form.create({
      data: {
        ...form,
        companyId,
      },
    });
    
    console.log(`Created form: ${createdForm.title}`);
    
    // Create form views
    await createFormViews(createdForm.id);
    
    // Create form submissions
    await createFormSubmissions(createdForm.id);
  }
}

async function createFormViews(formId) {
  console.log(`Creating form views for form: ${formId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numViews = Math.floor(Math.random() * 20) + 10; // 10-30 views
  
  for (let i = 0; i < numViews; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const timeOnPage = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    
    await prisma.formView.create({
      data: {
        formId,
        visitorId: `visitor-${Math.random().toString(36).substring(2, 10)}`,
        device,
        browser,
        location,
        referrer,
        timeOnPage,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
      },
    });
  }
  
  console.log(`Created ${numViews} form views for form: ${formId}`);
}

async function createFormSubmissions(formId) {
  console.log(`Creating form submissions for form: ${formId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numSubmissions = Math.floor(Math.random() * 10) + 5; // 5-15 submissions
  
  for (let i = 0; i < numSubmissions; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const completionTime = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    
    await prisma.formSubmission.create({
      data: {
        formId,
        data: {
          name: `Test User ${i + 1}`,
          email: `testuser${i + 1}@example.com`,
          message: 'This is a test submission.',
        },
        metadata: {
          browser,
          device,
        },
        visitorId: `visitor-${Math.random().toString(36).substring(2, 10)}`,
        device,
        browser,
        location,
        referrer,
        completionTime,
        status: 'completed',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
      },
    });
  }
  
  console.log(`Created ${numSubmissions} form submissions for form: ${formId}`);
}

async function createSurveys(companyId, categories) {
  console.log('Creating surveys...');
  
  const surveys = [
    {
      title: 'Customer Satisfaction Survey',
      description: 'Customer satisfaction survey',
      slug: `customer-satisfaction-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your feedback!',
        redirectUrl: '',
        notifyEmail: 'survey@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: [
        {
          id: '1',
          title: 'Product Satisfaction',
          description: 'Please rate your satisfaction with our product',
          questions: [
            {
              id: '1',
              question: 'How satisfied are you with our product?',
              type: 'rating',
              required: true,
              options: [
                { label: '1 - Very Dissatisfied', value: '1' },
                { label: '2 - Dissatisfied', value: '2' },
                { label: '3 - Neutral', value: '3' },
                { label: '4 - Satisfied', value: '4' },
                { label: '5 - Very Satisfied', value: '5' },
              ],
            },
            {
              id: '2',
              question: 'What do you like most about our product?',
              type: 'text',
              required: false,
            },
            {
              id: '3',
              question: 'What do you dislike most about our product?',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          id: '2',
          title: 'Customer Service',
          description: 'Please rate your satisfaction with our customer service',
          questions: [
            {
              id: '4',
              question: 'How satisfied are you with our customer service?',
              type: 'rating',
              required: true,
              options: [
                { label: '1 - Very Dissatisfied', value: '1' },
                { label: '2 - Dissatisfied', value: '2' },
                { label: '3 - Neutral', value: '3' },
                { label: '4 - Satisfied', value: '4' },
                { label: '5 - Very Satisfied', value: '5' },
              ],
            },
            {
              id: '5',
              question: 'How can we improve our customer service?',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
      categoryId: categories[0].id,
    },
    {
      title: 'Product Feedback Survey',
      description: 'Product feedback survey',
      slug: `product-feedback-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Submit Feedback',
        successMessage: 'Thank you for your feedback!',
        redirectUrl: '',
        notifyEmail: 'product@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#28a745',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: [
        {
          id: '1',
          title: 'Product Features',
          description: 'Please rate the following product features',
          questions: [
            {
              id: '1',
              question: 'How would you rate the ease of use?',
              type: 'rating',
              required: true,
              options: [
                { label: '1 - Very Difficult', value: '1' },
                { label: '2 - Difficult', value: '2' },
                { label: '3 - Neutral', value: '3' },
                { label: '4 - Easy', value: '4' },
                { label: '5 - Very Easy', value: '5' },
              ],
            },
            {
              id: '2',
              question: 'How would you rate the performance?',
              type: 'rating',
              required: true,
              options: [
                { label: '1 - Very Poor', value: '1' },
                { label: '2 - Poor', value: '2' },
                { label: '3 - Neutral', value: '3' },
                { label: '4 - Good', value: '4' },
                { label: '5 - Very Good', value: '5' },
              ],
            },
            {
              id: '3',
              question: 'How would you rate the design?',
              type: 'rating',
              required: true,
              options: [
                { label: '1 - Very Poor', value: '1' },
                { label: '2 - Poor', value: '2' },
                { label: '3 - Neutral', value: '3' },
                { label: '4 - Good', value: '4' },
                { label: '5 - Very Good', value: '5' },
              ],
            },
          ],
        },
        {
          id: '2',
          title: 'Product Suggestions',
          description: 'Please provide your suggestions for improving our product',
          questions: [
            {
              id: '4',
              question: 'What features would you like to see added to our product?',
              type: 'text',
              required: false,
            },
            {
              id: '5',
              question: 'What features would you like to see improved in our product?',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
      categoryId: categories[1].id,
    },
    {
      title: 'Market Research Survey',
      description: 'Market research survey',
      slug: `market-research-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Active',
      settings: {
        enableAnalytics: true,
        submitButtonText: 'Submit',
        successMessage: 'Thank you for participating in our survey!',
        redirectUrl: '',
        notifyEmail: 'research@example.com',
      },
      appearance: {
        theme: 'light',
        primaryColor: '#dc3545',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
      },
      sections: [
        {
          id: '1',
          title: 'Demographics',
          description: 'Please provide your demographic information',
          questions: [
            {
              id: '1',
              question: 'What is your age group?',
              type: 'select',
              required: true,
              options: [
                { label: 'Under 18', value: 'under_18' },
                { label: '18-24', value: '18-24' },
                { label: '25-34', value: '25-34' },
                { label: '35-44', value: '35-44' },
                { label: '45-54', value: '45-54' },
                { label: '55-64', value: '55-64' },
                { label: '65 or older', value: '65_or_older' },
              ],
            },
            {
              id: '2',
              question: 'What is your gender?',
              type: 'select',
              required: true,
              options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Non-binary', value: 'non-binary' },
                { label: 'Prefer not to say', value: 'prefer_not_to_say' },
              ],
            },
            {
              id: '3',
              question: 'What is your annual household income?',
              type: 'select',
              required: true,
              options: [
                { label: 'Less than $25,000', value: 'less_than_25000' },
                { label: '$25,000 - $49,999', value: '25000-49999' },
                { label: '$50,000 - $74,999', value: '50000-74999' },
                { label: '$75,000 - $99,999', value: '75000-99999' },
                { label: '$100,000 - $149,999', value: '100000-149999' },
                { label: '$150,000 or more', value: '150000_or_more' },
                { label: 'Prefer not to say', value: 'prefer_not_to_say' },
              ],
            },
          ],
        },
        {
          id: '2',
          title: 'Product Usage',
          description: 'Please provide information about your product usage',
          questions: [
            {
              id: '4',
              question: 'How often do you use our product?',
              type: 'select',
              required: true,
              options: [
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Rarely', value: 'rarely' },
                { label: 'Never', value: 'never' },
              ],
            },
            {
              id: '5',
              question: 'How did you hear about our product?',
              type: 'select',
              required: true,
              options: [
                { label: 'Search Engine', value: 'search_engine' },
                { label: 'Social Media', value: 'social_media' },
                { label: 'Friend/Family', value: 'friend_family' },
                { label: 'Advertisement', value: 'advertisement' },
                { label: 'Other', value: 'other' },
              ],
            },
          ],
        },
      ],
      categoryId: categories[2].id,
    },
  ];
  
  for (const survey of surveys) {
    const createdSurvey = await prisma.survey.create({
      data: {
        ...survey,
        companyId,
      },
    });
    
    console.log(`Created survey: ${createdSurvey.title}`);
    
    // Create survey views
    await createSurveyViews(createdSurvey.id);
    
    // Create survey responses
    await createSurveyResponses(createdSurvey.id);
  }
}

async function createSurveyViews(surveyId) {
  console.log(`Creating survey views for survey: ${surveyId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numViews = Math.floor(Math.random() * 20) + 10; // 10-30 views
  
  for (let i = 0; i < numViews; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const timeOnPage = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    
    await prisma.surveyView.create({
      data: {
        surveyId,
        visitorId: `visitor-${Math.random().toString(36).substring(2, 10)}`,
        device,
        browser,
        location,
        referrer,
        timeOnPage,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
      },
    });
  }
  
  console.log(`Created ${numViews} survey views for survey: ${surveyId}`);
}

async function createSurveyResponses(surveyId) {
  console.log(`Creating survey responses for survey: ${surveyId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numResponses = Math.floor(Math.random() * 10) + 5; // 5-15 responses
  
  for (let i = 0; i < numResponses; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const completionTime = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
    
    await prisma.surveyResponse.create({
      data: {
        surveyId,
        data: {
          name: `Test User ${i + 1}`,
          email: `testuser${i + 1}@example.com`,
          answers: {
            'How satisfied are you with our product?': `${Math.floor(Math.random() * 5) + 1}`,
            'What do you like most about our product?': 'Great features and user interface.',
            'What do you dislike most about our product?': 'Could use more customization options.',
            'How satisfied are you with our customer service?': `${Math.floor(Math.random() * 5) + 1}`,
            'How can we improve our customer service?': 'Faster response times would be great.',
          },
        },
        metadata: {
          browser,
          device,
        },
        visitorId: `visitor-${Math.random().toString(36).substring(2, 10)}`,
        device,
        browser,
        location,
        referrer,
        completionTime,
        status: 'completed',
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
      },
    });
  }
  
  console.log(`Created ${numResponses} survey responses for survey: ${surveyId}`);
}

async function createLinkCategories(companyId) {
  console.log('Creating link categories...');
  
  const categories = [
    {
      name: 'Marketing',
      description: 'Marketing links',
      color: '#FF5733',
    },
    {
      name: 'Product',
      description: 'Product links',
      color: '#33FF57',
    },
    {
      name: 'Support',
      description: 'Support links',
      color: '#3357FF',
    },
  ];
  
  const createdCategories = [];
  
  for (const category of categories) {
    const createdCategory = await prisma.linkCategory.create({
      data: {
        ...category,
        companyId,
      },
    });
    
    createdCategories.push(createdCategory);
    console.log(`Created link category: ${createdCategory.name}`);
  }
  
  return createdCategories;
}

async function createShortlinks(companyId, categories) {
  console.log('Creating shortlinks...');
  
  const shortlinks = [
    {
      originalUrl: 'https://example.com/marketing/campaign1',
      shortCode: `mkt1-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Marketing Campaign 1',
      description: 'Marketing campaign 1 shortlink',
      tags: ['marketing', 'campaign', 'social'],
      status: 'Active',
      categoryId: categories[0].id,
    },
    {
      originalUrl: 'https://example.com/products/product1',
      shortCode: `prod1-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Product 1',
      description: 'Product 1 shortlink',
      tags: ['product', 'launch', 'new'],
      status: 'Active',
      categoryId: categories[1].id,
    },
    {
      originalUrl: 'https://example.com/support/faq',
      shortCode: `faq-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'FAQ',
      description: 'FAQ shortlink',
      tags: ['support', 'faq', 'help'],
      status: 'Active',
      categoryId: categories[2].id,
    },
  ];
  
  for (const shortlink of shortlinks) {
    const createdShortlink = await prisma.link.create({
      data: {
        ...shortlink,
        companyId,
      },
    });
    
    console.log(`Created shortlink: ${createdShortlink.title}`);
    
    // Create link analytics
    await createLinkAnalytics(createdShortlink.id);
  }
}

async function createLinkAnalytics(linkId) {
  console.log(`Creating link analytics for link: ${linkId}`);
  
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const locations = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'];
  const referrers = ['Google', 'Facebook', 'Twitter', 'Direct', 'LinkedIn'];
  
  const numClicks = Math.floor(Math.random() * 50) + 20; // 20-70 clicks
  
  for (let i = 0; i < numClicks; i++) {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    
    await prisma.linkAnalytics.create({
      data: {
        linkId,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (${device}; ${browser})`,
        referer: referrer,
        country: location,
        city: 'City',
        device,
        browser,
        os: device === 'Desktop' ? 'Windows' : device === 'Mobile' ? 'iOS' : 'Android',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in the last 30 days
      },
    });
  }
  
  // Update the link's click count
  await prisma.link.update({
    where: { id: linkId },
    data: { clicks: numClicks },
  });
  
  console.log(`Created ${numClicks} link analytics for link: ${linkId}`);
}

async function createDigitalLinks(companyId, categories) {
  console.log('Creating digital links...');
  
  const digitalLinks = [
    {
      title: 'Product 1 Digital Link',
      description: 'Digital link for product 1',
      tags: ['product', 'digital', 'gs1'],
      status: 'Active',
      url: 'https://example.com/products/product1',
      gs1Key: `01234567890123-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      gs1KeyType: 'GTIN',
      gs1Url: `https://id.gs1.org/01/01234567890123-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      redirectType: 'direct',
      categoryId: categories[0].id,
    },
    {
      title: 'Product 2 Digital Link',
      description: 'Digital link for product 2',
      tags: ['product', 'digital', 'gs1'],
      status: 'Active',
      url: 'https://example.com/products/product2',
      gs1Key: `12345678901234-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      gs1KeyType: 'GTIN',
      gs1Url: `https://id.gs1.org/01/12345678901234-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      redirectType: 'direct',
      categoryId: categories[1].id,
    },
    {
      title: 'Product 3 Digital Link',
      description: 'Digital link for product 3',
      tags: ['product', 'digital', 'gs1'],
      status: 'Active',
      url: 'https://example.com/products/product3',
      gs1Key: `23456789012345-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      gs1KeyType: 'GTIN',
      gs1Url: `https://id.gs1.org/01/23456789012345-${companyId.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`,
      redirectType: 'direct',
      categoryId: categories[2].id,
    },
  ];
  
  for (const digitalLink of digitalLinks) {
    const createdDigitalLink = await prisma.digitalLink.create({
      data: {
        ...digitalLink,
        companyId,
      },
    });
    
    console.log(`Created digital link: ${createdDigitalLink.title}`);
    
    // Create digital link activities
    await createDigitalLinkActivities(createdDigitalLink.id, companyId);
    
    // Create digital link events
    await createDigitalLinkEvents(createdDigitalLink.id);
  }
}

async function createDigitalLinkActivities(linkId, companyId) {
  console.log(`Creating digital link activities for link: ${linkId}`);
  
  const activities = [
    {
      action: 'create',
      details: { message: 'Digital link created' },
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      companyId,
      itemId: linkId,
      itemName: 'Digital Link',
    },
    {
      action: 'update',
      details: { message: 'Digital link updated', fields: ['title', 'description'] },
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      companyId,
      itemId: linkId,
      itemName: 'Digital Link',
    },
    {
      action: 'view',
      details: { message: 'Digital link viewed' },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      companyId,
      itemId: linkId,
      itemName: 'Digital Link',
    },
  ];
  
  for (const activity of activities) {
    await prisma.digitalLinkActivity.create({
      data: {
        ...activity,
        linkId,
      },
    });
  }
  
  console.log(`Created ${activities.length} digital link activities for link: ${linkId}`);
}

async function createDigitalLinkEvents(digitalLinkId) {
  console.log(`Creating digital link events for link: ${digitalLinkId}`);
  
  const events = [
    {
      eventType: 'scan',
      data: {
        device: 'Mobile',
        browser: 'Chrome',
        location: 'United States',
      },
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      eventType: 'scan',
      data: {
        device: 'Mobile',
        browser: 'Safari',
        location: 'United Kingdom',
      },
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      eventType: 'scan',
      data: {
        device: 'Mobile',
        browser: 'Firefox',
        location: 'Germany',
      },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ];
  
  for (const event of events) {
    await prisma.digitalLinkEvent.create({
      data: {
        ...event,
        digitalLinkId,
      },
    });
  }
  
  console.log(`Created ${events.length} digital link events for link: ${digitalLinkId}`);
}

module.exports = seedEngage;
