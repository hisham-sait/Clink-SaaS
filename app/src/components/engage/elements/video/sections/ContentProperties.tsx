import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaVideo, FaYoutube, FaVimeo } from 'react-icons/fa';
import { VideoElementData } from '../VideoElementData';
import { videoStyles as styles } from '../../shared';
import { extractYouTubeVideoId, extractVimeoVideoId } from '../utils/defaultProperties';

interface ContentPropertiesProps {
  element: VideoElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for video elements
 * Handles video source, type, and playback options
 */
const ContentProperties: React.FC<ContentPropertiesProps> = ({ element, onChange, companyId }) => {
  const [videoUrl, setVideoUrl] = useState(element.url || '');
  const [embedCode, setEmbedCode] = useState(element.embedCode || '');
  
  // Initialize videoUrl from element when it changes
  useEffect(() => {
    setVideoUrl(element.url || '');
    setEmbedCode(element.embedCode || '');
  }, [element.url, element.embedCode]);
  
  // Handle direct element update
  const updateElement = (updates: Partial<VideoElementData>) => {
    // Create a deep copy of the element
    const updatedElement = JSON.parse(JSON.stringify(element)) as VideoElementData;
    
    // Apply all updates
    Object.assign(updatedElement, updates);
    
    // Create a synthetic event for the entire element update
    const event = {
      target: {
        name: 'element',
        value: updatedElement,
        type: 'object'
      }
    } as any;
    
    onChange(event as any);
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Update the element directly with the checkbox change
    updateElement({
      [name]: checked
    });
  };
  
  // Handle video type change
  const handleVideoTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const videoType = e.target.value;
    
    // Update the element directly with the new video type and reset videoId
    updateElement({
      videoType: videoType as any,
      videoId: '',
      embedCode: ''
    });
  };
  
  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
  };
  
  // Handle embed code input change
  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);
  };
  
  // Handle URL submit
  const handleUrlSubmit = () => {
    let updates: Partial<VideoElementData> = {
      url: videoUrl
    };
    
    // Extract video ID based on type
    if (element.videoType === 'youtube') {
      const videoId = extractYouTubeVideoId(videoUrl);
      console.log('Extracted YouTube ID:', videoId, 'from URL:', videoUrl);
      if (videoId) {
        updates.videoId = videoId;
      }
    } else if (element.videoType === 'vimeo') {
      const videoId = extractVimeoVideoId(videoUrl);
      console.log('Extracted Vimeo ID:', videoId, 'from URL:', videoUrl);
      if (videoId) {
        updates.videoId = videoId;
      }
    } else if (element.videoType === 'custom' || element.videoType === 'url') {
      updates.videoUrl = videoUrl;
    }
    
    // Update the element with all changes at once
    updateElement(updates);
  };
  
  // Handle embed code submit
  const handleEmbedCodeSubmit = () => {
    // Extract src URL from iframe embed code
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    
    console.log('Extracted src from embed code:', src);
    
    // Update the element with the embed code and src URL
    updateElement({
      embedCode,
      videoUrl: src
    });
  };
  
  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the element directly with the text change
    updateElement({
      [name]: value
    });
  };
  
  return (
    <>
      <Row>
        <Col xs={12}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Video Type</div>
            <Form.Select
              name="videoType"
              value={element.videoType || 'url'}
              onChange={handleVideoTypeChange}
              style={styles.select}
              size="sm"
            >
              <option value="url">Direct URL</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="embed">Embed Code</option>
            </Form.Select>
            <div style={styles.helpText}>
              Select the type of video you want to add
            </div>
          </div>
        </Col>
      </Row>
      
      {(element.videoType === 'youtube' || element.videoType === 'vimeo' || element.videoType === 'url') && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Video URL</div>
          <div style={styles.urlInputGroup}>
            <Form.Control
              type="text"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder={
                element.videoType === 'youtube' ? 'Enter YouTube URL' :
                element.videoType === 'vimeo' ? 'Enter Vimeo URL' :
                'Enter video URL'
              }
              style={{ ...styles.formControl, ...styles.urlInput }}
              size="sm"
            />
            <Button 
              onClick={handleUrlSubmit}
              size="sm"
              variant="primary"
            >
              Apply
            </Button>
          </div>
          <div style={styles.helpText}>
            {element.videoType === 'youtube' ? 'Enter a YouTube video URL' :
             element.videoType === 'vimeo' ? 'Enter a Vimeo video URL' :
             'Enter a direct URL to a video file (MP4, WebM, etc.)'}
          </div>
        </div>
      )}
      
      {element.videoType === 'embed' && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Embed Code</div>
          <Form.Control
            as="textarea"
            value={embedCode}
            onChange={handleEmbedCodeChange}
            placeholder="Paste YouTube or Vimeo embed code here"
            style={{ ...styles.formControl, ...styles.textarea }}
            rows={4}
            size="sm"
          />
          <Button 
            onClick={handleEmbedCodeSubmit}
            size="sm"
            variant="primary"
            className="mt-2"
          >
            Apply Embed Code
          </Button>
          <div style={styles.helpText}>
            Paste the embed code from YouTube, Vimeo, or other video platforms
          </div>
        </div>
      )}
      
      {(element.videoType === 'youtube' || element.videoType === 'vimeo') && (
        <Row>
          <Col xs={12}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Video ID</div>
              <Form.Control
                type="text"
                name="videoId"
                value={element.videoId || ''}
                onChange={handleTextChange}
                placeholder={
                  element.videoType === 'youtube' ? 'YouTube video ID' :
                  'Vimeo video ID'
                }
                style={styles.formControl}
                size="sm"
                readOnly
              />
              <div style={styles.helpText}>
                {element.videoType === 'youtube' ? 'YouTube video ID (extracted from URL)' :
                'Vimeo video ID (extracted from URL)'}
              </div>
            </div>
          </Col>
        </Row>
      )}
      
      <Row>
        <Col xs={12}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Poster Image</div>
            <Form.Control
              type="text"
              name="posterImage"
              value={element.posterImage || ''}
              onChange={handleTextChange}
              placeholder="Enter poster image URL"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              URL to an image to show before the video plays
            </div>
          </div>
        </Col>
      </Row>
      
      <div style={styles.divider}></div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Playback Options</div>
        <Row className="g-1">
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="video-controls"
              label="Show Controls"
              name="controls"
              checked={element.controls !== false}
              onChange={(e) => handleCheckboxChange('controls', e.target.checked)}
            />
          </Col>
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="video-autoplay"
              label="Autoplay"
              name="autoplay"
              checked={element.autoplay === true}
              onChange={(e) => handleCheckboxChange('autoplay', e.target.checked)}
            />
          </Col>
        </Row>
        <Row className="g-1 mt-1">
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="video-loop"
              label="Loop"
              name="loop"
              checked={element.loop === true}
              onChange={(e) => handleCheckboxChange('loop', e.target.checked)}
            />
          </Col>
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="video-muted"
              label="Muted"
              name="muted"
              checked={element.muted === true}
              onChange={(e) => handleCheckboxChange('muted', e.target.checked)}
            />
          </Col>
        </Row>
      </div>
      
      {(element.videoType === 'youtube' || element.videoType === 'vimeo' || element.videoType === 'url') && (
        <Row className="g-1">
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Start Time (sec)</div>
              <Form.Control
                type="number"
                name="startTime"
                value={element.startTime || 0}
                onChange={handleTextChange}
                min={0}
                step={1}
                style={styles.formControl}
                size="sm"
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>End Time (sec, 0 = end)</div>
              <Form.Control
                type="number"
                name="endTime"
                value={element.endTime || 0}
                onChange={handleTextChange}
                min={0}
                step={1}
                style={styles.formControl}
                size="sm"
              />
            </div>
          </Col>
        </Row>
      )}
      
      <div style={styles.divider}></div>
      
      <Row>
        <Col xs={12}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Caption</div>
            <Form.Control
              as="textarea"
              name="caption"
              value={element.caption || ''}
              onChange={handleTextChange}
              placeholder="Enter caption text"
              style={{ ...styles.formControl, ...styles.textarea }}
              rows={2}
              size="sm"
            />
          </div>
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          <div style={styles.formGroup}>
            <Form.Check
              type="switch"
              id="video-show-caption"
              label="Show Caption"
              name="showCaption"
              checked={element.showCaption === true}
              onChange={(e) => handleCheckboxChange('showCaption', e.target.checked)}
            />
          </div>
        </Col>
        {element.showCaption && (
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Caption Position</div>
              <Form.Select
                name="captionPosition"
                value={element.captionPosition || 'bottom'}
                onChange={handleTextChange}
                style={styles.select}
                size="sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </Form.Select>
            </div>
          </Col>
        )}
      </Row>
    </>
  );
};

export default ContentProperties;
