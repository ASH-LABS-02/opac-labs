'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { collections as localCollections } from '@/lib/data';

export type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  discount: number;
  image: string;
  stock: string;
  category: string;
  featured: boolean;
  description: string;
  specs: string[];
  _new?: boolean;
};

// In-memory cache — valid for this page session only
let memCache: { products: Product[]; version: number } | null = null;

export async function invalidateProductCache() {
  memCache = null;
  // Write a new version timestamp to Firestore so all clients know to re-fetch
  await setDoc(doc(db, '_meta', 'products'), { version: Date.now() });
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Check current version from Firestore
        const metaSnap = await getDoc(doc(db, '_meta', 'products'));
        const remoteVersion = metaSnap.exists() ? (metaSnap.data().version as number) : 0;

        // Use memory cache if version matches
        if (memCache && memCache.version === remoteVersion) {
          setProducts(memCache.products);
          setLoading(false);
          return;
        }

        // Fetch fresh from Firestore
        const snap = await getDocs(collection(db, 'products'));
        const result: Product[] = [];
        snap.forEach(d => result.push({ ...d.data(), id: Number(d.id) } as Product));
        result.sort((a, b) => a.id - b.id);

        memCache = { products: result, version: remoteVersion };
        setProducts(result);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { products, loading };
}

export { localCollections as collections };
