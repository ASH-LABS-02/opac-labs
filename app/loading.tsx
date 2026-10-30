export default function Loading() {
    return <main id="main-content" tabIndex={-1} className="route-status" aria-busy="true">
        <span className="route-progress" aria-hidden="true" />
        <p role="status">Opening your next page…</p>
    </main>;
}
