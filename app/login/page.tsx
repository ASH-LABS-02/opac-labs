'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Auth3DBackground from '@/components/Auth3DBackground';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

function safePostLoginPath() {
    const requested = localStorage.getItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterLogin');
    if (!requested?.startsWith('/') || requested.startsWith('//') || requested.includes('\\')) return '/';
    try {
        const target = new URL(requested, window.location.origin);
        return target.origin === window.location.origin && target.pathname !== '/login'
            ? target.pathname + target.search + target.hash
            : '/';
    } catch {
        return '/';
    }
}

export default function Login() {
    const router = useRouter();
    const { signInWithGoogle, signInWithEmail } = useFirebaseAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signInWithEmail(email, password);
            
            router.push(safePostLoginPath());
        } catch {
            setError('Could not sign in. Check your details and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isLoading) return;
        
        try {
            // Do not set state before the popup to prevent browser popup blockers
            await signInWithGoogle();
            
            setIsLoading(true);
            router.push(safePostLoginPath());
        } catch (error: unknown) {
            const err = error as { code?: string };
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked by your browser. Please allow popups for this site and try again.');
            } else if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
                setError('Could not sign in with Google. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <Auth3DBackground />
            <div className="auth-container">
                <div className="auth-logo">OPAC LABS</div>
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your OPAC Labs account</p>
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '12px', 
                            background: '#fee', 
                            border: '1px solid #fcc',
                            marginBottom: '20px',
                            fontSize: '14px',
                            color: '#c33'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailSignIn} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <button onClick={handleGoogleSignIn} className="social-btn google-btn" disabled={isLoading}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="auth-footer">
                        <p>Don&apos;t have an account? <Link href="/register">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
