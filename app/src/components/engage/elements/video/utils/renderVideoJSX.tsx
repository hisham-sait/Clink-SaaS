import React from 'react';
import { VideoElementData } from '../VideoElementData';
import { getVideoStyle, extractYouTubeVideoId, extractVimeoVideoId } from './defaultProperties';

/**
 * Get the video URL based on the element properties
 * @param element The video element data
 * @returns The video URL
 */
export const getVideoUrl = (element: VideoElementData): string => {
  // Extract video ID from URL if needed
  const videoId = element.videoId || (element.url ? (
    element.videoType === 'youtube' ? extractYouTubeVideoId(element.url) :
    element.videoType === 'vimeo' ? extractVimeoVideoId(element.url) : ''
  ) : '');
  
  // YouTube embed URL with parameters
  if (element.videoType === 'youtube' && videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${element.autoplay ? 1 : 0}&mute=${element.muted ? 1 : 0}&controls=${element.controls ? 1 : 0}&loop=${element.loop ? 1 : 0}${element.startTime ? `&start=${Math.floor(element.startTime)}` : ''}${element.endTime ? `&end=${Math.floor(element.endTime)}` : ''}`;
  }
  
  // Vimeo embed URL with parameters
  if (element.videoType === 'vimeo' && videoId) {
    return `https://player.vimeo.com/video/${videoId}?autoplay=${element.autoplay ? 1 : 0}&muted=${element.muted ? 1 : 0}&controls=${element.controls ? 1 : 0}&loop=${element.loop ? 1 : 0}`;
  }
  
  // Direct video URL
  return element.videoUrl || element.url || '';
};

/**
 * Render video element as React JSX (for canvas and preview)
 * @param element The video element data
 * @returns React JSX element
 */
export const renderVideoJSX = (element: VideoElementData): JSX.Element => {
  // Extract video ID from URL if needed
  const videoId = element.videoId || (element.url ? (
    element.videoType === 'youtube' ? extractYouTubeVideoId(element.url) :
    element.videoType === 'vimeo' ? extractVimeoVideoId(element.url) : ''
  ) : '');
  
  // Log video properties for debugging
  console.log('Rendering Video JSX:', {
    videoType: element.videoType,
    videoId,
    url: element.url,
    videoUrl: element.videoUrl,
    embedCode: element.embedCode
  });
  
  // Get base video style
  const baseVideoStyle = getVideoStyle(element);
  
  // Add responsive classes based on visibility settings
  let className = 'video-element';
  
  if (element.hideOnMobile) {
    className += ' d-none d-md-block hide-on-mobile'; // Bootstrap classes to hide on mobile
  }
  
  if (element.hideOnDesktop) {
    className += ' d-md-none hide-on-desktop'; // Bootstrap class to hide on desktop
  }
  
  // Add animation CSS if specified
  const containerStyle: React.CSSProperties = {
    ...baseVideoStyle
  };
  
  if (element.animation && element.animation !== 'none') {
    containerStyle.animation = `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}`;
  }
  
  // Background color
  if (element.backgroundColor && element.backgroundColor !== 'transparent') {
    containerStyle.backgroundColor = element.backgroundColor;
  }
  
  // Overlay styles
  const overlayStyle: React.CSSProperties = element.overlay ? {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: element.overlayColor || 'rgba(0,0,0,0.5)',
    opacity: element.overlayOpacity || 0.5,
    display: 'flex',
    alignItems: element.overlayTextPosition === 'top' ? 'flex-start' : 
                element.overlayTextPosition === 'bottom' ? 'flex-end' : 'center',
    justifyContent: 'center',
    padding: '1rem',
    color: element.overlayTextColor || '#ffffff',
    fontSize: element.overlayTextSize || '16px',
    textAlign: 'center',
    zIndex: 1
  } : {};
  
  // Caption styles
  const captionStyle: React.CSSProperties = {
    marginTop: element.captionPosition === 'bottom' ? '0.5rem' : 0,
    marginBottom: element.captionPosition === 'top' ? '0.5rem' : 0,
    fontSize: element.captionSize || '14px',
    color: element.captionColor || '#000000',
    textAlign: (element.captionAlignment || 'center') as any
  };
  
  // Render YouTube video
  const renderYouTubeVideo = () => {
    if (!videoId) return null;
    
    // YouTube embed URL with parameters
    const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${element.autoplay ? 1 : 0}&mute=${element.muted ? 1 : 0}&controls=${element.controls ? 1 : 0}&loop=${element.loop ? 1 : 0}${element.startTime ? `&start=${Math.floor(element.startTime)}` : ''}${element.endTime ? `&end=${Math.floor(element.endTime)}` : ''}`;
    
    return (
      <iframe 
        src={youtubeEmbedUrl}
        className="video-iframe"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        title={element.ariaLabel || 'YouTube video player'}
      />
    );
  };
  
  // Render Vimeo video
  const renderVimeoVideo = () => {
    if (!videoId) return null;
    
    // Vimeo embed URL with parameters
    const vimeoEmbedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${element.autoplay ? 1 : 0}&muted=${element.muted ? 1 : 0}&controls=${element.controls ? 1 : 0}&loop=${element.loop ? 1 : 0}`;
    
    return (
      <iframe 
        src={vimeoEmbedUrl}
        className="video-iframe"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        title={element.ariaLabel || 'Vimeo video player'}
      />
    );
  };
  
  // Render HTML5 video
  const renderHTML5Video = () => {
    const videoUrl = element.videoUrl || element.url || '';
    if (!videoUrl) return null;
    
    return (
      <video
        className="video-player"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: element.objectFit || 'contain'
        }}
        controls={element.controls}
        autoPlay={element.autoplay}
        loop={element.loop}
        muted={element.muted}
        poster={element.posterImage || undefined}
        preload={element.preload || 'metadata'}
        aria-label={element.ariaLabel || 'Video player'}
      >
        <source src={videoUrl} type="video/mp4" />
        {element.captions && (
          <track 
            kind="captions" 
            src={element.captions} 
            srcLang="en" 
            label="English" 
            default 
          />
        )}
        Your browser does not support the video tag.
      </video>
    );
  };
  
  // Render embed code
  const renderEmbedCode = () => {
    if (!element.embedCode) return null;
    
    // Extract src from embed code
    const srcMatch = element.embedCode.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    
    if (!src) return null;
    
    return (
      <iframe 
        src={src}
        className="video-iframe"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        title={element.ariaLabel || 'Embedded video player'}
      />
    );
  };
  
  // Render the video with optional overlay and caption
  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Caption (if position is top) */}
      {element.showCaption && element.captionPosition === 'top' && element.caption && (
        <div className="video-caption" style={captionStyle}>
          {element.caption}
        </div>
      )}
      
      {/* Video container */}
      <div className="video-container" style={containerStyle}>
        {element.videoType === 'youtube' ? renderYouTubeVideo() :
         element.videoType === 'vimeo' ? renderVimeoVideo() :
         element.videoType === 'embed' && element.embedCode ? renderEmbedCode() :
         renderHTML5Video()}
        
        {/* Overlay (if enabled) */}
        {element.overlay && (
          <div className="video-overlay" style={overlayStyle}>
            {element.overlayText}
          </div>
        )}
      </div>
      
      {/* Caption (if position is bottom) */}
      {element.showCaption && element.captionPosition === 'bottom' && element.caption && (
        <div className="video-caption" style={captionStyle}>
          {element.caption}
        </div>
      )}
    </div>
  );
};
