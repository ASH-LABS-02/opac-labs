'use client';

import { useState } from 'react';
import Link from 'next/link';
import Auth3DBackground from '@/components/Auth3DBackground';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

export default function Register() {
    const { signInWithGoogle, signUpWithEmail } = useFirebaseAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signUpWithEmail(email, password, name);
            setSuccess(true);
        } catch (error: unknown) {
            const err = error as { code?: string; message?: string };
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError(err.message || 'Failed to create account');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        try {
            await signInWithGoogle();
        } catch (error: unknown) {
            const err = error as { message?: string };
            setError(err.message || 'Failed to sign up with Google');
        }
    };

    if (success) {
        return (
            <main className="auth-page">
                <Auth3DBackground />
                <div className="auth-container">
                    <div className="auth-logo">OPAC LABS</div>
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1>Verify Your Email</h1>
                            <p>We&apos;ve sent a verification link to your email</p>
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
                                <strong>Check your inbox at:</strong><br />
                                {email}
                            </p>
                            <p style={{ marginBottom: '12px' }}>
                                Click the verification link in the email to activate your account.
                            </p>
                            <p style={{ color: '#666', fontSize: '13px' }}>
                                Didn&apos;t receive the email? Check your spam folder.
                            </p>
                        </div>

                        <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                            Go to Sign In
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <Auth3DBackground />
            <div className="auth-container">
                <div className="auth-logo">OPAC LABS</div>
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

                    <form onSubmit={handleEmailSignUp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
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
                                placeholder="At least 6 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <button onClick={handleGoogleSignUp} className="social-btn google-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="auth-footer">
                        <p>Already have an account? <Link href="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
