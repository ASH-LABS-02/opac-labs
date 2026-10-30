'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';

const links = [
    { href: '/student-projects', label: 'Student Projects' },
    { href: '/our-works', label: 'Our Work' },
    { href: '/services/erp-crm', label: 'ERP & CRM' },
    { href: '/build-project', label: 'Plan Your Project' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [menu, setMenu] = useState<'account' | 'mobile' | null>(null);
    const [menuError, setMenuError] = useState('');
    const [menuPath, setMenuPath] = useState(pathname);
    const navRef = useRef<HTMLElement>(null);
    const accountRef = useRef<HTMLButtonElement>(null);
    const mobileRef = useRef<HTMLButtonElement>(null);
    const openMenu = menuPath === pathname ? menu : null;
    const toggle = (next: 'account' | 'mobile') => {
        setMenuError('');
        setMenuPath(pathname);
        setMenu(openMenu === next ? null : next);
    };

    useEffect(() => {
        if (!openMenu) return;
        const closeOutside = (event: PointerEvent) => {
            if (!navRef.current?.contains(event.target as Node)) setMenu(null);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setMenu(null);
            (openMenu === 'account' ? accountRef : mobileRef).current?.focus();
        };
        document.addEventListener('pointerdown', closeOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [openMenu]);

    if (['/login', '/register', '/admin'].includes(pathname)) return null;

    const renderLinks = () => links.map(({ href, label }) => (
        <Link key={href} href={href} aria-current={pathname.startsWith(href) ? 'page' : undefined} onClick={() => setMenu(null)}>{label}</Link>
    ));

    return (
        <nav ref={navRef} className={styles.nav} aria-label="Main navigation">
            <div className={styles.bar}>
                <Link href="/" className={styles.logo} onClick={() => setMenu(null)}>OPAC LABS<span aria-hidden="true">.</span></Link>
                <div className={styles.links}>{renderLinks()}</div>
                <div className={styles.controls}>
                    <button ref={accountRef} className={styles.iconButton} aria-label="Account menu" aria-expanded={openMenu === 'account'} aria-controls="account-links" onClick={() => toggle('account')}>
                        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </button>
                    <button ref={mobileRef} className={styles.mobileToggle} aria-label={openMenu === 'mobile' ? 'Close navigation' : 'Open navigation'} aria-expanded={openMenu === 'mobile'} aria-controls="mobile-links" onClick={() => toggle('mobile')}>
                        {openMenu === 'mobile' ? <span aria-hidden="true">×</span> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>}
                    </button>
                    {openMenu === 'account' && <div id="account-links" className={styles.dropdown}>
                        {user ? <>
                            <div className={styles.user}><strong>{user.displayName || 'Your account'}</strong><span>{user.email}</span></div>
                            <Link href="/profile" onClick={() => setMenu(null)}>My profile</Link>
                            <Link href="/my-projects" onClick={() => setMenu(null)}>My projects</Link>
                            <button onClick={async () => { try { await signOut(); setMenu(null); } catch { setMenuError('Could not sign out. Please try again.'); } }}>Sign out</button>
                            {menuError && <p role="alert">{menuError}</p>}
                        </> : <>
                            <Link href={pathname === '/request-project' ? '/login?next=/request-project' : '/login'} onClick={() => setMenu(null)}>Sign in</Link>
                            <Link href={pathname === '/request-project' ? '/register?next=/request-project' : '/register'} onClick={() => setMenu(null)}>Create account</Link>
                        </>}
                    </div>}
                </div>
            </div>
            {openMenu === 'mobile' && <div id="mobile-links" className={styles.mobileLinks}>{renderLinks()}</div>}
        </nav>
    );
}
