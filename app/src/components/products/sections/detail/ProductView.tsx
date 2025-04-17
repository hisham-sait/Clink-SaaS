import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack, Nav, Tab, Button, Table } from 'react-bootstrap';
import { 
  FaBox, 
  FaTag, 
  FaLayerGroup, 
  FaCalendar, 
  FaList, 
  FaImage, 
  FaCubes,
  FaFile
} from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

interface ProductActivity {
  id: string;
  type: string;
  action: string;
  itemName: string;
  itemId: string;
  timestamp: string;
  user: string;
}

// Map ProductActivity to Activity interface
const mapToActivity = (pa: ProductActivity): Activity => {
  // Map action to Activity type
  let activityType: Activity['type'] = 'updated'; // Default
  
  switch (pa.action.toLowerCase()) {
    case 'created':
    case 'added':
      activityType = 'added';
      break;
    case 'updated':
    case 'modified':
      activityType = 'updated';
      break;
    case 'deleted':
    case 'removed':
      activityType = 'removed';
      break;
    case 'status_changed':
      activityType = 'status_changed';
      break;
    default:
      activityType = 'updated';
  }
  
  return {
    id: pa.id,
    type: activityType,
    entityType: pa.type,
    entityId: pa.itemId,
    description: `${pa.action} ${pa.itemName}`,
    time: pa.timestamp,
    user: pa.user
  };
};

interface Section {
  id: string;
  name: string;
  code: string;
  description: string;
  displayIn: 'left' | 'right' | 'both';
}

const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<any | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [attributes, setAttributes] = useState<any[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(true);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchProductData();
      fetchSections();
      fetchAttributes();
    }
  }, [user?.companyId, id]);

  const fetchSections = async () => {
    try {
      setSectionsLoading(true);
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Fetch sections from API
      const response = await api.get(`/products/sections/${user.companyId}`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      
      // If API fails, use default sections as fallback
      const defaultSections = [
        { 
          id: '1', 
          name: 'General Information', 
          code: 'general-info', 
          description: 'Basic product information',
          displayIn: 'both' as const
        },
        { 
          id: '2', 
          name: 'Technical Specifications', 
          code: 'tech-specs', 
          description: 'Technical details and specifications',
          displayIn: 'right' as const
        },
        { 
          id: '3', 
          name: 'Marketing', 
          code: 'marketing', 
          description: 'Marketing information and materials',
          displayIn: 'left' as const
        }
      ];
      
      setSections(defaultSections);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      setAttributesLoading(true);
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Fetch attributes from API
      const response = await api.get(`/products/attributes/${user.companyId}`);
      setAttributes(response.data);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      setAttributes([]);
    } finally {
      setAttributesLoading(false);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get product details
      const response = await api.get(`/products/products/${user.companyId}/${id}`);
      setProduct(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/products/activity/${user.companyId}`);
      const productActivities = activitiesResponse.data
        .filter((a: ProductActivity) => a.itemId === id && a.type === 'product')
        .map(mapToActivity);
      setActivities(productActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchProductData();
    setShowEditModal(false);
  };

  // Get attributes for a specific section
  const getAttributesForSection = (sectionId: string) => {
    if (attributesLoading) return [];
    return attributes.filter(attr => attr.sectionId === sectionId);
  };

  // Render attributes for a section
  const renderSectionAttributes = (sectionId: string) => {
    const sectionAttributes = getAttributesForSection(sectionId);
    
    if (sectionAttributes.length === 0) {
      return (
        <div className="alert alert-info">
          No attributes assigned to this section.
        </div>
      );
    }
    
    return (
      <Table responsive striped hover size="sm" className="mt-3">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {sectionAttributes.map(attr => {
            // Find attribute value for this product
            const attrValue = product?.attributeValues?.find((av: any) => av.attributeId === attr.id);
            
            return (
              <tr key={attr.id}>
                <td>{attr.name}</td>
                <td>
                  {attrValue ? (
                    <span>{JSON.stringify(attrValue.value)}</span>
                  ) : (
                    <span className="text-muted">Not set</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  const renderTabs = () => {
    if (sectionsLoading) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary"></div>
          <p className="text-muted small mt-2 mb-0">Loading sections...</p>
        </div>
      );
    }

    // Filter sections that should be displayed in the right panel
    const rightPanelSections = sections.filter(
      section => section.displayIn === 'right' || section.displayIn === 'both'
    );

    if (rightPanelSections.length === 0) {
      return (
        <div>
          <h5 className="mb-3">Product Overview</h5>
          <p>{product?.description || 'No description available.'}</p>
          
          <h6 className="mt-4 mb-3">Recent Activities</h6>
          {activitiesLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <p className="text-muted small mt-2 mb-0">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <ul className="list-group">
              {activities.slice(0, 3).map((activity, index) => (
                <li key={index} className="list-group-item">
                  <div className="d-flex">
                    <div className="me-3">
                      <Badge bg="light" className="p-2">
                        <i className={`bi ${
                          activity.type === 'added' ? 'bi-plus-circle text-success' :
                          activity.type === 'updated' ? 'bi-pencil text-primary' :
                          activity.type === 'removed' ? 'bi-trash text-danger' :
                          'bi-info-circle text-primary'
                        }`}></i>
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-0">{activity.description}</p>
                      <small className="text-muted">
                        {new Date(activity.time).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No recent activities</p>
          )}
        </div>
      );
    }

    // If we have sections to display, show them
    return (
      <div>
        <div className="mb-4">
          <h5 className="mb-3">Product Overview</h5>
          <p>{product?.description || 'No description available.'}</p>
        </div>
        
        {rightPanelSections.map(section => (
          <div key={section.id} className="mb-4">
            <h5 className="mb-3">{section.name}</h5>
            <p>{section.description}</p>
            {attributesLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary"></div>
                <p className="text-muted small mt-2 mb-0">Loading attributes...</p>
              </div>
            ) : (
              renderSectionAttributes(section.id)
            )}
          </div>
        ))}
        
        <div className="mt-4">
          <h6 className="mb-3">Recent Activities</h6>
          {activitiesLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <p className="text-muted small mt-2 mb-0">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <ul className="list-group">
              {activities.slice(0, 3).map((activity, index) => (
                <li key={index} className="list-group-item">
                  <div className="d-flex">
                    <div className="me-3">
                      <Badge bg="light" className="p-2">
                        <i className={`bi ${
                          activity.type === 'added' ? 'bi-plus-circle text-success' :
                          activity.type === 'updated' ? 'bi-pencil text-primary' :
                          activity.type === 'removed' ? 'bi-trash text-danger' :
                          'bi-info-circle text-primary'
                        }`}></i>
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-0">{activity.description}</p>
                      <small className="text-muted">
                        {new Date(activity.time).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No recent activities</p>
          )}
        </div>
      </div>
    );
  };

  const renderProductInfo = () => {
    if (!product) return null;
    
    return (
      <div>
        {/* Status Badge */}
        <div className="mb-3">
          <StatusBadge status={product.status} type={product.type} />
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaBox className="me-1" />Name</>}
              value={product.name}
            />
            <InfoListItem 
              label={<><FaTag className="me-1" />SKU</>}
              value={product.sku || '-'}
            />
            <InfoListItem 
              label={<><FaBox className="me-1" />Type</>}
              value={
                product.type === 'PHYSICAL' ? 'Physical' : 
                product.type === 'DIGITAL' ? 'Digital' : 
                product.type === 'SERVICE' ? 'Service' : product.type
              }
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Created</>}
              value={new Date(product.createdAt).toLocaleDateString()}
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Updated</>}
              value={new Date(product.updatedAt).toLocaleDateString()}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Classification */}
        <div className="mb-4">
          <SectionHeader title="Classification" />
          <InfoList>
            <InfoListItem 
              label={<><FaLayerGroup className="me-1" />Category</>}
              value={product.category ? product.category.name : 'Not assigned'}
            />
            <InfoListItem 
              label={<><FaLayerGroup className="me-1" />Family</>}
              value={product.family ? product.family.name : 'Not assigned'}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Completeness */}
        {product.completeness !== undefined && (
          <div className="mb-4">
            <SectionHeader title="Completeness" />
            <div className="px-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span>Required Attributes</span>
                <span>{product.completeness}%</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${
                    product.completeness < 30 ? 'danger' :
                    product.completeness < 70 ? 'warning' :
                    'success'
                  }`}
                  role="progressbar" 
                  style={{ width: `${product.completeness}%` }}
                  aria-valuenow={product.completeness}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-4">
            <SectionHeader title="Variants" />
            <InfoList>
              <InfoListItem 
                label={<><FaCubes className="me-1" />Variants</>}
                value={product.variants.length}
              />
              {product.variantAxis && product.variantAxis.length > 0 && (
                <InfoListItem 
                  label={<><FaList className="me-1" />Variant Axes</>}
                  value={product.variantAxis.join(', ')}
                  isLast={true}
                />
              )}
            </InfoList>
          </div>
        )}

        {/* Media */}
        {product.media && product.media.length > 0 && (
          <div className="mb-4">
            <SectionHeader title="Media" />
            <InfoList>
              <InfoListItem 
                label={<><FaImage className="me-1" />Images</>}
                value={product.media.filter((m: any) => m.type === 'IMAGE').length}
                isLast={true}
              />
            </InfoList>
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <SectionHeader title="Description" />
          <div className="px-3 pb-3">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }} />
            ) : (
              <p className="text-muted">No description provided</p>
            )}
          </div>
        </div>

        {/* Left Panel Sections */}
        {!sectionsLoading && sections
          .filter(section => section.displayIn === 'left' || section.displayIn === 'both')
          .map(section => (
            <div key={section.id} className="mb-4">
              <SectionHeader title={section.name} />
              <div className="px-3 pb-3">
                <p>{section.description}</p>
                {attributesLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <p className="text-muted small mt-2 mb-0">Loading attributes...</p>
                  </div>
                ) : (
                  renderSectionAttributes(section.id)
                )}
              </div>
            </div>
          ))
        }
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={product ? product.name : 'Product Details'}
        subtitle={product ? (product.sku ? `SKU: ${product.sku}` : '') : ''}
        entityType="product"
        onBack={() => navigate('/products/catalog')}
        onEdit={() => navigate(`/products/edit/${id}`)}
        renderInfo={renderProductInfo}
        renderTabs={renderTabs}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />
    </>
  );
};

export default ProductView;
