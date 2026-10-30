'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { postAuthPath } from '@/lib/authRedirect';
import Auth3DBackground from '@/components/Auth3DBackground';

export default function TwoFactorPage() {
    const [code, setCode] = useState(''), [backup, setBackup] = useState(false);
    const [error, setError] = useState(''), [busy, setBusy] = useState(false);
    async function verify(event: React.FormEvent) {
        event.preventDefault(); if (busy) return; setBusy(true); setError('');
        try {
            const result = backup ? await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice: false })
                : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: false });
            if (result.error) throw new Error('Code not accepted. Try a fresh code.');
            window.location.assign(postAuthPath());
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not verify your code.'); }
        finally { setBusy(false); }
    }
    return <main id="main-content" className="auth-page"><Auth3DBackground /><div className="auth-container"><Link href="/" className="auth-logo">OPAC LABS</Link><div className="auth-card"><div className="auth-header"><h1>One more step.</h1><p>{backup ? 'Enter an unused recovery code.' : 'Enter the code from your authenticator app.'}</p></div><form onSubmit={verify} className="auth-form"><div className="form-group"><label htmlFor="code">{backup ? 'Recovery code' : 'Authenticator code'}</label><input id="code" autoComplete="one-time-code" inputMode={backup ? 'text' : 'numeric'} value={code} onChange={event => setCode(event.target.value)} required maxLength={backup ? 40 : 6} pattern={backup ? undefined : '[0-9]{6}'} autoFocus /></div><button className="auth-submit-btn" disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button></form>{error && <p role="alert">{error}</p>}<button className="auth-reset" onClick={() => { setBackup(!backup); setCode(''); setError(''); }}>{backup ? 'Use authenticator' : 'Use a recovery code'}</button><p><Link href="/login">Back to sign in</Link></p></div></div></main>;
}
