'use client';

import { use } from 'react';
import Image from 'next/image';
import { useProducts } from '@/lib/useProducts';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { products } = useProducts();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return (
            <main>
                <div className="container">
                    <p>Product not found</p>
                </div>
            </main>
        );
    }


    return (
        <main>
            <div className="container">
                <div className="product-detail">
                    <div style={{ position: 'relative' }}>
                        <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={600}
                            height={500}
                            className="product-detail-image"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <div className="product-detail-info">
                        <h1>{product.name}</h1>
                        <div className="product-detail-price">Rs. {product.price.toFixed(2)}</div>
                        <div className="product-detail-description">{product.description}</div>
                        <div className="product-detail-stock">
                            {product.stock === 'sold-out' ? 'Sold Out' : 'In Stock'}
                        </div>

                        <div className="product-specs">
                            <h3>Specifications</h3>
                            <ul>
                                {product.specs.map((spec, index) => (
                                    <li key={index}>{spec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
