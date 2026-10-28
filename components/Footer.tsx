'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; 2026 OPAC Labs. Software and hardware projects, built together.</p>
            </div>
        </footer>
    );
}
