'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useFirebaseAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);

    if (pathname === '/login' || pathname === '/register' || pathname === '/admin') return null;

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try { await signOut(); setShowUserMenu(false); }
            catch (error) { console.error('Sign out error:', error); }
        }
    };

    return (
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
    );
}
