import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Spinner, Textarea } from '@3asoftwares/ui-library';
import { productApi, handleApiError } from '../api/client';
import { ImageUpload } from '../components/ImageUpload';
import { useSellerAuthStore } from '../store/authStore';
import { useCategoryStore } from '../store/categoryStore';

export const SellerUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSellerAuthStore();
  const { fetchCategories, getCategoryOptions } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sellerId: user?.id || '',
      };

      await productApi.create(productData);
      navigate('/products');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Product</h1>
        <p className="text-gray-600">Create and manage your product listings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            disabled={loading}
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={4}
          disabled={loading}
          required
        />

        <div className="grid grid-cols-3 gap-6">
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            required
            disabled={loading}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
            disabled={loading}
          />
          <Select
            label="Category"
            options={getCategoryOptions()}
            value={formData.category}
            onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            placeholder="Select a category"
            disabled={loading}
            className="w-full"
          />
        </div>

        <ImageUpload
          currentImage={formData.imageUrl}
          onImageUpload={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl: imageUrl }))}
          onRemove={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
        />

        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <Spinner /> : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/products')}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
