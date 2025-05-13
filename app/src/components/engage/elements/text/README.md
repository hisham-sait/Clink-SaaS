# Text Element Component

This folder contains all components related to the Text Element in the Engage module. The Text Element allows users to add and customize text content (headings, paragraphs, and lists) on their pages with a comprehensive set of styling and formatting options.

## Component Architecture

The Text Element follows a modular architecture with clear separation of concerns:

1. **Core Components**:
   - `TextElement.tsx`: Lightweight component for the element palette that users can click to add a text element
   - `TextElementProperties.tsx`: Container component that organizes all property sections
   - `TextElementData.ts`: TypeScript interface defining the data structure for text elements

2. **Section-Based Organization**:
   - Each aspect of text styling is contained in its own section component
   - Sections are collapsible for a clean, organized UI
   - Each section focuses on a specific set of related properties

3. **Shared Components**:
   - Reusable UI components like `ColorInput` and `DimensionInput` are now in the shared directory
   - `CollapsibleSection` with smooth height-based animations is now in the shared directory
   - These shared components are used across all element types (button, text, image, etc.)

## Folder Structure

- `index.ts`: Entry point that exports all components and utilities
- `TextElement.tsx`: Main component for the element palette
- `TextElementData.ts`: Type definitions for text element data
- `TextElementProperties.tsx`: Container for all property panels
- `styles.ts`: Shared styles for text element components

### Subfolders

- **utils/**: Utility functions
  - `defaultProperties.ts`: Default properties for text elements
  - `textShadowUtils.ts`: Utility functions for text shadows

- **sections/**: Property section components
  - `ContentProperties.tsx`: Text type and content (formerly BasicProperties)
  - `Typography.tsx`: Font family, size, weight, and basic typography
  - `AdvancedTypography.tsx`: Text shadows and advanced styling
  - `TextPreview.tsx`: Enhanced preview component showing all styling effects
  - `Styling.tsx`: Background, borders, spacing, etc.
  - `Animation.tsx`: Animation properties with keyframe support
  - `Responsive.tsx`: Mobile/desktop visibility settings
  - `Accessibility.tsx`: ARIA attributes and accessibility properties

### Shared Components

The shared components used by this element are now located in the shared directory:

- **shared/components/**: Shared components used across all elements
  - `CollapsibleSection.tsx`: Collapsible section with smooth animations
  - `ColorInput.tsx`: Color picker with hex/rgba support
  - `DimensionInput.tsx`: Dimension input with unit selector (px, em, rem, %)

## Features

### Content Properties
- **Text Types**: Support for headings, paragraphs, and lists
- **Content Editing**: Multi-line text area with type-specific placeholders
- **List Handling**: Automatic conversion of line-separated items to lists

### Typography
- **Font Selection**: Choose from a wide range of web-safe and Google fonts
- **Basic Typography**: Control size, weight, style, line height, and letter spacing
- **Text Alignment**: Left, center, right, and justified alignment options
- **Text Decoration**: Underline, overline, line-through, and none options
- **Text Transform**: Uppercase, lowercase, capitalize, and none options

### Advanced Typography
- **Text Shadows**: Customizable shadows with color, blur, and offset controls
- **Shadow Presets**: Quick selection between none and custom shadow options
- **Live Preview**: Real-time preview of shadow effects

### Styling
- **Background**: Solid color, gradient, or transparent background options
- **Borders**: Customizable border width, style, color, and radius
- **Spacing**: Margin and padding controls with individual side settings
- **Opacity**: Transparency control for the entire element

### Animation
- **Animation Types**: Fade, slide, zoom, and bounce animations
- **Timing**: Duration, delay, and easing function controls
- **Direction**: Control animation direction and iteration count
- **Preview**: Live preview of animation effects

### Responsive
- **Visibility**: Show/hide on different device sizes
- **Responsive Typography**: Different text sizes for mobile and desktop
- **Breakpoints**: Control at which screen sizes changes take effect

### Accessibility
- **ARIA Attributes**: Role, label, and description settings
- **Semantic HTML**: Proper heading levels and semantic markup
- **Focus States**: Customizable focus indicators
- **Screen Reader Text**: Additional text visible only to screen readers

## Animation System

The Text Element uses a sophisticated animation system for collapsible sections:

1. **Height-Based Animation**:
   - Uses actual content height instead of arbitrary max-height
   - Two-phase animation for smooth transitions
   - Cubic bezier timing function for natural motion

2. **Implementation Details**:
   - Uses React's useRef to measure actual content height
   - Sets exact pixel height during animation
   - Transitions to 'auto' height after animation completes
   - Handles content changes gracefully

## Usage

### Adding to a Page

```tsx
import { TextElement } from 'app/src/components/engage/elements/text';

// In your component
<TextElement onAdd={handleAddElement} />
```

### Rendering Properties Panel

```tsx
import { TextElementProperties } from 'app/src/components/engage/elements/text';
import { TextElementData } from 'app/src/components/engage/elements/text/TextElementData';

// In your component
const handleChange = (e) => {
  // Update element properties
};

<TextElementProperties element={element as TextElementData} onChange={handleChange} />
```

### Using Individual Sections

You can also use individual sections if needed:

```tsx
import { Typography, ContentProperties } from 'app/src/components/engage/elements/text';

// In your component
<Typography element={element} onChange={handleChange} />
<ContentProperties element={element} onChange={handleChange} />
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

## Development Guidelines

1. **Component Responsibility**: Each component should have a single responsibility.
2. **State Management**: Use React hooks for state management within components.
3. **Styling**: Use the shared styles from `styles.ts` for consistency.
4. **Type Safety**: Ensure all components are properly typed using TypeScript.
5. **Performance**: Be mindful of performance, especially for components that render frequently.
6. **Accessibility**: Ensure all components are accessible and follow WCAG guidelines.
7. **Animation**: Use the height-based animation approach for consistent animations.
8. **Shared Components**: Use the shared components from the shared directory for consistency across elements.

## Adding New Features

When adding new features to the Text Element:

1. Determine which section the feature belongs to
2. Add the necessary UI components to the appropriate section
3. Update the TextElementData interface if needed
4. Add any utility functions to the utils folder
5. Update the default properties in defaultProperties.ts
6. Add the feature to the TextPreview component if it affects visual appearance
7. If creating new reusable components, consider adding them to the shared directory

## Troubleshooting

Common issues:

- **Properties not updating**: Ensure the onChange handler is properly updating the element state
- **Sections not expanding**: Check the CollapsibleSection component and its state management
- **Styles not applying**: Verify the style objects are being properly passed to components
- **Animation issues**: Check that the height calculation in CollapsibleSection is working correctly
- **Preview not showing changes**: Ensure the TextPreview component is receiving updated props

## Recent Improvements

- **Renamed BasicProperties to ContentProperties** for clarity and to avoid confusion with the metadata properties
- **Enhanced animation system** for smooth transitions when expanding/collapsing sections
- **Added comprehensive TextPreview component** that shows all styling effects in one place
- **Improved organization** with clear separation between different types of properties
- **Fixed animation issues** in all collapsible sections throughout the application
- **Moved shared components to the shared directory** for better code reuse across elements
