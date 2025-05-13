import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { componentStyles } from '../componentStyles';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * A collapsible section component for grouping related form elements
 * Uses height animation for smooth transitions
 * Shared across all element types
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false,
  forceExpanded = false,
  onToggle
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded || forceExpanded);
  const [height, setHeight] = useState<number | string>(expanded ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update expanded state if forceExpanded changes
  useEffect(() => {
    if (forceExpanded) {
      setExpanded(true);
      setHeight('auto');
    }
  }, [forceExpanded]);
  
  // Update height when expanded state changes
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (expanded) {
      // Get the actual height of the content
      const contentHeight = contentRef.current.scrollHeight;
      
      // First set to the exact height for animation
      setHeight(contentHeight);
      
      // Then set to auto after animation completes to handle content changes
      const timer = setTimeout(() => {
        setHeight('auto');
      }, 300); // Match this with the transition duration
      
      return () => clearTimeout(timer);
    } else {
      // Set the exact height before collapsing for smooth animation
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      
      // Force a reflow to ensure the browser registers the height
      contentRef.current.offsetHeight; // eslint-disable-line no-unused-expressions
      
      // Then set to 0 to animate the collapse
      setTimeout(() => {
        setHeight(0);
      }, 10);
    }
  }, [expanded]);
  
  const handleToggle = () => {
    if (!forceExpanded) {
      const newExpandedState = !expanded;
      setExpanded(newExpandedState);
      if (onToggle) {
        onToggle(newExpandedState);
      }
    }
  };
  
  return (
    <div className="mb-2">
      <div 
        style={componentStyles.sectionHeader} 
        onClick={handleToggle}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleToggle();
            e.preventDefault();
          }
        }}
      >
        <span>{title}</span>
        {expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </div>
      <div 
        ref={contentRef}
        style={{
          overflow: 'hidden',
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          height: typeof height === 'number' ? `${height}px` : height,
          padding: expanded ? '4px 0' : '0'
        }}
        aria-hidden={!expanded}
      >
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
