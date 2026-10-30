'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Auth3DBackground from '@/components/Auth3DBackground';
import { useAuth } from '@/contexts/AuthContext';
import { authPageHref } from '@/lib/authRedirect';
import { authClient } from '@/lib/auth-client';

export default function Register() {
    const { signUpWithEmail, loading: authLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginHref, setLoginHref] = useState('/login');
    const [resent, setResent] = useState(false);

    useEffect(() => { setLoginHref(authPageHref('/login')); }, []);

    async function resendVerification() {
        if (isLoading) return;
        setIsLoading(true); setError('');
        try {
            const result = await authClient.sendVerificationEmail({ email, callbackURL: `${window.location.origin}${loginHref}` });
            if (result.error) throw new Error('Could not resend the email. Please try again later.');
            setResent(true);
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not resend verification.'); }
        finally { setIsLoading(false); }
    }

    const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 12) {
            setError('Password must be at least 12 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signUpWithEmail(email.trim(), password, name.trim());
            setSuccess(true);
        } catch (error: unknown) {
            const err = error as { code?: string };
            if (err.code === 'auth/email-already-in-use') {
                setError('Could not create an account with those details. If you already have one, sign in.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Could not create an account. Please check your details and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    if (success) {
        return (
            <main id="main-content" tabIndex={-1} className="auth-page">
                <Auth3DBackground />
                <div className="auth-container">
                    <Link href="/" className="auth-logo auth-logo-link" aria-label="OPAC Labs home">OPAC LABS</Link>
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1>{'Verify Your Email'}</h1>
                            <p>{'Check your email for a verification link'}</p>
                        </div>

                        <div style={{ 
                            padding: '20px', 
                            background: '#f0f9ff', 
                            border: '1px solid #bae6fd',
                            marginBottom: '20px',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            <p style={{ marginBottom: '12px' }}>
                                <strong>{'Check your inbox at:'}</strong><br />
                                {email}
                            </p>
                            <p style={{ marginBottom: '12px' }}>
                                {'Click the verification link in the email to activate your account.'}
                            </p>
                            <p style={{ color: '#666', fontSize: '13px' }}>
                                {'Didn\'t receive the email? Check your spam folder.'}
                            </p>
                        </div>

                        <Link href={loginHref} className="btn-primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                            Go to Sign In
                        </Link>
                    <button type="button" className="auth-reset" disabled={isLoading} onClick={resendVerification}>{isLoading ? 'Requesting…' : 'Resend verification email'}</button>
                        {resent && <p role="status">If your account needs verification, another link will arrive shortly. Check spam too.</p>}
                        {error && <p role="alert">{error}</p>}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main id="main-content" tabIndex={-1} className="auth-page">
            <Auth3DBackground />
            <div className="auth-container">
                <Link href="/" className="auth-logo auth-logo-link" aria-label="OPAC Labs home">OPAC LABS</Link>
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join OPAC Labs and start building</p>
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

                    <form method="post" onSubmit={handleEmailSignUp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                autoComplete="name" maxLength={120}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

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
                                autoComplete="new-password" minLength={12} maxLength={128}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 12 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password" minLength={12} maxLength={128}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={isLoading || authLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>


                    <div className="auth-footer">
                        <p>Already have an account? <Link href={loginHref}>Sign in</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
