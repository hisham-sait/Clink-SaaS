// Demo data for the Proposal Builder

export interface ProposalSectionTemplate {
  id: string;
  title: string;
  type: string;
  description: string;
  icon: string;
  content: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  type: string;
  content: string;
  isAIGenerated: boolean;
  aiPrompt?: string;
  order: number;
}

// Sample section templates
export const sectionTemplates: ProposalSectionTemplate[] = [
  {
    id: 'template-cover',
    title: 'Cover Page',
    type: 'cover',
    description: 'Professional cover page with logo',
    icon: 'bi-file-earmark-image',
    content: `
      <div class="cover-page text-center py-5">
        <div class="company-logo mb-4">
          <img src="https://via.placeholder.com/200x100?text=Your+Logo" alt="Company Logo" class="img-fluid" />
        </div>
        <h1 class="display-4 mb-4">[Proposal Name]</h1>
        <h3 class="mb-4">Prepared for: [Client Name]</h3>
        <p class="lead">Prepared by: [Your Company]</p>
        <p class="text-muted">Created on: ${new Date().toLocaleDateString()}</p>
        <p class="text-muted">Valid until: [Expiry Date]</p>
      </div>
    `
  },
  {
    id: 'template-intro',
    title: 'Introduction',
    type: 'introduction',
    description: 'Introduce your company and the proposal',
    icon: 'bi-file-earmark-text',
    content: `
      <h2>Introduction</h2>
      <p>Thank you for the opportunity to present this proposal. We are excited about the possibility of working with you on this project.</p>
      <p>At [Company Name], we specialize in delivering high-quality solutions that meet our clients' needs and exceed their expectations.</p>
    `
  },
  {
    id: 'template-about',
    title: 'About Us',
    type: 'about',
    description: 'Share information about your company',
    icon: 'bi-building',
    content: `
      <h2>About Us</h2>
      <p>Founded in [Year], [Company Name] has been providing exceptional services to clients across various industries.</p>
      <p>Our team of experienced professionals is dedicated to delivering innovative solutions that drive business growth and success.</p>
      <p>We pride ourselves on our commitment to quality, integrity, and client satisfaction.</p>
    `
  },
  {
    id: 'template-services',
    title: 'Services',
    type: 'services',
    description: 'Outline the services you offer',
    icon: 'bi-gear',
    content: `
      <h2>Our Services</h2>
      <p>We offer a comprehensive range of services designed to meet your specific needs:</p>
      <ul>
        <li><strong>Service 1:</strong> Description of service 1</li>
        <li><strong>Service 2:</strong> Description of service 2</li>
        <li><strong>Service 3:</strong> Description of service 3</li>
      </ul>
      <p>Each service is tailored to address your unique challenges and help you achieve your goals.</p>
    `
  },
  {
    id: 'template-pricing',
    title: 'Pricing',
    type: 'pricing',
    description: 'Present your pricing structure',
    icon: 'bi-currency-euro',
    content: `
      <div class="alert alert-info">
        This section will dynamically display the services and plans you've added to the proposal.
        Add services in the Services & Plans tab of the proposal properties.
      </div>
    `
  },
  {
    id: 'template-timeline',
    title: 'Timeline',
    type: 'timeline',
    description: 'Outline the project timeline',
    icon: 'bi-calendar',
    content: `
      <h2>Project Timeline</h2>
      <p>We are committed to delivering this project efficiently and on schedule:</p>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-date">Week 1</div>
          <div class="timeline-content">
            <h5>Project Initiation</h5>
            <p>Kickoff meeting, requirements gathering, and project planning</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">Weeks 2-3</div>
          <div class="timeline-content">
            <h5>Development Phase</h5>
            <p>Implementation of core features and functionality</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">Week 4</div>
          <div class="timeline-content">
            <h5>Testing & Refinement</h5>
            <p>Quality assurance, feedback incorporation, and final adjustments</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">Week 5</div>
          <div class="timeline-content">
            <h5>Delivery & Implementation</h5>
            <p>Final delivery, training, and support</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'template-testimonials',
    title: 'Testimonials',
    type: 'testimonials',
    description: 'Share client testimonials',
    icon: 'bi-chat-quote',
    content: `
      <h2>Client Testimonials</h2>
      <p>Don't just take our word for it. Here's what our clients have to say:</p>
      <div class="testimonial">
        <blockquote>"Working with [Company Name] has been a game-changer for our business. Their expertise and dedication have helped us achieve remarkable results."</blockquote>
        <p class="testimonial-author">— John Smith, CEO of XYZ Company</p>
      </div>
      <div class="testimonial">
        <blockquote>"The team at [Company Name] consistently delivers exceptional quality and value. They truly understand our needs and exceed our expectations."</blockquote>
        <p class="testimonial-author">— Jane Doe, Director at ABC Corporation</p>
      </div>
    `
  },
  {
    id: 'template-conclusion',
    title: 'Conclusion',
    type: 'conclusion',
    description: 'Summarize and close the proposal',
    icon: 'bi-check-circle',
    content: `
      <h2>Conclusion</h2>
      <p>Thank you for considering [Company Name] for your project. We are confident that our expertise, experience, and commitment to excellence make us the ideal partner for your needs.</p>
      <p>We look forward to the opportunity to work with you and contribute to your success.</p>
      <p>Please feel free to contact us with any questions or to discuss how we can tailor our services to better meet your specific requirements.</p>
    `
  },
  {
    id: 'template-page-break',
    title: 'Page Break',
    type: 'page-break',
    description: 'Insert a page break',
    icon: 'bi-file-break',
    content: `
      <div class="page-break">
        <!-- This is a page break marker -->
      </div>
    `
  },
  {
    id: 'template-ai',
    title: 'AI Generated Section',
    type: 'ai-generated',
    description: 'Create a custom section with AI',
    icon: 'bi-robot',
    content: `
      <h2>AI Generated Content</h2>
      <p>This section will be generated based on your prompt using our AI assistant.</p>
      <p>Simply provide a description of what you'd like to include, and our AI will create relevant content for your proposal.</p>
    `
  }
];

// Sample proposal with sections
export const demoProposal = {
  id: 'demo-proposal-1',
  name: 'Website Development Proposal',
  contact: {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+353 87 123 4567',
    position: 'CEO',
    type: ['Client'],
    status: 'Active',
    lastContact: new Date(),
    tags: [],
    currency: 'EUR',
    companyId: 'company-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  deal: {
    id: 'deal-1',
    name: 'Website Redesign Project',
    amount: 7800,
    probability: 75,
    expectedCloseDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'Open'
  },
  validUntil: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  sections: [
    {
      id: 'section-1',
      title: 'Introduction',
      type: 'introduction',
      content: `
        <h2>Introduction</h2>
        <p>Thank you for the opportunity to present this website development proposal for [Client Name]. We are excited about the possibility of working with you to create a modern, effective website that will help you achieve your business goals.</p>
        <p>At Bradán Accountants, we specialize in developing custom websites that are not only visually appealing but also functional, user-friendly, and optimized for performance.</p>
      `,
      isAIGenerated: false,
      order: 1
    },
    {
      id: 'section-2',
      title: 'Project Overview',
      type: 'overview',
      content: `
        <h2>Project Overview</h2>
        <p>Based on our discussions, we understand that you need a professional website that will:</p>
        <ul>
          <li>Showcase your products and services</li>
          <li>Establish your brand identity online</li>
          <li>Generate leads and inquiries</li>
          <li>Provide information to your customers</li>
          <li>Be easy to update and maintain</li>
        </ul>
        <p>Our solution will address these needs while ensuring a seamless user experience across all devices.</p>
      `,
      isAIGenerated: true,
      aiPrompt: "Create a project overview section for a website development proposal",
      order: 2
    },
    {
      id: 'section-3',
      title: 'Proposed Solution',
      type: 'solution',
      content: `
        <h2>Proposed Solution</h2>
        <p>We propose developing a custom WordPress website with the following features:</p>
        <ul>
          <li><strong>Responsive Design:</strong> Your website will look great and function perfectly on all devices, from desktops to smartphones.</li>
          <li><strong>Custom Theme:</strong> A unique design that reflects your brand identity and stands out from competitors.</li>
          <li><strong>Content Management System:</strong> Easy-to-use backend that allows you to update content without technical knowledge.</li>
          <li><strong>SEO Optimization:</strong> Built-in features to help your site rank well in search engines.</li>
          <li><strong>Contact Forms:</strong> Custom forms to capture leads and inquiries.</li>
          <li><strong>Social Media Integration:</strong> Seamless connection with your social media profiles.</li>
        </ul>
      `,
      isAIGenerated: false,
      order: 3
    },
    {
      id: 'section-4',
      title: 'Pricing',
      type: 'pricing',
      content: `
        <h2>Pricing</h2>
        <p>Our pricing for this project is as follows:</p>
        <table class="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Price (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Website Design</td>
              <td>2,500</td>
            </tr>
            <tr>
              <td>Development</td>
              <td>3,500</td>
            </tr>
            <tr>
              <td>Content Creation</td>
              <td>1,000</td>
            </tr>
            <tr>
              <td>SEO Setup</td>
              <td>800</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>7,800</strong></td>
            </tr>
          </tbody>
        </table>
        <p>Payment terms: 50% upfront, 50% upon completion.</p>
      `,
      isAIGenerated: false,
      order: 4
    }
  ]
};
