# Image Element Component

This folder contains all components related to the Image Element in the Engage module. The Image Element allows users to add and customize images on their pages with a comprehensive set of styling, effects, and formatting options.

## Component Architecture

The Image Element follows a modular architecture with clear separation of concerns:

1. **Core Components**:
   - `ImageElement.tsx`: Lightweight component for the element palette that users can click to add an image element
   - `ImageElementProperties.tsx`: Container component that organizes all property sections
   - `ImageElementData.ts`: TypeScript interface defining the data structure for image elements

2. **Section-Based Organization**:
   - Each aspect of image styling is contained in its own section component
   - All sections are organized as collapsible accordions for a clean, organized UI
   - Each section focuses on a specific set of related properties
   - All sections are collapsed by default for a cleaner initial view

3. **Shared Components**:
   - Reusable UI components like `ColorInput` and `DimensionInput` are now in the shared directory
   - `CollapsibleSection` with smooth height-based animations is now in the shared directory
   - These shared components are used across all element types (button, text, image, etc.)

4. **Rendering System**:
   - `renderImageJSX.tsx`: Renders image elements as React JSX for the canvas and preview
   - `renderImage.ts`: Contains shared rendering logic and style generation
   - `renderImageEJS.ts`: Generates EJS template code for server-side rendering

## Folder Structure

- `index.ts`: Entry point that exports all components and utilities
- `ImageElement.tsx`: Main component for the element palette
- `ImageElementData.ts`: Type definitions for image element data
- `ImageElementProperties.tsx`: Container for all property panels
- `styles.ts`: Shared styles for image element components

### Subfolders

- **utils/**: Utility functions
  - `defaultProperties.ts`: Default properties for image elements and helper functions
  - `renderImage.ts`: Shared rendering logic for generating styles
  - `renderImageJSX.tsx`: JSX rendering for React components
  - `renderImageEJS.ts`: EJS template generation for server-side rendering

- **sections/**: Property section components
  - `ContentProperties.tsx`: Image source, alt text, and caption
  - `Layout.tsx`: Size, alignment, and object fit properties
  - `Styling.tsx`: Border, background, and shadow properties
  - `Effects.tsx`: Filters and overlay properties
  - `Animation.tsx`: Animation properties
  - `Responsive.tsx`: Mobile/desktop visibility settings
  - `Accessibility.tsx`: ARIA attributes and accessibility properties
  - `ImagePreview.tsx`: Enhanced preview component showing all styling effects

### Shared Components

The shared components used by this element are now located in the shared directory:

- **shared/components/**: Shared components used across all elements
  - `CollapsibleSection.tsx`: Collapsible section with smooth animations
  - `ColorInput.tsx`: Color picker with hex/rgba support
  - `DimensionInput.tsx`: Dimension input with unit selector (px, em, rem, %)

## Features

### Content Properties
- **Image Source**: Upload or select images from the media library
- **Alt Text**: Accessibility text for screen readers
- **Caption**: Optional caption text displayed below the image

### Layout
- **Size**: Width and height controls with unit selection
- **Object Fit**: Cover, contain, fill, scale-down, and none options
- **Alignment**: Left, center, and right alignment options
- **Spacing**: Margin and padding controls

### Styling
- **Border**: Customizable border width, style, color, and radius
- **Background**: Solid color, gradient, or transparent background options
- **Shadow**: Box shadow with color, blur, spread, and offset controls

### Effects
- **Filters**: Brightness, contrast, saturation, hue-rotate, blur, grayscale, sepia, and opacity
- **Overlay**: Customizable overlay with color, opacity, text, and position options

### Animation
- **Animation Types**: Fade, slide, bounce, zoom, flip, rotate, and pulse animations
- **Timing**: Duration, delay, and easing function controls
- **Hover Effects**: Special effects when hovering over the image (zoom, brighten, darken, blur, grayscale, sepia, shadow)

### Responsive
- **Visibility**: Show/hide on different device sizes with reliable CSS classes
- **Mobile Settings**: Different size settings for mobile devices
- **Lightbox**: Option to open image in a lightbox when clicked

### Accessibility
- **Alt Text**: Descriptive text for screen readers
- **ARIA Attributes**: Role, label, and description settings
- **Tab Index**: Control keyboard navigation order

## Animation System

The Image Element uses a sophisticated animation system:

1. **Height-Based Animation for UI**:
   - Uses actual content height instead of arbitrary max-height
   - Two-phase animation for smooth transitions
   - Cubic bezier timing function for natural motion

2. **CSS Keyframes for Image Effects**:
   - Predefined animations: fade, slide, bounce, zoom, flip, rotate, and pulse
   - Customizable duration, delay, and easing
   - Smooth transitions for hover effects

3. **Implementation Details**:
   - Uses React's useRef to measure actual content height for UI animations
   - Generates proper CSS animation properties for image animations
   - Handles both client-side (React) and server-side (EJS) rendering

## Lightbox Functionality

The Image Element includes a built-in lightbox feature:

1. **User Experience**:
   - Click on an image to open it in a full-screen lightbox
   - Lightbox displays the image at optimal size
   - Optional caption displayed at the bottom
   - Click anywhere to close the lightbox

2. **Implementation**:
   - Dynamic creation of lightbox overlay
   - Proper z-index management for stacking
   - Responsive design that works on all screen sizes
   - Implemented in both JSX (React) and EJS (server-side) renderers

## Responsive Design

The Image Element has robust responsive capabilities:

1. **Visibility Controls**:
   - Hide on mobile devices (screen width < 768px)
   - Hide on desktop devices (screen width >= 769px)
   - CSS classes with !important flags for reliable behavior

2. **Mobile-Specific Styling**:
   - Different width and height settings for mobile devices
   - Media queries automatically applied in both JSX and EJS renderers
   - Proper inheritance of other styling properties

## Server-Side Rendering

The Image Element supports server-side rendering through EJS templates:

1. **Template Structure**:
   - Modular EJS partials for each element type
   - Clean separation of concerns
   - Efficient rendering with minimal duplication

2. **Implementation**:
   - `renderImageEJS.ts` generates EJS template code
   - Proper escaping of values for security
   - Consistent styling between client and server rendering

## Usage

### Adding to a Page

```tsx
import { ImageElement } from 'app/src/components/engage/elements/image';

// In your component
<ImageElement onAdd={handleAddElement} />
```

### Rendering Properties Panel

```tsx
import { ImageElementProperties } from 'app/src/components/engage/elements/image';
import { ImageElementData } from 'app/src/components/engage/elements/image/ImageElementData';

// In your component
const handleChange = (updatedElement) => {
  // Update element properties
};

<ImageElementProperties element={element as ImageElementData} onChange={handleChange} companyId="1" />
```

### Using Individual Sections

You can also use individual sections if needed:

```tsx
import { ContentProperties, Layout, Styling } from 'app/src/components/engage/elements/image';

// In your component
<ContentProperties element={element} onChange={handleChange} companyId="1" />
<Layout element={element} onChange={handleChange} />
<Styling element={element} onChange={handleChange} />
```

### Using Shared Components

The shared components can be imported from the shared directory:

```tsx
import { CollapsibleSection, ColorInput, DimensionInput } from 'app/src/components/engage/elements/shared/components';

// In your component
<CollapsibleSection title="My Section">
  <ColorInput name="color" value="#ff0000" onChange={handleChange} />
  <DimensionInput name="width" value="100px" onChange={handleChange} />
</CollapsibleSection>
```

## Integration with Media Browser

The Image Element integrates with the MediaBrowser component to allow users to select images from the media library:

```tsx
import MediaBrowser from 'app/src/components/common/MediaBrowser';

// In your component
const [showMediaBrowser, setShowMediaBrowser] = useState(false);

const handleMediaSelect = (media) => {
  // Update image source and related properties
};

<MediaBrowser
  show={showMediaBrowser}
  onHide={() => setShowMediaBrowser(false)}
  onSelect={handleMediaSelect}
  companyId={companyId}
  section="pages"
  allowedTypes={['IMAGE']}
  title="Select Image"
/>
```

## Development Guidelines

1. **Component Responsibility**: Each component should have a single responsibility.
2. **State Management**: Use React hooks for state management within components.
3. **Styling**: Use the shared styles from `styles.ts` for consistency.
4. **Type Safety**: Ensure all components are properly typed using TypeScript.
5. **Performance**: Be mindful of performance, especially for components that render frequently.
6. **Accessibility**: Ensure all components are accessible and follow WCAG guidelines.
7. **Animation**: Use the height-based animation approach for consistent animations.
8. **Rendering**: Maintain consistency between JSX and EJS rendering.
9. **Shared Components**: Use the shared components from the shared directory for consistency across elements.

## Adding New Features

When adding new features to the Image Element:

1. Determine which section the feature belongs to
2. Add the necessary UI components to the appropriate section
3. Update the ImageElementData interface if needed
4. Add any utility functions to the utils folder
5. Update the default properties in defaultProperties.ts
6. Add the feature to the ImagePreview component if it affects visual appearance
7. Update both renderImageJSX.tsx and renderImageEJS.ts for consistent rendering
8. If creating new reusable components, consider adding them to the shared directory

## Troubleshooting

Common issues:

- **Properties not updating**: Ensure the onChange handler is properly updating the element state
- **Sections not expanding**: Check the CollapsibleSection component and its state management
- **Styles not applying**: Verify the style objects are being properly passed to components
- **Animation issues**: Check that the height calculation in CollapsibleSection is working correctly
- **Preview not showing changes**: Ensure the ImagePreview component is receiving updated props
- **Media selection not working**: Verify the MediaBrowser integration and event handling
- **Responsive behavior not working**: Check the CSS classes and media queries in both JSX and EJS renderers
- **Lightbox not functioning**: Verify the click handlers and DOM manipulation code
- **Hover effects not working**: Check the CSS generation in both JSX and EJS renderers

## Recent Improvements

Recent updates to the Image Element include:

1. **Enhanced Responsive Behavior**:
   - More reliable show/hide functionality for different device sizes
   - Improved mobile-specific styling with proper media queries
   - Better CSS class management for consistent behavior

2. **Lightbox Functionality**:
   - Added full-screen lightbox feature for image viewing
   - Support for captions in lightbox view
   - Smooth transitions and proper z-index management

3. **Improved Hover Effects**:
   - Added multiple hover effect types (zoom, brighten, darken, etc.)
   - Better CSS generation for consistent behavior
   - Support in both JSX and EJS renderers

4. **Animation Enhancements**:
   - Added keyframe animations for various effects
   - Improved timing and easing options
   - Better integration with other styling properties

5. **Server-Side Rendering Improvements**:
   - Modular EJS templates for better maintainability
   - Consistent styling between client and server rendering
   - Better performance through optimized template structure

6. **Shared Components**:
   - Moved shared components to the shared directory for better code reuse
   - Standardized component interfaces for consistency
   - Improved accessibility and usability across all elements
