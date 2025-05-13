import React, { useEffect, useState } from 'react';
import { VideoElementData } from '../VideoElementData';
import { videoStyles as styles } from '../../shared';
import { renderVideoJSX, getVideoUrl } from '../utils/renderVideoJSX';

interface VideoPreviewProps {
  element: VideoElementData;
  showTitle?: boolean;
}

/**
 * Video preview component
 * Shows a live preview of the video with all applied styles and effects
 */
const VideoPreview: React.FC<VideoPreviewProps> = ({ element, showTitle = true }) => {
  const [key, setKey] = useState<number>(Date.now());
  
  // Force re-render when video properties change
  useEffect(() => {
    setKey(Date.now());
  }, [element.videoType, element.videoId, element.url, element.videoUrl]);
  
  // Get the video URL
  const videoUrl = getVideoUrl(element);
  
  // Check if we have a valid video source
  const hasVideoSource = Boolean(
    (element.videoType === 'youtube' && element.videoId) ||
    (element.videoType === 'vimeo' && element.videoId) ||
    element.videoUrl ||
    element.url
  );
  
  // Log video properties for debugging
  useEffect(() => {
    console.log('Video Preview Properties:', {
      videoType: element.videoType,
      videoId: element.videoId,
      url: element.url,
      videoUrl: element.videoUrl,
      hasVideoSource
    });
  }, [element.videoType, element.videoId, element.url, element.videoUrl, hasVideoSource]);
  
  return (
    <div style={styles.previewContainer} data-testid="video-preview">
      {showTitle && (
        <div style={styles.previewLabel}>Video Preview</div>
      )}
      
      {hasVideoSource ? (
        <div style={styles.videoPreview} key={key}>
          {renderVideoJSX(element)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          <p>No video source provided.</p>
          <p>Please add a video URL or select a video file.</p>
        </div>
      )}
      
      {element.caption && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
          Caption: {element.caption}
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
