'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useState, useEffect, useRef } from 'react';
import { products } from '@/lib/data';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useFirebaseAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);

    // Close search on Escape — must be before any early return
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    if (pathname === '/login' || pathname === '/register' || pathname === '/admin') return null;

    const results = query.trim().length > 1
        ? products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 6)
        : [];

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery('');
    };

    const goToProduct = (id: number) => {
        closeSearch();
        router.push(`/product/${id}`);
    };

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try { await signOut(); setShowUserMenu(false); }
            catch (error) { console.error('Sign out error:', error); }
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link href="/" className="logo">OPAC LABS</Link>
                        <div className="nav-links">
                            <Link href="/student-projects" className={isActive('/student-projects') ? 'active' : ''}>Student Projects</Link>
                            <Link href="/build-project" className={isActive('/build-project') ? 'active' : ''}>Build Your Own</Link>
                            <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
                        </div>
                    </div>
                    <div className="nav-right">
                        <button className="icon-btn" aria-label="Search" onClick={openSearch}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button className="icon-btn" aria-label="Account" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                            </button>
                            {showUserMenu && (
                                <div className="user-menu">
                                    {user ? (
                                        <>
                                            <div className="user-menu-header">
                                                <p>{user.displayName || 'User'}</p>
                                                <p style={{ fontSize: '12px', color: '#999' }}>{user.email}</p>
                                            </div>
                                            <Link href="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>My Profile</Link>
                                            <Link href="/orders" className="user-menu-item" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                                            <button onClick={handleSignOut} className="user-menu-item">Sign Out</button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" className="user-menu-item" onClick={() => setShowUserMenu(false)}>Sign In</Link>
                                            <Link href="/register" className="user-menu-item" onClick={() => setShowUserMenu(false)}>Create Account</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </nav>

            {/* Search overlay */}
            {searchOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)' }} onClick={closeSearch}>
                    <div style={{ background: '#fff', maxWidth: '640px', margin: '80px auto 0', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        {/* Input row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: results.length > 0 ? '1px solid #e5e5e5' : 'none' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search products, categories..."
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#111', fontFamily: 'inherit', background: 'transparent' }}
                            />
                            {query && (
                                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '4px', display: 'flex' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            )}
                            <button onClick={closeSearch} style={{ background: 'none', border: '1px solid #e5e5e5', cursor: 'pointer', color: '#999', padding: '4px 8px', fontSize: '12px' }}>
                                Esc
                            </button>
                        </div>

                        {/* Results */}
                        {results.length > 0 && (
                            <div>
                                {results.map((p, i) => (
                                    <button key={p.id} onClick={() => goToProduct(p.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', background: 'none', border: 'none', borderBottom: i < results.length - 1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fafafa'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
                                        <div style={{ width: 40, height: 40, background: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                            <div style={{ fontSize: '12px', color: '#999', textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</div>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', flexShrink: 0 }}>Rs. {p.price}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No results */}
                        {query.trim().length > 1 && results.length === 0 && (
                            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                No products found for &quot;{query}&quot;
                            </div>
                        )}

                        {/* Empty state hint */}
                        {query.trim().length <= 1 && (
                            <div style={{ padding: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Arduino', 'ESP32', 'Sensors', 'Kits', 'Cables'].map(tag => (
                                    <button key={tag} onClick={() => setQuery(tag)} style={{ padding: '6px 14px', background: '#f5f5f5', border: '1px solid #e5e5e5', fontSize: '13px', color: '#555', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e5e5'; }}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
