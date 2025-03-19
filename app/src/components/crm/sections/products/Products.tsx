import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col } from 'react-bootstrap';
import { FaBox, FaCheckCircle, FaPauseCircle, FaClock } from 'react-icons/fa';
import ProductModal from './ProductModal';
import { Product } from '../../../crm/types';
import * as crmService from '../../../../services/crm';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';

const Products: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.companyId) {
      loadProducts();
    }
  }, [user?.companyId]);

  const loadProducts = async () => {
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      const data = await crmService.getProducts(user.companyId);
      setProducts(data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (product: Product | null) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  const handleSave = async (product: Product) => {
    try {
      if (selectedProduct) {
        if (!user?.companyId) return;
        await crmService.updateProduct(user.companyId, selectedProduct.id, product);
        toast.success('Product updated successfully');
      } else {
        if (!user?.companyId) return;
        await crmService.createProduct(user.companyId, product);
        toast.success('Product created successfully');
      }
      loadProducts();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      if (!user?.companyId) return;
      await crmService.deleteProduct(user.companyId, productId);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Products & Services</h1>
          <p className="text-muted mb-0">Manage your product catalog and service offerings</p>
        </div>
        <Button variant="primary" onClick={() => handleAddEdit(null)}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Products</div>
                  <h3 className="mb-0">{products.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaBox className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Active Products</div>
                  <h3 className="mb-0">{products.filter(p => p.status === 'Active').length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheckCircle className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Inactive Products</div>
                  <h3 className="mb-0">{products.filter(p => p.status !== 'Active').length}</h3>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <FaPauseCircle className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Card className="mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-box-seam fs-1 text-muted"></i>
              <p className="mt-2 mb-0">No products created yet</p>
              <p className="text-muted small">Create your first product to get started</p>
            </div>
          ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>
                    <Badge bg={product.type === 'SERVICE' ? 'info' : 'primary'}>
                      {product.type}
                    </Badge>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    {product.tiers.map(tier => (
                      <div key={tier.type}>
                        {tier.type}: ${tier.price.toFixed(2)}
                      </div>
                    ))}
                  </td>
                  <td>
                    <Badge bg={product.status === 'Active' ? 'success' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      className="p-0 me-3"
                      onClick={() => handleAddEdit(product)}
                      title="Edit Product"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="link"
                      className="p-0 text-danger"
                      onClick={() => handleDelete(product.id)}
                      title="Delete Product"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activities */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Recent Product Activities
            </h5>
          </div>
          <div className="text-muted small">
            Product updates and changes will appear here
          </div>
        </Card.Body>
      </Card>

      <ProductModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        product={selectedProduct}
      />
      </div>
  );
};

export default Products;
