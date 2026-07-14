'use client';

import Link from 'next/link';
import Image from 'next/image';
interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice: number | null;
    discount: number;
    image: string;
    stock: string;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="product-card">
            <Link href={`/product/${product.id}`} className="product-card-link">
                {product.discount > 0 && (
                    <span className="product-badge">{product.discount}% OFF</span>
                )}
                <div className="product-image" style={{ position: 'relative' }}>
                    <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-price">
                    {product.originalPrice && (
                        <span className="product-price-original">Rs. {product.originalPrice.toFixed(2)}</span>
                    )}
                    Rs. {product.price.toFixed(2)}
                </div>
                <div className={`product-stock ${product.stock === 'sold-out' ? 'sold-out' : ''}`}>
                    {product.stock === 'sold-out' ? 'Sold Out' : 'In Stock'}
                </div>
            </Link>

        </div>
    );
}
