function safePath(requested: string | null) {
    const fallback = '/my-projects';
    if (!requested?.startsWith('/') || requested.startsWith('//') || requested.includes('\\')) return fallback;
    try {
        const target = new URL(requested, window.location.origin);
        return target.origin === window.location.origin && !['/login', '/register'].includes(target.pathname)
            ? target.pathname + target.search + target.hash
            : fallback;
    } catch { return fallback; }
}

export function postAuthPath() {
    let requested = new URLSearchParams(window.location.search).get('next');
    try {
        requested ||= localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
    } catch { /* Sign-in still works when browser storage is blocked. */ }
    return safePath(requested);
}

export function authPageHref(page: '/login' | '/register') {
    const next = new URLSearchParams(window.location.search).get('next');
    return next ? `${page}?${new URLSearchParams({ next: safePath(next) })}` : page;
}
