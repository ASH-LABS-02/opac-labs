'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { reset: () => void }) {
    return <main id="main-content" tabIndex={-1} className="route-status">
        <h1>This page needs another try.</h1>
        <p role="alert">We couldn’t load this page. Please try again.</p>
        <div><button onClick={reset}>Try again</button><Link href="/">Return home</Link></div>
    </main>;
}
