'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Auth3DBackground from '@/components/Auth3DBackground';
import { useAuth } from '@/contexts/AuthContext';
import { authClient } from '@/lib/auth-client';
import { authPageHref, postAuthPath } from '@/lib/authRedirect';

export default function Login() {
    const router = useRouter();
    const { signInWithEmail, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registerHref, setRegisterHref] = useState('/register');

    useEffect(() => { setRegisterHref(authPageHref('/register')); }, []);

    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        setNotice('');
        setIsLoading(true);

        try {
            await signInWithEmail(email, password);
            
            router.push(postAuthPath());
        } catch {
            setError('Could not sign in. Check your details and try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const handlePasswordReset = async () => {
        if (isLoading) return;
        setError('');
        setNotice('');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Enter your email address above, then select Forgot password.');
            return;
        }
        setIsLoading(true);
        setIsResetting(true);
        try {
            const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: `${window.location.origin}/reset-password` });
            if (result.error) throw new Error('Could not request a reset link.');
            setNotice('If an account uses that email, you will receive a password reset link.');
        } catch (error) {
            if ((error as { code?: string }).code === 'auth/user-not-found') {
                setNotice('If an account uses that email, you will receive a password reset link.');
            } else setError('Could not request a reset link. Please try again later.');
        } finally { setIsLoading(false); setIsResetting(false); }
    };

    return (
        <main id="main-content" tabIndex={-1} className="auth-page">
            <Auth3DBackground />
            <div className="auth-container">
                <Link href="/" className="auth-logo auth-logo-link" aria-label="OPAC Labs home">OPAC LABS</Link>
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your OPAC Labs account</p>
                    </div>

                    {error && (
                        <div role="alert" style={{
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
                    {notice && <p className="auth-notice" role="status">{notice}</p>}
                    <p className="auth-notice">Previously used Google sign-in? Choose Forgot password to set a password for your account.</p>

                    <form method="post" onSubmit={handleEmailSignIn} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="email" maxLength={254}
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
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button type="button" className="auth-reset" disabled={isLoading || authLoading} onClick={handlePasswordReset}>{isResetting ? 'Sending reset link...' : 'Forgot password?'}</button>
                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={isLoading || authLoading}
                        >
                            {isLoading && !isResetting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>


                    <div className="auth-footer">
                        <p>Don&apos;t have an account? <Link href={registerHref}>Sign up</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
