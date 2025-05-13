# Shared Element Styles

This directory contains shared styles, components, and utilities that are used across all element types in the Engage module.

## Element Styles

The `elementStyles.ts` file provides a centralized location for all element-specific styles. This approach offers several benefits:

- **Consistency**: All elements use the same base styles, ensuring a consistent look and feel.
- **Maintainability**: Style changes can be made in one place and will be reflected across all elements.
- **Type Safety**: TypeScript interfaces ensure that all required styles are properly defined.
- **Extensibility**: New element types can easily adopt the existing style system.

### Usage

To use the shared styles in an element:

```typescript
import { textStyles } from '../shared';

// Export the text element styles
export const styles = textStyles;
```

### Available Style Sets

- `baseStyles`: Common styles used by all elements
- `previewStyles`: Styles for preview containers
- `textStyles`: Text element specific styles
- `imageStyles`: Image element specific styles
- `videoStyles`: Video element specific styles
- `buttonStyles`: Button element specific styles

### Helper Function

The `getElementStyles` function can be used to dynamically get the appropriate styles for an element type:

```typescript
import { getElementStyles } from '../shared';

const styles = getElementStyles('text'); // Returns textStyles
```

## Type Definitions

The following TypeScript interfaces are available:

- `BaseStyles`: Common styles used by all elements
- `PreviewStyles`: Styles for preview containers
- `TextElementStyles`: Text element specific styles
- `ImageElementStyles`: Image element specific styles
- `VideoElementStyles`: Video element specific styles
- `ButtonElementStyles`: Button element specific styles

## Shared Components

The `components` directory contains reusable UI components that are used across multiple elements:

- `CollapsibleSection`: A collapsible section with a header and content
- `ColorInput`: A color input with a color picker and text input
- `DimensionInput`: An input for dimensions with value and unit selection

## Utilities

The following utility files are available:

- `styleUtils.ts`: Utilities for working with styles
- `animationUtils.ts`: Utilities for animations
- `responsiveUtils.ts`: Utilities for responsive design
- `accessibilityUtils.ts`: Utilities for accessibility features
