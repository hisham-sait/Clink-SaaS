import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaBox, FaTag, FaLayerGroup, FaFileImport, FaPlus, FaCog, FaUpload, FaList } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ProductsService, CategoriesService, AttributesService, FamiliesService, ActivityService } from '../../../../services/products';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalAttributes: number;
  totalAttributesInUse: number;
  totalFamilies: number;
}

interface AttributeUsage {
  productCount: number;
  familyCount: number;
}

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: string;
  usage?: AttributeUsage;
}

interface RecentActivity {
  id: string;
  type: string;
  action: string;
  itemName: string;
  timestamp: string;
  user: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalAttributes: 0,
    totalAttributesInUse: 0,
    totalFamilies: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products count
      const productsResponse = await ProductsService.getProducts();
      const totalProducts = productsResponse.pagination?.total || 0;
      
      // Fetch categories count
      const categoriesResponse = await CategoriesService.getCategories();
      const totalCategories = categoriesResponse.categories?.length || 0;
      
      // Fetch attributes count and usage
      const attributes = await AttributesService.getAttributes();
      const totalAttributes = attributes.length;
      const totalAttributesInUse = attributes.filter((attr: Attribute) => 
        attr.usage && attr.usage.productCount > 0
      ).length;
      
      // Fetch families count
      const families = await FamiliesService.getFamilies();
      const totalFamilies = families.length || 0;
      
      // Update stats
      setStats({
        totalProducts,
        totalCategories,
        totalAttributes,
        totalAttributesInUse,
        totalFamilies
      });
      
      // Try to fetch recent activity if available
      try {
        const activities = await ActivityService.getActivities();
        if (activities && Array.isArray(activities)) {
          setRecentActivity(activities.slice(0, 5)); // Get the 5 most recent activities
        }
      } catch (activityError) {
        console.log('Recent activity not available:', activityError);
        // Don't set an error for this, as it's not critical
      }
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Function to render activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'product':
        return <FaBox className="text-primary" />;
      case 'category':
        return <FaLayerGroup className="text-success" />;
      case 'attribute':
        return <FaTag className="text-info" />;
      case 'family':
        return <FaFileImport className="text-warning" />;
      default:
        return <FaCog className="text-secondary" />;
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Products Dashboard</h1>
          <p className="text-muted mb-0">Overview of your product catalog and management</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Total Products</div>
                    <h3 className="mb-0">{stats.totalProducts}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaBox className="text-primary" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-success" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Categories</div>
                    <h3 className="mb-0">{stats.totalCategories}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaLayerGroup className="text-success" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-info" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Attributes</div>
                    <h3 className="mb-0">{stats.totalAttributes}</h3>
                    <small className="text-muted">{stats.totalAttributesInUse} in use</small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaTag className="text-info" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-warning" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Families</div>
                    <h3 className="mb-0">{stats.totalFamilies}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FaFileImport className="text-warning" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Activity</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-2 text-muted">Loading recent activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <div className="me-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{activity.action}</strong> {activity.type.toLowerCase()} <strong>{activity.itemName}</strong>
                      </div>
                      <small className="text-muted">{formatTimestamp(activity.timestamp)}</small>
                    </div>
                    <small className="text-muted">by {activity.user}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No recent activity to display. Start managing your products to see activity here.</p>
          )}
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/products/catalog" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaPlus className="text-primary mb-3" size={32} />
                    <h5>Add Product</h5>
                    <p className="small text-muted">Create a new product in your catalog</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/products/categories" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaLayerGroup className="text-success mb-3" size={32} />
                    <h5>Manage Categories</h5>
                    <p className="small text-muted">Organize your product categories</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/products/attributes" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaTag className="text-info mb-3" size={32} />
                    <h5>Define Attributes</h5>
                    <p className="small text-muted">Create and manage product attributes</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/products/import-export" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaUpload className="text-warning mb-3" size={32} />
                    <h5>Import Products</h5>
                    <p className="small text-muted">Bulk import products from CSV</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
