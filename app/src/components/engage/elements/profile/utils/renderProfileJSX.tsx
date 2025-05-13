import React from 'react';
import { ProfileElementData } from '../ProfileElementData';
import { getProfileStyle, getAvatarStyle } from './defaultProperties';
import { FaEnvelope, FaPhone, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

/**
 * Renders a profile element as JSX
 * @param element The profile element data
 * @returns JSX representation of the profile element
 */
export const renderProfileJSX = (element: ProfileElementData): JSX.Element => {
  const profileStyle = getProfileStyle(element);
  const avatarStyle = getAvatarStyle(element);
  
  // Determine animation class
  let animationClass = '';
  if (element.animation && element.animation !== 'none') {
    animationClass = `animate__animated animate__${element.animation}`;
  }
  
  // Determine responsive classes
  let responsiveClass = '';
  if (element.hideOnMobile) {
    responsiveClass += ' hide-on-mobile';
  }
  if (element.hideOnDesktop) {
    responsiveClass += ' hide-on-desktop';
  }
  
  // Get social icon component based on platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin />;
      case 'twitter':
        return <FaTwitter />;
      case 'facebook':
        return <FaFacebook />;
      case 'instagram':
        return <FaInstagram />;
      case 'github':
        return <FaGithub />;
      default:
        return null;
    }
  };
  
  // Render the profile based on the selected layout template
  const renderProfileContent = () => {
    // Apply custom font sizes and spacing if provided
    const nameStyle: React.CSSProperties = { 
      margin: `0 0 ${element.nameSpacing || '0.5rem'}`,
      fontWeight: 'bold',
      fontSize: element.nameFontSize || '1.5rem'
    };
    
    const titleStyle: React.CSSProperties = { 
      margin: `0 0 ${element.titleSpacing || '0.5rem'}`, 
      fontWeight: 'normal',
      color: '#666',
      fontSize: element.titleFontSize || '1.1rem'
    };
    
    const bioStyle: React.CSSProperties = { 
      margin: `0 0 ${element.bioSpacing || '1rem'}`,
      fontSize: element.bioFontSize || '0.9rem'
    };
    
    const contactStyle: React.CSSProperties = { 
      margin: `${element.contactSpacing || '1rem'} 0`,
      fontSize: element.contactFontSize || '0.9rem'
    };
    
    const contactItemStyle: React.CSSProperties = { 
      display: 'flex', 
      alignItems: 'center', 
      margin: '0.5rem 0'
    };
    
    const socialStyle: React.CSSProperties = { 
      display: 'flex', 
      justifyContent: element.alignment === 'center' ? 'center' : 'flex-start', 
      gap: '1rem', 
      margin: `${element.socialSpacing || '1rem'} 0`
    };
    
    const socialLinkStyle: React.CSSProperties = { 
      fontSize: element.socialIconSize || '1.5rem', 
      color: 'inherit', 
      textDecoration: 'none'
    };
    
    // Render cover photo if provided
    const renderCoverPhoto = () => {
      if (element.coverPhotoUrl) {
        const coverPhotoStyle: React.CSSProperties = {
          width: '100%',
          height: element.coverPhotoHeight || '200px',
          objectFit: 'cover',
          objectPosition: element.coverPhotoPosition || 'center',
          position: 'relative',
          marginBottom: '1rem'
        };
        
        const overlayStyle: React.CSSProperties = element.coverPhotoOverlay ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: element.coverPhotoOverlayColor || 'rgba(0,0,0,0.5)',
          opacity: element.coverPhotoOverlayOpacity || 0.5
        } : {};
        
        return (
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <img 
              src={element.coverPhotoUrl} 
              alt="Cover" 
              style={coverPhotoStyle} 
            />
            {element.coverPhotoOverlay && <div style={overlayStyle}></div>}
          </div>
        );
      }
      return null;
    };
    
    // Render the avatar
    const renderAvatar = () => {
      if (element.showAvatar && element.avatarUrl) {
        return (
          <img 
            src={element.avatarUrl} 
            alt={`${element.name} avatar`} 
            style={avatarStyle}
            className="profile-avatar"
          />
        );
      }
      return null;
    };
    
    // Render the name and title
    const renderNameTitle = () => {
      return (
        <>
          {element.name && (
            <h3 className="profile-name" style={nameStyle}>
              {element.name}
            </h3>
          )}
          
          {element.title && (
            <h4 className="profile-title" style={titleStyle}>
              {element.title}
            </h4>
          )}
        </>
      );
    };
    
    // Render the bio
    const renderBio = () => {
      if (element.bio) {
        return (
          <p className="profile-bio" style={bioStyle}>
            {element.bio}
          </p>
        );
      }
      return null;
    };
    
    // Render contact information
    const renderContact = () => {
      if (element.email || element.phone) {
        return (
          <div className="profile-contact" style={contactStyle}>
            {element.email && (
              <div className="profile-email" style={contactItemStyle}>
                <FaEnvelope style={{ marginRight: '0.5rem' }} /> {element.email}
              </div>
            )}
            
            {element.phone && (
              <div className="profile-phone" style={contactItemStyle}>
                <FaPhone style={{ marginRight: '0.5rem' }} /> {element.phone}
              </div>
            )}
          </div>
        );
      }
      return null;
    };
    
    // Render social links
    const renderSocial = () => {
      if (element.showSocial && element.socialLinks && element.socialLinks.length > 0) {
        return (
          <div className="profile-social" style={socialStyle}>
            {element.socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-social-link"
                style={socialLinkStyle}
              >
                {getSocialIcon(social.platform)}
              </a>
            ))}
          </div>
        );
      }
      return null;
    };
    
    // Apply different layouts based on the template
    switch (element.layoutTemplate) {
      case 'horizontal':
        return (
          <div className="profile-layout-horizontal">
            {renderCoverPhoto()}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1.5rem',
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flexShrink: 0 }}>
                {renderAvatar()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {renderNameTitle()}
                {renderBio()}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end',
                  marginTop: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>{renderContact()}</div>
                  <div>{renderSocial()}</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'minimal':
        return (
          <div className="profile-layout-minimal" style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {renderCoverPhoto()}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start'),
              gap: '0.75rem'
            }}>
              {renderAvatar()}
              {renderNameTitle()}
              {renderBio()}
              {renderContact()}
              {renderSocial()}
            </div>
          </div>
        );
        
      case 'corporate':
        return (
          <div className="profile-layout-corporate" style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '6px', 
            overflow: 'hidden',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            backgroundColor: '#ffffff'
          }}>
            {renderCoverPhoto()}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1.25rem', 
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ marginRight: '1.25rem', flexShrink: 0 }}>
                {renderAvatar()}
              </div>
              <div>
                {renderNameTitle()}
              </div>
            </div>
            <div style={{ 
              padding: '1.25rem', 
              borderBottom: element.email || element.phone ? '1px solid #f0f0f0' : 'none',
              backgroundColor: '#ffffff'
            }}>
              {renderBio()}
            </div>
            {(element.email || element.phone) && (
              <div style={{ 
                padding: '1.25rem', 
                borderBottom: element.showSocial && element.socialLinks && element.socialLinks.length > 0 ? '1px solid #f0f0f0' : 'none',
                backgroundColor: '#fafafa'
              }}>
                {renderContact()}
              </div>
            )}
            {element.showSocial && element.socialLinks && element.socialLinks.length > 0 && (
              <div style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                justifyContent: 'center',
                gap: '1.5rem',
                backgroundColor: '#ffffff'
              }}>
                {element.socialLinks.map((social, index) => (
                  <a 
                    key={index} 
                    href={social.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-social-link"
                    style={{...socialLinkStyle, color: '#555'}}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'creative':
        return (
          <div className="profile-layout-creative">
            {renderCoverPhoto()}
            <div style={{ 
              position: 'relative', 
              padding: '2rem', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '12px', 
              minHeight: '220px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,123,255,0.1)',
                zIndex: 0
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,123,255,0.05)',
                zIndex: 0
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '1.5rem', 
                right: '2rem',
                zIndex: 2
              }}>
                {renderAvatar()}
              </div>
              <div style={{ 
                position: 'relative',
                maxWidth: '70%',
                zIndex: 1
              }}>
                {renderNameTitle()}
                {renderBio()}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                position: 'absolute',
                bottom: '1.5rem',
                left: '2rem',
                right: '2rem',
                zIndex: 1
              }}>
                <div>{renderContact()}</div>
                <div>{renderSocial()}</div>
              </div>
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className="profile-layout-social" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            {renderCoverPhoto()}
            <div style={{ 
              textAlign: 'center',
              padding: '1.5rem'
            }}>
              <div style={{
                marginTop: element.coverPhotoUrl ? '-3.5rem' : '0',
                marginBottom: '1rem'
              }}>
                {renderAvatar()}
              </div>
              {renderNameTitle()}
              {renderBio()}
              <div style={{ 
                margin: '1.5rem 0',
                padding: '1rem 0',
                borderTop: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                {element.showSocial && element.socialLinks && element.socialLinks.length > 0 && (
                  <div className="profile-social" style={{ 
                    ...socialStyle, 
                    justifyContent: 'center',
                    gap: '2rem'
                  }}>
                    {element.socialLinks.map((social, index) => (
                      <a 
                        key={index} 
                        href={social.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile-social-link"
                        style={{ ...socialLinkStyle, fontSize: '1.75rem' }}
                      >
                        {getSocialIcon(social.platform)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                {renderContact()}
              </div>
            </div>
          </div>
        );
        
      case 'linkCollection':
        return (
          <div className="profile-layout-link-collection" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '1.5rem'
          }}>
            {renderCoverPhoto()}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {renderAvatar()}
              {renderNameTitle()}
              {renderBio()}
              
              {/* Contact links as buttons */}
              {(element.email || element.phone) && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  maxWidth: '400px',
                  gap: '0.75rem',
                  margin: '1rem 0'
                }}>
                  {element.email && (
                    <a href={`mailto:${element.email}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0f7ff',
                      color: '#0066cc',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}>
                      <FaEnvelope /> {element.email}
                    </a>
                  )}
                  
                  {element.phone && (
                    <a href={`tel:${element.phone}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0fff4',
                      color: '#00994d',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}>
                      <FaPhone /> {element.phone}
                    </a>
                  )}
                </div>
              )}
              
              {/* Social links as buttons */}
              {element.showSocial && element.socialLinks && element.socialLinks.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  maxWidth: '400px',
                  gap: '0.75rem'
                }}>
                  {element.socialLinks.map((social, index) => {
                    // Determine color based on platform
                    let bgColor = '#f0f0f0';
                    let textColor = '#333333';
                    
                    switch(social.platform.toLowerCase()) {
                      case 'linkedin':
                        bgColor = '#e8f0fe';
                        textColor = '#0077b5';
                        break;
                      case 'twitter':
                        bgColor = '#e8f5fd';
                        textColor = '#1da1f2';
                        break;
                      case 'facebook':
                        bgColor = '#e8f0ff';
                        textColor = '#4267b2';
                        break;
                      case 'instagram':
                        bgColor = '#fce8f4';
                        textColor = '#c13584';
                        break;
                      case 'github':
                        bgColor = '#f0f0f0';
                        textColor = '#333333';
                        break;
                    }
                    
                    return (
                      <a 
                        key={index} 
                        href={social.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: bgColor,
                          color: textColor,
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {getSocialIcon(social.platform)} {social.platform}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'photoGrid':
        return (
          <div className="profile-layout-photo-grid" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            {/* Cover photo with overlapping avatar */}
            <div style={{ position: 'relative' }}>
              {element.coverPhotoUrl ? (
                <div style={{ 
                  height: '180px', 
                  backgroundImage: `url(${element.coverPhotoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: element.coverPhotoPosition || 'center'
                }}>
                  {element.coverPhotoOverlay && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: element.coverPhotoOverlayColor || 'rgba(0,0,0,0.3)',
                      opacity: element.coverPhotoOverlayOpacity || 0.5
                    }}></div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  height: '120px', 
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}></div>
              )}
              
              {/* Overlapping avatar */}
              <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '50%',
                padding: '5px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                {element.showAvatar && element.avatarUrl ? (
                  <img 
                    src={element.avatarUrl} 
                    alt={`${element.name} avatar`} 
                    style={{
                      ...avatarStyle,
                      width: '100px',
                      height: '100px',
                      border: '3px solid #ffffff'
                    }}
                    className="profile-avatar"
                  />
                ) : null}
              </div>
            </div>
            
            {/* Content with top padding for avatar */}
            <div style={{ 
              padding: '60px 1.5rem 1.5rem',
              textAlign: 'center'
            }}>
              {renderNameTitle()}
              {renderBio()}
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                margin: '1.5rem 0',
                flexWrap: 'wrap'
              }}>
                {renderContact()}
                {renderSocial()}
              </div>
            </div>
          </div>
        );
        
      case 'professionalNetwork':
        return (
          <div className="profile-layout-professional-network" style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            {/* Banner image */}
            {renderCoverPhoto()}
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'row',
              padding: '0'
            }}>
              {/* Sidebar with avatar and contact */}
              <div style={{
                width: '220px',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #eaeaea',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {renderAvatar()}
                
                <div style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '1rem 0',
                  borderTop: '1px solid #eaeaea'
                }}>
                  {renderContact()}
                </div>
                
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {renderSocial()}
                </div>
              </div>
              
              {/* Main content */}
              <div style={{
                flex: 1,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {renderNameTitle()}
                
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  marginTop: '0.5rem'
                }}>
                  {renderBio()}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'socialFeed':
        return (
          <div className="profile-layout-social-feed" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #eaeaea'
          }}>
            {/* Header with avatar and name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ flexShrink: 0 }}>
                {renderAvatar()}
              </div>
              <div>
                {renderNameTitle()}
              </div>
            </div>
            
            {/* Cover photo as post image */}
            {element.coverPhotoUrl && (
              <div style={{
                width: '100%',
                height: '300px',
                backgroundImage: `url(${element.coverPhotoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: element.coverPhotoPosition || 'center'
              }}>
                {element.coverPhotoOverlay && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: element.coverPhotoOverlayColor || 'rgba(0,0,0,0.3)',
                    opacity: element.coverPhotoOverlayOpacity || 0.5
                  }}></div>
                )}
              </div>
            )}
            
            {/* Bio as post content */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #f0f0f0'
            }}>
              {renderBio()}
            </div>
            
            {/* Engagement metrics */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#fafafa',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span>❤️ 42 likes</span>
                <span>💬 12 comments</span>
              </div>
              <div>
                <span>🔄 Share</span>
              </div>
            </div>
            
            {/* Contact and social */}
            <div style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>{renderContact()}</div>
              <div>{renderSocial()}</div>
            </div>
          </div>
        );
        
      case 'businessCard':
        return (
          <div className="profile-layout-business-card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #eaeaea'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row'
            }}>
              {/* Left column with cover photo or color */}
              <div style={{
                width: '40%',
                position: 'relative',
                backgroundColor: '#f0f7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {element.coverPhotoUrl ? (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${element.coverPhotoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: element.coverPhotoPosition || 'center',
                    opacity: 0.8
                  }}>
                    {element.coverPhotoOverlay && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: element.coverPhotoOverlayColor || 'rgba(0,0,0,0.3)',
                        opacity: element.coverPhotoOverlayOpacity || 0.5
                      }}></div>
                    )}
                  </div>
                ) : null}
                
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  {renderAvatar()}
                  
                  <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {renderSocial()}
                  </div>
                </div>
              </div>
              
              {/* Right column with content */}
              <div style={{
                width: '60%',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                {renderNameTitle()}
                {renderBio()}
                
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px'
                }}>
                  {renderContact()}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'classic':
      default:
        return (
          <div className="profile-layout-classic" style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            {renderCoverPhoto()}
            <div style={{ 
              textAlign: element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'right' : 'left'),
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start')
            }}>
              {renderAvatar()}
              {renderNameTitle()}
              {renderBio()}
              {renderContact()}
              {renderSocial()}
            </div>
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`profile-element ${animationClass} ${responsiveClass}`}
      style={profileStyle}
      aria-label={element.ariaLabel || `Profile for ${element.name}`}
      role={element.role || 'region'}
      tabIndex={element.tabIndex || 0}
      data-element-id={element.id}
      data-element-type={element.type}
    >
      {renderProfileContent()}
    </div>
  );
};
