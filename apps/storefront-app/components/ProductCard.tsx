'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faHeart as faHeartSolid,
  faBox,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@3asoftwares/utils/client';
import { Button } from '@3asoftwares/ui-library';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock?: number;
    rating?: number;
    reviewCount?: number;
    sellerId?: string;
  };
  onAddToCart?: (product: any) => void;
  onWishlistToggle?: (product: any) => void;
  isInWishlist?: boolean;
  showWishlistButton?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

 export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
   e.currentTarget.style.display = 'none';
   const parent = e.currentTarget.parentElement;
   if (parent && !parent.querySelector('.fallback-icon')) {
     const fallback = document.createElement('div');
     fallback.className =
       'fallback-icon absolute inset-0 flex items-center justify-center text-6xl text-gray-400';
     const icon = document.createElement('i');
     icon.className = 'fa fa-box';
     fallback.appendChild(icon);
     parent.appendChild(fallback);
   }
 };


export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isInWishlist = false,
  showWishlistButton = false,
  variant = 'default',
}) => {
  const isOutOfStock = product.stock === 0;
  const { items } = useCartStore();
  const isInCart = items.some((item) => item.id === product.id);

  const heightClasses = {
    default: 'h-56',
    compact: 'h-32',
    large: 'h-64',
  };


  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-gray-400 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
      <div
        className={`relative ${heightClasses[variant]} bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden`}
      >
        <Link href={`/products/${product.id}`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faBox} className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </Link>

        {showWishlistButton && onWishlistToggle && (
          <button
            onClick={() => onWishlistToggle(product)}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all"
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FontAwesomeIcon
              icon={faHeartSolid}
              className={`w-5 h-5 ${isInWishlist ? 'text-pink-600' : 'text-gray-600'}`}
            />
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold bg-red-500 px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <Link
          href={`/products/${product.id}`}
          className="font-bold text-gray-900 hover:text-gray-600 line-clamp-2 mb-3 text-lg transition-colors truncate-3 line-clamp-3 min-h-20"
        >
          {product.name}
        </Link>

        <div className="flex items-center mb-3 h-5">
          {variant !== 'compact' && (product.rating || product.reviewCount !== 0) && (
            <>
              <div className="flex text-yellow-500 text-base">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating || 0) ? '★' : '☆'}</span>
                ))}
              </div>
              {product.reviewCount !== undefined && (
                <span className="text-xs text-gray-600 ml-2 font-medium">
                  ({product.reviewCount})
                </span>
              )}
            </>
          )}
        </div>

        <p className="text-3xl font-extrabold text-gray-900 mb-4">{formatPrice(product.price)}</p>

        {onAddToCart && (
          <div className="flex justify-center">
            {isOutOfStock ? (
              <div className="text-center text-sm text-red-600 font-semibold py-2">
                Out of Stock
              </div>
            ) : isInCart ? (
              <Button size="md" variant="primary" disabled className="opacity-75 cursor-default">
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                In Cart
              </Button>
            ) : (
              <Button size="md" variant="outline" onClick={() => onAddToCart(product)}>
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
