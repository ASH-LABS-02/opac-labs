import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="not-found-page">
            <h1>This circuit<br />leads nowhere.</h1>
            <p>We couldn’t find that page. Head back to the lab and find your next project.</p>
            <Link href="/" className="manga-btn-primary">Back to OPAC Labs ↗</Link>
        </main>
    );
}
