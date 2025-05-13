# Profile Element

The Profile Element is a component that displays a user profile with avatar, name, title, bio, contact information, and social links.

## Features

- Customizable avatar with different sizes and shapes
- Name, title, and bio sections
- Contact information (email and phone)
- Social media links with icons
- Responsive design with mobile and desktop visibility options
- Accessibility support
- Animation effects
- Styling options (colors, borders, shadows, etc.)

## Usage

The Profile Element can be added to a page using the element palette. Once added, it can be customized using the properties panel.

### Basic Properties

- **Name**: The name of the person or entity
- **Title**: Job title or role
- **Bio**: Short biography or description
- **Avatar URL**: URL to the profile image
- **Show Avatar**: Toggle to show/hide the avatar
- **Avatar Size**: Small, Medium, or Large
- **Avatar Shape**: Circle, Square, or Rounded
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Show Social Links**: Toggle to show/hide social links
- **Social Links**: Array of social media links with platform, URL, and icon

### Layout Properties

- **Width**: Element width (px, %, etc.)
- **Height**: Element height (px, %, etc.)
- **Alignment**: Left, Center, or Right
- **Border Style**: None, Solid, Dashed, Dotted, or Double
- **Border Width**: Border thickness
- **Border Color**: Border color
- **Border Radius**: Corner rounding
- **Margin**: External spacing
- **Padding**: Internal spacing

### Effect Properties

- **Background Color**: Element background color
- **Opacity**: Element transparency
- **Box Shadow**: Shadow effect with customizable properties

### Animation Properties

- **Animation**: None, Fade, Slide, Bounce, Zoom, Flip, Rotate, or Pulse
- **Animation Duration**: Length of animation
- **Animation Delay**: Delay before animation starts
- **Animation Easing**: Timing function for animation

### Responsive Properties

- **Hide on Mobile**: Toggle visibility on mobile devices
- **Hide on Desktop**: Toggle visibility on desktop devices
- **Mobile Width**: Width on mobile devices
- **Mobile Height**: Height on mobile devices

### Accessibility Properties

- **ARIA Label**: Accessible label for screen readers
- **Role**: ARIA role
- **Tab Index**: Tab navigation order

## Implementation Details

The Profile Element is implemented using React for the editor interface and renders as HTML/CSS for the final output. It uses Font Awesome icons for social media links and contact information.

## Example

```jsx
<ProfileElement
  name="John Doe"
  title="Software Engineer"
  bio="Experienced software engineer with a passion for creating user-friendly applications."
  avatarUrl="https://example.com/avatar.jpg"
  showAvatar={true}
  avatarSize="md"
  avatarShape="circle"
  email="john@example.com"
  phone="+1 (555) 123-4567"
  showSocial={true}
  socialLinks={[
    { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe', icon: 'linkedin' },
    { platform: 'github', url: 'https://github.com/johndoe', icon: 'github' }
  ]}
  width="100%"
  alignment="center"
  backgroundColor="#f5f5f5"
  borderRadius="8px"
  padding="20px"
/>
