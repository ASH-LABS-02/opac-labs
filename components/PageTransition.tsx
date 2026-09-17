import type { ReactNode } from 'react';

/** CSS-only entrance; the route is rendered immediately and revealed in 340 ms. */
export default function PageTransition({ children }: { children: ReactNode }) {
    return <div className="page-enter">{children}</div>;
}
