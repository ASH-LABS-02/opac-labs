import type { ReactNode } from 'react';

/** A short CSS entrance without delaying content or data fetching. */
export default function PageTransition({ children }: { children: ReactNode }) {
    return <div className="page-enter">{children}</div>;
}
