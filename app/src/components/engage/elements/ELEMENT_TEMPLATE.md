# [Element Name] Element Component

This folder contains all components related to the [Element Name] Element in the Engage module. The [Element Name] Element allows users to add and customize [element description] on their pages with a comprehensive set of styling, effects, and formatting options.

## Component Architecture

The [Element Name] Element follows a modular architecture with clear separation of concerns:

1. **Core Components**:
   - `[ElementName]Element.tsx`: Lightweight component for the element palette that users can click to add an element
   - `[ElementName]ElementProperties.tsx`: Container component that organizes all property sections
   - `[ElementName]ElementData.ts`: TypeScript interface defining the data structure for the element

2. **Section-Based Organization**:
   - Each aspect of element styling is contained in its own section component
   - All sections are organized as collapsible accordions for a clean, organized UI
   - Each section focuses on a specific set of related properties
   - All sections are collapsed by default for a cleaner initial view

3. **Shared Components**:
   - Reusable UI components like `ColorInput` and `DimensionInput` are imported from the shared directory
   - `CollapsibleSection` with smooth height-based animations is imported from the shared directory
   - These shared components are used across all element types (button, text, image, etc.)

4. **Rendering System**:
   - `render[ElementName]JSX.tsx`: Renders elements as React JSX for the canvas and preview
   - `render[ElementName]EJS.ts`: Generates EJS template code for server-side rendering

## Folder Structure

- `index.ts`: Entry point that exports all components and utilities
- `[ElementName]Element.tsx`: Main component for the element palette
- `[ElementName]ElementData.ts`: Type definitions for element data
- `[ElementName]ElementProperties.tsx`: Container for all property panels
- `styles.ts`: Element styles that use the shared style system
- `animations.css`: CSS animations for the element (if needed)

### Subfolders

- **utils/**: Utility functions
  - `defaultProperties.ts`: Default properties for the element and helper functions
  - `render[ElementName]JSX.tsx`: JSX rendering for React components
  - `render[ElementName]EJS.ts`: EJS template generation for server-side rendering

- **sections/**: Property section components
  - `ContentProperties.tsx`: Element-specific content properties
  - `Styling.tsx`: Style, variant, size, and colors
  - `Layout.tsx`: Width, height, alignment, border, and spacing
  - `Effects.tsx`: Shadow and filter properties
  - `Animation.tsx`: Animation properties
  - `Responsive.tsx`: Mobile/desktop visibility settings
  - `Accessibility.tsx`: ARIA attributes and accessibility properties
  - `[ElementName]Preview.tsx`: Enhanced preview component showing all styling effects

### Shared Components

The shared components used by this element are located in the shared directory:

- **shared/components/**: Shared components used across all elements
  - `CollapsibleSection.tsx`: Collapsible section with smooth animations
  - `ColorInput.tsx`: Color picker with hex/rgba support
  - `DimensionInput.tsx`: Dimension input with unit selector (px, em, rem, %)

## Features

### Content Properties
- **[Feature 1]**: [Description]
- **[Feature 2]**: [Description]
- **[Feature 3]**: [Description]

### Styling
- **[Feature 1]**: [Description]
- **[Feature 2]**: [Description]
- **[Feature 3]**: [Description]

### Layout
- **Size**: Width and height controls with unit selection
- **Border**: Customizable border width, style, color, and radius
- **Spacing**: Margin and padding controls

### Effects
- **Shadow**: Box shadow with color, blur, spread, and offset controls
- **[Other Effects]**: [Description]

### Animation
- **Animation Types**: Fade, slide, bounce, zoom, flip, rotate, and pulse animations
- **Timing**: Duration, delay, and easing function controls
- **Hover Effects**: Special effects when hovering over the element

### Responsive
- **Visibility**: Show/hide on different device sizes with reliable CSS classes
- **Mobile Settings**: Different size settings for mobile devices

### Accessibility
- **ARIA Label**: Descriptive text for screen readers
- **Role**: Define the element's role for assistive technologies
- **Tab Index**: Control keyboard navigation order

## Animation System

The [Element Name] Element uses a sophisticated animation system:

1. **Height-Based Animation for UI**:
   - Uses actual content height instead of arbitrary max-height
   - Two-phase animation for smooth transitions
   - Cubic bezier timing function for natural motion

2. **CSS Keyframes for Element Effects**:
   - Predefined animations: fade, slide, bounce, zoom, flip, rotate, and pulse
   - Customizable duration, delay, and easing
   - Smooth transitions for hover effects

3. **Implementation Details**:
   - Uses React's useRef to measure actual content height for UI animations
   - Generates proper CSS animation properties for animations
   - Handles both client-side (React) and server-side (EJS) rendering

## Responsive Design

The [Element Name] Element has robust responsive capabilities:

1. **Visibility Controls**:
   - Hide on mobile devices (screen width < 768px)
   - Hide on desktop devices (screen width >= 769px)
   - CSS classes with !important flags for reliable behavior

2. **Mobile-Specific Styling**:
   - Different width and height settings for mobile devices
   - Media queries automatically applied in both JSX and EJS renderers
   - Proper inheritance of other styling properties

## Server-Side Rendering

The [Element Name] Element supports server-side rendering through EJS templates:

1. **Template Structure**:
   - Modular EJS partials for each element type
   - Clean separation of concerns
   - Efficient rendering with minimal duplication

2. **Implementation**:
   - `render[ElementName]EJS.ts` generates EJS template code
   - Proper escaping of values for security
   - Consistent styling between client and server rendering

## Usage

### Adding to a Page

```tsx
import { [ElementName]Element } from 'app/src/components/engage/elements/[element-name]';

// In your component
<[ElementName]Element onAdd={handleAddElement} />
```

### Rendering Properties Panel

```tsx
import { [ElementName]ElementProperties } from 'app/src/components/engage/elements/[element-name]';
import { [ElementName]ElementData } from 'app/src/components/engage/elements/[element-name]/[ElementName]ElementData';

// In your component
const handleChange = (updatedElement) => {
  // Update element properties
};

<[ElementName]ElementProperties element={element as [ElementName]ElementData} onChange={handleChange} />
```

### Using Individual Sections

You can also use individual sections if needed:

```tsx
import { ContentProperties, Styling, Layout } from 'app/src/components/engage/elements/[element-name]';

// In your component
<ContentProperties element={element} onChange={handleChange} />
<Styling element={element} onChange={handleChange} />
<Layout element={element} onChange={handleChange} />
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
3. **Styling**: Use the shared styles from the shared directory for consistency. Import the appropriate style set in your `styles.ts` file.
4. **Type Safety**: Ensure all components are properly typed using TypeScript.
5. **Performance**: Be mindful of performance, especially for components that render frequently.
6. **Accessibility**: Ensure all components are accessible and follow WCAG guidelines.
7. **Animation**: Use the height-based animation approach for consistent animations.
8. **Rendering**: Maintain consistency between JSX and EJS rendering.
9. **Shared Components**: Use the shared components from the shared directory for consistency across elements.

## Adding New Features

When adding new features to the [Element Name] Element:

1. Determine which section the feature belongs to
2. Add the necessary UI components to the appropriate section
3. Update the [ElementName]ElementData interface if needed
4. Add any utility functions to the utils folder
5. Update the default properties in defaultProperties.ts
6. Add the feature to the [ElementName]Preview component if it affects visual appearance
7. Update both render[ElementName]JSX.tsx and render[ElementName]EJS.ts for consistent rendering
8. If creating new reusable components, consider adding them to the shared directory

## Troubleshooting

Common issues:

- **Properties not updating**: Ensure the onChange handler is properly updating the element state
- **Sections not expanding**: Check the CollapsibleSection component and its state management
- **Styles not applying**: Verify the style objects are being properly passed to components
- **Animation issues**: Check that the height calculation in CollapsibleSection is working correctly
- **Preview not showing changes**: Ensure the [ElementName]Preview component is receiving updated props
- **Responsive behavior not working**: Check the CSS classes and media queries in both JSX and EJS renderers
- **Hover effects not working**: Check the CSS generation in both JSX and EJS renderers

## Implementation Steps

When implementing a new element, follow these steps:

1. **Create the Core Files**:
   - Create the element directory: `app/src/components/engage/elements/[element-name]/`
   - Create the core files: `[ElementName]Element.tsx`, `[ElementName]ElementData.ts`, `[ElementName]ElementProperties.tsx`
   - Create the `styles.ts` file that imports the appropriate styles from the shared directory
   - Create the `index.ts` file to export all components and utilities

2. **Create the Utility Functions**:
   - Create the utils directory: `app/src/components/engage/elements/[element-name]/utils/`
   - Create the utility files: `defaultProperties.ts`, `render[ElementName]JSX.tsx`, `render[ElementName]EJS.ts`

3. **Create the Section Components**:
   - Create the sections directory: `app/src/components/engage/elements/[element-name]/sections/`
   - Create the section files: `ContentProperties.tsx`, `Styling.tsx`, `Layout.tsx`, etc.
   - Create the preview component: `[ElementName]Preview.tsx`

4. **Import Shared Components and Styles**:
   - Import the shared components from the shared directory in your section components
   - Import the appropriate style set from the shared directory in your `styles.ts` file
   - Use the shared components and styles consistently across all sections

5. **Update the Element Registry**:
   - Add the new element to the element registry in `app/src/components/engage/elements/index.ts`
   - Export the element's properties and data types

6. **Create Server-Side Templates**:
   - Create the EJS template file: `api/views/partials/elements/[element-name].ejs`
   - Ensure consistent styling between client and server rendering

7. **Add Documentation**:
   - Create a README.md file for the element
   - Document all features, properties, and usage examples

8. **Test the Element**:
   - Test the element in the page designer
   - Verify all properties work as expected
   - Test responsive behavior
   - Test server-side rendering

## Using Shared Styles

The element should use the shared styles system for consistency across all elements:

```typescript
// In your styles.ts file
import { textStyles } from '../shared';

// Export the text element styles
export const styles = textStyles;
```

Depending on your element type, you can import one of the following style sets:

- `baseStyles`: Common styles used by all elements
- `textStyles`: Text element specific styles
- `imageStyles`: Image element specific styles
- `videoStyles`: Video element specific styles
- `buttonStyles`: Button element specific styles

If your element needs custom styles that aren't covered by the existing style sets, you can extend the appropriate style set:

```typescript
import { baseStyles, PreviewStyles } from '../shared';

// Define your custom styles interface
export interface CustomElementStyles extends BaseStyles, PreviewStyles {
  customProperty1: CSSProperties;
  customProperty2: CSSProperties;
}

// Create your custom styles
export const styles: CustomElementStyles = {
  ...baseStyles,
  ...previewStyles,
  customProperty1: {
    // Custom styles here
  },
  customProperty2: {
    // Custom styles here
  }
};
```

For more information about the shared styles system, see the README.md file in the shared directory.
