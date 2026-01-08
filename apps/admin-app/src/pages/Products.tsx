import React, { useState } from 'react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
} from '../api/queries';
import {
  Button,
  Input,
  Modal,
  Table,
  Badge,
  Spinner,
  Pagination,
  Textarea,
  Select,
  Confirm,
  ToasterBox,
} from '@3asoftwares/ui-library';

import type { ProductGraphQL as Product, CreateProductInput } from '@3asoftwares/types';
import { formatIndianCompact } from '@3asoftwares/utils';
import { ImageUpload } from '../components/ImageUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const Products: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProductId, setConfirmProductId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  const [isPublishing, setIsPublishing] = useState('');
  const { data, isLoading, refetch } = useProducts(page, 10);
  const { data: categoriesData } = useCategories();
  const categories: any = categoriesData?.categories?.data || [];

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    sellerId: 'admin',
    tags: [],
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock || 0,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId,
        tags: product.tags,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        imageUrl: '',
        sellerId: 'admin',
        tags: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, input: formData });
        showToast('Product updated successfully', 'success');
      } else {
        await createProduct.mutateAsync(formData);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      showToast('Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmProductId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmProductId) {
      setIsDeleting(true);
      try {
        await deleteProduct.mutateAsync(confirmProductId);
        showToast('Product deleted successfully', 'success');
        refetch();
      } catch (error) {
        showToast('Failed to delete product', 'error');
      } finally {
        setIsDeleting(false);
        setConfirmOpen(false);
        setConfirmProductId('');
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      setIsPublishing(product.id);
      const updateInput = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId,
        tags: product.tags,
        isActive: !product.isActive,
      };
      await updateProduct.mutateAsync({
        id: product.id,
        input: updateInput,
      });
      showToast(product.isActive ? 'Product unpublished' : 'Product published', 'success');
      refetch();
      setIsPublishing('');
    } catch (error) {
      showToast('Failed to update product status', 'error');
    }
  };

  const products = data?.products.products || [];
  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => formatIndianCompact(product.price),
    },
    { key: 'stock', header: 'Stock' },
    {
      key: 'isActive',
      header: 'Status',
      render: (product: Product) => (
        <Badge variant={product.isActive ? 'success' : 'error'}>
          {product.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(product)}>
            Edit
          </Button>
          <Button
            size="sm"
            disabled={isPublishing !== '' && isPublishing === product.id}
            variant={product.isActive ? 'secondary' : 'primary'}
            onClick={() => handleToggleActive(product)}
          >
            {product.isActive ? 'Unpublish' : 'Publish'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast.show && (
        <ToasterBox
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
          Product Management
        </h1>
        <Button className="!w-auto" onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Create Product
        </Button>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-auto w-full">
        <Table data={filteredProducts} columns={columns} />
      </div>
      {data?.products.pagination && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={data.products.pagination.pages}
            onPageChange={setPage}
          />
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
      >
        <div className="bg-white dark:bg-gray-800 overflow-hidden">
          <Input
            type="text"
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter product name"
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
            placeholder="Describe your product..."
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                step="0.01"
                label="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Stock Quantity"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
                placeholder="0"
              />
            </div>
          </div>
          <div className="mb-4">
            <Select
              label="Category"
              className="w-full"
              value={formData.category}
              onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))}
              placeholder="Select a category"
            />
          </div>

          <ImageUpload
            currentImage={formData.imageUrl}
            onImageUpload={(imageUrl) => setFormData({ ...formData, imageUrl })}
            onRemove={() => setFormData({ ...formData, imageUrl: '' })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              size="md"
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="md"
              className="w-1/2"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Saving...'
                : editingProduct
                ? 'Update Product'
                : 'Create Product'}
            </Button>
          </div>
        </div>
      </Modal>
      <Confirm
        open={confirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmProductId('');
        }}
        loading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  );
};
