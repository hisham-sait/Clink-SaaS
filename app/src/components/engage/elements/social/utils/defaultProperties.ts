import { SocialElementData } from '../SocialElementData';

/**
 * Default properties for a social media links element
 * @returns Default social element properties
 */
export const getSocialElementProperties = (): Partial<SocialElementData> => {
  return {
    type: 'social',
    label: 'Social Media Links',
    links: [
      { platform: 'linkedin', url: '', icon: 'linkedin', label: 'LinkedIn' },
      { platform: 'twitter', url: '', icon: 'twitter', label: 'Twitter' },
      { platform: 'facebook', url: '', icon: 'facebook', label: 'Facebook' },
      { platform: 'instagram', url: '', icon: 'instagram', label: 'Instagram' }
    ],
    displayStyle: 'icons',
    iconSize: 'md',
    iconColor: '#555555',
    alignment: 'center',
    spacing: '1rem',
    showLabels: false,
    openInNewTab: true,
    
    // Styling properties
    backgroundColor: 'transparent',
    borderRadius: '0',
    borderWidth: '0',
    borderColor: '#000000',
    borderStyle: 'none',
    
    // Size properties
    width: '100%',
    height: 'auto',
    
    // Spacing properties
    margin: '1rem 0',
    padding: '0',
    
    // Animation properties
    animation: 'none',
    animationDuration: '1s',
    animationDelay: '0s',
    animationEasing: 'ease',
    
    // Hover effect properties
    hoverEffect: false,
    hoverEffectType: 'zoom',
    hoverIconColor: '',
    hoverBackgroundColor: '',
    hoverBorderColor: '',
    hoverTransitionDuration: '0.3s',
    
    // Responsive properties
    hideOnMobile: false,
    hideOnDesktop: false,
    
    // Accessibility properties
    ariaLabel: 'Social Media Links',
    role: 'navigation',
    tabIndex: 0,
    
    required: false,
    description: 'Social media links element'
  };
};

/**
 * Helper function to get social icon based on platform
 * @param platform Social media platform
 * @returns Icon name for the platform
 */
export const getSocialIconName = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return 'linkedin';
    case 'twitter':
      return 'twitter';
    case 'facebook':
      return 'facebook';
    case 'instagram':
      return 'instagram';
    case 'github':
      return 'github';
    case 'youtube':
      return 'youtube';
    case 'pinterest':
      return 'pinterest';
    case 'tiktok':
      return 'tiktok';
    case 'snapchat':
      return 'snapchat';
    case 'reddit':
      return 'reddit';
    default:
      return 'link';
  }
};

/**
 * Helper function to get social platform label
 * @param platform Social media platform
 * @returns Display label for the platform
 */
export const getSocialPlatformLabel = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return 'LinkedIn';
    case 'twitter':
      return 'Twitter';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'github':
      return 'GitHub';
    case 'youtube':
      return 'YouTube';
    case 'pinterest':
      return 'Pinterest';
    case 'tiktok':
      return 'TikTok';
    case 'snapchat':
      return 'Snapchat';
    case 'reddit':
      return 'Reddit';
    default:
      return platform;
  }
};

/**
 * Helper function to get default URL pattern for a platform
 * @param platform Social media platform
 * @returns Default URL pattern for the platform
 */
export const getDefaultUrlPattern = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return 'https://linkedin.com/in/username';
    case 'twitter':
      return 'https://twitter.com/username';
    case 'facebook':
      return 'https://facebook.com/username';
    case 'instagram':
      return 'https://instagram.com/username';
    case 'github':
      return 'https://github.com/username';
    case 'youtube':
      return 'https://youtube.com/c/channelname';
    case 'pinterest':
      return 'https://pinterest.com/username';
    case 'tiktok':
      return 'https://tiktok.com/@username';
    case 'snapchat':
      return 'https://snapchat.com/add/username';
    case 'reddit':
      return 'https://reddit.com/user/username';
    default:
      return 'https://';
  }
};

/**
 * Helper function to get social icon size in pixels
 * @param size Size category (sm, md, lg)
 * @returns Size in pixels
 */
export const getSocialIconSize = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return '1rem';
    case 'md':
      return '1.5rem';
    case 'lg':
      return '2rem';
    default:
      return '1.5rem';
  }
};
