'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useProducts } from '@/lib/hooks';
import { useCategories } from '@/lib/hooks/useCategories';
import type { ProductGraphQL } from '@3asoftwares/types';
import { useToast } from '@/lib/hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRedo, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard, ProductCardSkeleton } from '@/components';
import { Button, Input, Select } from '@3asoftwares/ui-library';

type Product = ProductGraphQL;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [featured, setFeatured] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const priceDebounceRef = useRef<NodeJS.Timeout>();
  const { addItem, isInWishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const { showToast } = useToast();

  // Fetch categories from store
  const { categories: categoryList = [] } = useCategories();

  // Build CATEGORIES options from fetched categories
  const CATEGORIES = [
    { value: 'All', label: 'All Categories' },
    ...categoryList.map((cat: { name: string }) => ({
      value: cat.name,
      label: cat.name,
    })),
  ];

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setSearch(tempSearch);
    }, 500);
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [tempSearch]);

  useEffect(() => {
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }
    priceDebounceRef.current = setTimeout(() => {
      setPriceRange(tempPriceRange);
    }, 500);
    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, [tempPriceRange]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    const featuredQuery = searchParams.get('featured');

    if (searchQuery) {
      const decodedSearch = decodeURIComponent(searchQuery);
      setSearch(decodedSearch);
      setTempSearch(decodedSearch);
    } else {
      setSearch('');
      setTempSearch('');
    }

    if (categoryQuery) {
      // Match category case-insensitively against fetched categories
      const decodedCategory = decodeURIComponent(categoryQuery);
      const matchedCategory = categoryList.find(
        (cat: { name: string }) => cat.name.toLowerCase() === decodedCategory.toLowerCase()
      );
      if (matchedCategory) {
        setCategory(matchedCategory.name);
      } else if (categoryList.length === 0) {
        const formattedCategory =
          decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1).toLowerCase();
        setCategory(formattedCategory);
      } else {
        setCategory('All');
      }
    } else {
      setCategory('All');
    }

    setFeatured(featuredQuery === 'true');
  }, [searchParams, categoryList]);

  const filters = {
    ...(search && { search }),
    ...(category !== 'All' && { category }),
    ...(priceRange.min > 0 && { minPrice: priceRange.min }),
    ...(priceRange.max > priceRange.min && { maxPrice: priceRange.max }),
    ...(sortBy && sortBy !== 'newest' && { sortBy }),
    ...(featured && { featured: true }),
  };

  const sortProducts = (items: Product[], sort: string): Product[] => {
    const sorted = [...items];
    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'newest':
      default:
        return sorted;
    }
  };

  const { data, isLoading, error } = useProducts(page, 12, filters);

  useEffect(() => {
    if (data?.products) {
      if (page === 1) {
        // Replace products when on first page (filter changed)
        setAllProducts(data.products);
      } else {
        // Append products for pagination
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = data.products.filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setHasMore(page < (data.pagination.pages || 1));
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [search, category, priceRange.min, priceRange.max, sortBy, featured]);

  const sortedProducts = sortProducts(allProducts, sortBy);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl || '/placeholder.png',
      productId: product.id,
      sellerId: product.sellerId,
    });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || '/placeholder.png',
        addedAt: Date.now(),
      });
      showToast('Added to wishlist', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <div className="sticky top-0 z-10 bg-white/95 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
              Discover Products
            </h1>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-bold text-indigo-700">
              {data?.pagination.total || 0} Products
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-32 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
                Filters
              </h2>

              <Input
                type="text"
                value={tempSearch}
                onChange={(e: any) => {
                  setTempSearch(e.target.value);
                }}
                placeholder="Search products..."
                className="w-full"
              />

              <Select
                value={category}
                label={'Category'}
                onChange={(val: any) => {
                  setCategory(val);
                  setPage(1);
                }}
                className="w-full"
                options={CATEGORIES}
              />

              <div className="my-4">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  Price Range
                </label>
                <div className="flex gap-2 -mb-4">
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    value={tempPriceRange.min === 0 ? '' : tempPriceRange.min}
                    onChange={(e: any) => {
                      const value = e.target.value ? parseInt(e.target.value) : 0;
                      setTempPriceRange({
                        ...tempPriceRange,
                        min: value,
                      });
                    }}
                    placeholder="Min"
                  />
                  <Input
                    size="sm"
                    type="number"
                    min={tempPriceRange.min}
                    value={tempPriceRange.max === 0 ? '' : tempPriceRange.max}
                    onChange={(e: any) => {
                      const value = e.target.value ? parseInt(e.target.value) : 0;
                      setTempPriceRange({
                        ...tempPriceRange,
                        max: value,
                      });
                    }}
                    placeholder="Max"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  ₹{priceRange.min} - ₹{priceRange.max}
                </div>
              </div>

              <Select
                value={sortBy}
                label={'Sort By'}
                onChange={(val: any) => {
                  setSortBy(val);
                  setPage(1);
                }}
                className="w-full"
                options={SORT_OPTIONS}
              />
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    // Reset all filter states
                    setSearch('');
                    setTempSearch('');
                    setCategory('All');
                    setPriceRange({ min: 0, max: 0 });
                    setTempPriceRange({ min: 0, max: 0 });
                    setSortBy('newest');
                    setFeatured(false);
                    setPage(1);
                    // Clear URL parameters
                    router.push('/products');
                  }}
                  className="w-full"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Error loading products. Please try again.
              </div>
            ) : isLoading && page === 1 ? (
              <ProductCardSkeleton count={6} />
            ) : allProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={isInWishlist(product.id)}
                      showWishlistButton={true}
                    />
                  ))}
                </div>

                {hasMore && allProducts.length > 0 && (
                  <div className="flex justify-center mb-12">
                    <Button
                      disabled={isLoading}
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-500 hover:to-gray-300 disabled:opacity-50 text-white font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faChevronDown} className="mr-2" />
                          Load More Products
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!hasMore && allProducts.length > 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-medium">
                      You've reached the end! ({allProducts.length} products shown)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
