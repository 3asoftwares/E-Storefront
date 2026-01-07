'use client';

import Link from 'next/link';
import { formatPrice } from '3a-ecommerce-utils/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';

interface ProductCardCompactProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export const ProductCardCompact: React.FC<ProductCardCompactProps> = ({ product }) => {
  return (
    <Link
      href={`/products/${product.id}`}
      className="rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow group"
    >
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-3xl text-gray-400';
                const icon = document.createElement('i');
                icon.className = 'fa fa-box';
                fallback.appendChild(icon);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-400">
            <FontAwesomeIcon icon={faBox} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
};
