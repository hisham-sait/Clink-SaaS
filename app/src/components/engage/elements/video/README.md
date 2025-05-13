# Video Element

The Video Element allows users to add and customize video content on their pages. It supports various video sources including direct URLs, YouTube, Vimeo, and embedded videos.

## Features

- Support for multiple video sources (direct URL, YouTube, Vimeo, embed)
- Customizable playback controls (autoplay, loop, muted, controls)
- Responsive design with mobile-specific settings
- Extensive styling options (borders, shadows, effects)
- Visual effects (opacity, brightness, contrast, etc.)
- Overlay capabilities with customizable text
- Animation effects
- Accessibility features (ARIA attributes, transcript)
- Caption support

## Properties

### Content Properties

- **Video Type**: Type of video source (URL, YouTube, Vimeo, embed)
- **Video URL**: URL to the video file or platform
- **Video ID**: Automatically extracted ID for YouTube/Vimeo videos
- **Poster Image**: Image to display before the video plays
- **Captions**: URL to a captions file
- **Caption Text**: Text to display below the video
- **Caption Position**: Position of the caption (top/bottom)

### Playback Properties

- **Controls**: Show/hide video controls
- **Autoplay**: Automatically play the video when loaded
- **Loop**: Continuously loop the video
- **Muted**: Play the video without sound
- **Preload**: How the video should be preloaded
- **Start Time**: Time to start playing the video (in seconds)
- **End Time**: Time to end playing the video (in seconds)

### Layout Properties

- **Width**: Width of the video
- **Height**: Height of the video
- **Aspect Ratio**: Predefined aspect ratios (16:9, 4:3, 1:1, custom)
- **Object Fit**: How the video should fit within its container
- **Alignment**: Horizontal alignment of the video
- **Margin**: Space around the video
- **Padding**: Space inside the video container

### Styling Properties

- **Background Color**: Color behind the video
- **Border Style**: Style of the border (none, solid, dashed, etc.)
- **Border Width**: Width of the border
- **Border Color**: Color of the border
- **Border Radius**: Rounded corners for the video
- **Box Shadow**: Shadow effect for the video

### Effect Properties

- **Opacity**: Transparency of the video
- **Brightness**: Brightness adjustment
- **Contrast**: Contrast adjustment
- **Saturation**: Color saturation adjustment
- **Hue Rotate**: Color hue rotation
- **Blur**: Blur effect
- **Grayscale**: Grayscale effect
- **Sepia**: Sepia effect

### Overlay Properties

- **Overlay**: Show/hide an overlay on the video
- **Overlay Color**: Color of the overlay
- **Overlay Opacity**: Transparency of the overlay
- **Overlay Text**: Text to display on the overlay
- **Overlay Text Color**: Color of the overlay text
- **Overlay Text Size**: Size of the overlay text
- **Overlay Text Position**: Position of the overlay text

### Animation Properties

- **Animation**: Type of animation effect
- **Animation Duration**: Duration of the animation
- **Animation Delay**: Delay before the animation starts
- **Animation Easing**: Timing function for the animation

### Responsive Properties

- **Hide on Mobile**: Hide the video on mobile devices
- **Hide on Desktop**: Hide the video on desktop devices
- **Mobile Width**: Width on mobile devices
- **Mobile Height**: Height on mobile devices

### Accessibility Properties

- **ARIA Label**: Accessible label for screen readers
- **Role**: ARIA role attribute
- **Tab Index**: Tab order for keyboard navigation
- **Transcript**: Text transcript of the video content

## Usage

1. Add a Video Element to your page
2. Configure the video source and playback options
3. Customize the appearance and layout
4. Add effects, animations, and overlay if desired
5. Ensure accessibility by adding proper labels and transcript

## Best Practices

- Use responsive dimensions (%, vw, vh) for better mobile compatibility
- Provide captions or subtitles for accessibility
- Include a transcript for screen reader users
- Avoid autoplay with sound to prevent user annoyance
- Optimize video files for web delivery
- Consider using different aspect ratios for mobile and desktop
- Test your video on different devices and screen sizes
