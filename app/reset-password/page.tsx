'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import Auth3DBackground from '@/components/Auth3DBackground';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
    const [error, setError] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
    async function reset(event: React.FormEvent) {
        event.preventDefault(); if (busy) return; setError('');
        if (password !== confirm) { setError('Passwords must match.'); return; }
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) { setError('This reset link is invalid. Request a new one from Sign in.'); return; }
        setBusy(true);
        try {
            const result = await authClient.resetPassword({ newPassword: password, token });
            if (result.error) throw new Error('This reset link is invalid or expired. Request a new one.');
            setDone(true); setPassword(''); setConfirm('');
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not reset password.'); }
        finally { setBusy(false); }
    }
    return <main id="main-content" className="auth-page"><Auth3DBackground /><div className="auth-container"><Link href="/" className="auth-logo">OPAC LABS</Link><div className="auth-card"><div className="auth-header"><h1>{done ? 'Fresh start.' : 'Reset password'}</h1><p>{done ? 'Your password is updated. Sign in again to continue.' : 'Choose a password with at least 12 characters.'}</p></div>{done ? <Link href="/login" className="auth-submit-btn">Sign in</Link> : <form className="auth-form" onSubmit={reset}><div className="form-group"><label htmlFor="password">New password</label><input id="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required /></div><div className="form-group"><label htmlFor="confirm">Confirm password</label><input id="confirm" type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} required /></div><button className="auth-submit-btn" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>}{error && <p role="alert">{error}</p>}</div></div></main>;
}
