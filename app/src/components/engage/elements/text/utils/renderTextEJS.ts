import { TextElementData } from '../TextElementData';

/**
 * Render text element as EJS template string (for server-side rendering)
 * @param element The text element data
 * @returns EJS template string
 */
export const renderTextEJS = (element: TextElementData): string => {
  return `
<% if (element.textType === 'heading') { %>
  <% const headingLevel = element.headingLevel || 2; %>
  <% const headingTag = \`h\${headingLevel}\`; %>
  <div style="
    /* Basic properties */
    color: <%= element.headingColor || '#212529' %>;
    text-align: <%= element.headingAlignment || 'left' %>;
    font-family: <%= element.fontFamily || 'inherit' %>;
    margin: <%= element.margin || '0 0 1rem 0' %>;
    padding: <%= element.padding || '0' %>;
    background-color: <%= element.backgroundColor || 'transparent' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Typography properties */
    font-weight: <%= element.headingWeight || 'bold' %>;
    text-transform: <%= element.headingTransform || 'none' %>;
    font-style: <%= element.headingStyle || 'normal' %>;
    text-decoration: <%= element.headingDecoration || 'none' %>;
    line-height: <%= element.headingLineHeight || '1.5' %>;
    letter-spacing: <%= element.headingLetterSpacing || 'normal' %>;
    
    /* Text shadow */
    text-shadow: <%= (element.headingTextShadow && element.headingTextShadow !== 'none') ? 
      \`\${element.headingTextShadowOffsetX || '1px'} \${element.headingTextShadowOffsetY || '1px'} \${element.headingTextShadowBlur || '2px'} \${element.headingTextShadowColor || 'rgba(0,0,0,0.3)'}\` : 'none' %>;
    
    /* Border properties */
    border: <%= element.borderStyle !== 'none' ? (element.border || '1px solid #dee2e6') : 'none' %>;
    border-color: <%= element.borderColor || '#dee2e6' %>;
    border-width: <%= element.borderWidth || '1px' %>;
    border-style: <%= element.borderStyle || 'solid' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Advanced styling */
    box-shadow: <%= element.boxShadow || 'none' %>;
    opacity: <%= element.opacity || 1 %>;
    overflow: <%= element.overflow || 'visible' %>;
    word-break: <%= element.wordBreak || 'normal' %>;
    word-wrap: <%= element.wordWrap || 'normal' %>;
    
    <% if (element.hideOnMobile) { %>
    @media (max-width: 768px) { display: none; }
    <% } %>
    
    <% if (element.hideOnDesktop) { %>
    @media (min-width: 769px) { display: none; }
    <% } %>
  ">
    <% if (headingLevel == 1) { %>
      <h1><%= element.content || \`Heading \${headingLevel}\` %></h1>
    <% } else if (headingLevel == 2) { %>
      <h2><%= element.content || \`Heading \${headingLevel}\` %></h2>
    <% } else if (headingLevel == 3) { %>
      <h3><%= element.content || \`Heading \${headingLevel}\` %></h3>
    <% } else if (headingLevel == 4) { %>
      <h4><%= element.content || \`Heading \${headingLevel}\` %></h4>
    <% } else if (headingLevel == 5) { %>
      <h5><%= element.content || \`Heading \${headingLevel}\` %></h5>
    <% } else { %>
      <h6><%= element.content || \`Heading \${headingLevel}\` %></h6>
    <% } %>
  </div>
<% } else if (element.textType === 'list') { %>
  <div style="
    /* Basic properties */
    color: <%= element.listColor || '#212529' %>;
    font-family: <%= element.fontFamily || 'inherit' %>;
    margin: <%= element.margin || '0 0 1rem 0' %>;
    padding: <%= element.padding || '0' %>;
    background-color: <%= element.backgroundColor || 'transparent' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Typography properties */
    font-weight: <%= element.listWeight || 'normal' %>;
    text-transform: <%= element.listTransform || 'none' %>;
    font-style: <%= element.listStyle2 || 'normal' %>;
    text-decoration: <%= element.listDecoration || 'none' %>;
    line-height: <%= element.listLineHeight || '1.5' %>;
    letter-spacing: <%= element.listLetterSpacing || 'normal' %>;
    
    /* List specific properties */
    list-style-type: <%= element.listStyle || (element.listType === 'ordered' ? 'decimal' : 'disc') %>;
    list-style-position: inside;
    
    /* Text shadow */
    text-shadow: <%= (element.listTextShadow && element.listTextShadow !== 'none') ? 
      \`\${element.listTextShadowOffsetX || '1px'} \${element.listTextShadowOffsetY || '1px'} \${element.listTextShadowBlur || '2px'} \${element.listTextShadowColor || 'rgba(0,0,0,0.3)'}\` : 'none' %>;
    
    /* Border properties */
    border: <%= element.borderStyle !== 'none' ? (element.border || '1px solid #dee2e6') : 'none' %>;
    border-color: <%= element.borderColor || '#dee2e6' %>;
    border-width: <%= element.borderWidth || '1px' %>;
    border-style: <%= element.borderStyle || 'solid' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Advanced styling */
    box-shadow: <%= element.boxShadow || 'none' %>;
    opacity: <%= element.opacity || 1 %>;
    overflow: <%= element.overflow || 'visible' %>;
    word-break: <%= element.wordBreak || 'normal' %>;
    word-wrap: <%= element.wordWrap || 'normal' %>;
    
    <% if (element.hideOnMobile) { %>
    @media (max-width: 768px) { display: none; }
    <% } %>
    
    <% if (element.hideOnDesktop) { %>
    @media (min-width: 769px) { display: none; }
    <% } %>
  ">
    <% if (element.listType === 'ordered') { %>
      <ol>
        <% (element.listItems || ['Item 1', 'Item 2', 'Item 3']).forEach(item => { %>
          <li><%= item %></li>
        <% }); %>
      </ol>
    <% } else { %>
      <ul>
        <% (element.listItems || ['Item 1', 'Item 2', 'Item 3']).forEach(item => { %>
          <li><%= item %></li>
        <% }); %>
      </ul>
    <% } %>
  </div>
<% } else { %>
  <div style="
    /* Basic properties */
    color: <%= element.paragraphColor || '#212529' %>;
    text-align: <%= element.paragraphAlignment || 'left' %>;
    font-family: <%= element.fontFamily || 'inherit' %>;
    line-height: <%= element.paragraphLineHeight || '1.5' %>;
    margin: <%= element.margin || '0 0 1rem 0' %>;
    padding: <%= element.padding || '0' %>;
    background-color: <%= element.backgroundColor || 'transparent' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Typography properties */
    font-weight: <%= element.paragraphWeight || 'normal' %>;
    text-transform: <%= element.paragraphTransform || 'none' %>;
    font-style: <%= element.paragraphStyle || 'normal' %>;
    text-decoration: <%= element.paragraphDecoration || 'none' %>;
    letter-spacing: <%= element.paragraphLetterSpacing || 'normal' %>;
    text-indent: <%= element.paragraphIndent || '0' %>;
    
    /* Text shadow */
    text-shadow: <%= (element.paragraphTextShadow && element.paragraphTextShadow !== 'none') ? 
      \`\${element.paragraphTextShadowOffsetX || '1px'} \${element.paragraphTextShadowOffsetY || '1px'} \${element.paragraphTextShadowBlur || '2px'} \${element.paragraphTextShadowColor || 'rgba(0,0,0,0.3)'}\` : 'none' %>;
    
    /* Border properties */
    border: <%= element.borderStyle !== 'none' ? (element.border || '1px solid #dee2e6') : 'none' %>;
    border-color: <%= element.borderColor || '#dee2e6' %>;
    border-width: <%= element.borderWidth || '1px' %>;
    border-style: <%= element.borderStyle || 'solid' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    
    /* Advanced styling */
    box-shadow: <%= element.boxShadow || 'none' %>;
    opacity: <%= element.opacity || 1 %>;
    overflow: <%= element.overflow || 'visible' %>;
    word-break: <%= element.wordBreak || 'normal' %>;
    word-wrap: <%= element.wordWrap || 'normal' %>;
    
    <% if (element.hideOnMobile) { %>
    @media (max-width: 768px) { display: none; }
    <% } %>
    
    <% if (element.hideOnDesktop) { %>
    @media (min-width: 769px) { display: none; }
    <% } %>
  ">
    <p><%= element.content || 'Paragraph text content goes here. This is how your paragraph will look.' %></p>
  </div>
<% } %>
  `.trim();
};
