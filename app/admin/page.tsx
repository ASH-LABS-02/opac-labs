'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authClient } from '@/lib/auth-client';
import './admin.css';

type Inbox = 'projectRequests' | 'contactMessages';
type Item = { id: string; name: string; email: string; phone?: string; projectType?: string; description?: string; message?: string; budget?: string; timeline?: string; status: string; createdAt: string };
type Access = { allowed: boolean; enrolled: boolean };
const services: Record<string, string> = { software: 'Software', hardware: 'Hardware', hybrid: 'Software + hardware', erp: 'ERP', crm: 'CRM', iot: 'IoT', robotics: 'Robotics', automation: 'Automation', embedded: 'Embedded systems', custom: 'Custom project' };

const budgets: Record<string, string> = { 'not-sure': 'Not sure yet', 'under-5k': 'Under ₹5,000', '5k-10k': '₹5,000–₹10,000', '10k-20k': '₹10,000–₹20,000', '20k-plus': '₹20,000+' };
const timelines: Record<string, string> = { '1-week': 'Within 1 week', '2-weeks': 'Within 2 weeks', '1-month': 'Within 1 month', flexible: 'Flexible' };

export default function AdminPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const [access, setAccess] = useState<Access | null>(null), [checking, setChecking] = useState(true);
    const [tab, setTab] = useState<Inbox>('projectRequests'), [rows, setRows] = useState<Item[]>([]);
    const [error, setError] = useState(''), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false);
    const [password, setPassword] = useState(''), [code, setCode] = useState('');
    const [setup, setSetup] = useState<{ key: string; backupCodes: string[] } | null>(null);
    const [saving, setSaving] = useState<string[]>([]);
    useEffect(() => { if (new URLSearchParams(window.location.search).get('inbox') === 'messages') setTab('contactMessages'); }, []);
    const checkAccess = useCallback(async () => {
        setChecking(true);
        try {
            const response = await fetch('/api/admin/access', { cache: 'no-store' });
            if (response.status === 403) { setAccess(null); setError('This account does not have staff access.'); return; }
            if (!response.ok) throw new Error('Could not check staff access.');
            setAccess(await response.json()); setError('');
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not check access.'); }
        finally { setChecking(false); }
    }, []);
    useEffect(() => { if (!authLoading && user) void checkAccess(); else if (!authLoading) setChecking(false); }, [authLoading, user, checkAccess]);
    const loadInbox = useCallback(async () => {
        if (!access?.allowed) return; setLoading(true); setError('');
        try {
            const response = await fetch(`/api/admin/inbox?collection=${tab}`, { cache: 'no-store' });
            if (response.status === 403) { setAccess({ allowed: false, enrolled: true }); throw new Error('Verify your authenticator again to continue.'); }
            if (!response.ok) throw new Error('Could not load the inbox.');
            setRows((await response.json()).rows);
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load the inbox.'); }
        finally { setLoading(false); }
    }, [tab, access?.allowed]);
    useEffect(() => { void loadInbox(); }, [loadInbox]);
    async function enable(event: React.FormEvent) {
        event.preventDefault(); if (busy) return; setBusy(true); setError('');
        try {
            const result = await authClient.twoFactor.enable({ password, issuer: 'OPAC Labs' });
            if (result.error || !result.data || !('totpURI' in result.data)) throw new Error('Could not start setup. Check your password.');
            setSetup({ key: new URL(result.data.totpURI).searchParams.get('secret') || '', backupCodes: result.data.backupCodes });
            setPassword('');
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not start setup.'); }
        finally { setBusy(false); }
    }
    async function verify(event: React.FormEvent) {
        event.preventDefault(); if (busy) return; setBusy(true); setError('');
        try {
            const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
            if (result.error) throw new Error('Code not accepted. Try a fresh code.');
            setCode(''); await checkAccess();
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not verify your code.'); }
        finally { setBusy(false); }
    }
    async function changeStatus(item: Item, status: string) {
        setSaving(current => [...current, item.id]); setError('');
        try {
            const response = await fetch('/api/admin/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collection: tab, id: item.id, status }) });
            if (response.status === 403) { setAccess({ allowed: false, enrolled: true }); throw new Error('Verify your authenticator again to continue.'); }
            if (!response.ok) throw new Error('Could not update the status.');
            setRows(current => current.map(row => row.id === item.id ? { ...row, status } : row));
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update status.'); }
        finally { setSaving(current => current.filter(id => id !== item.id)); }
    }
    const project = tab === 'projectRequests';
    const statuses = project ? ['pending', 'reviewing', 'quoted', 'closed'] : ['new', 'read', 'resolved'];
    return <div className="opac-admin"><main id="main-content" className={access?.allowed ? 'admin-page' : 'admin-login'}>
        {authLoading || checking ? <p>Checking staff access…</p> : !user ? <div className="login-card"><span className="eyebrow">OPAC LABS / PRIVATE WORKSPACE</span><h1>Project desk.</h1><p>Sign in with your verified staff account to review briefs and messages.</p><Link href="/login?next=/admin" className="primary">Sign in ↗</Link></div> : !access?.allowed ? <div className="login-card"><span className="eyebrow">OPAC LABS / PRIVATE WORKSPACE</span><h1>{access ? 'Secure your desk.' : 'Staff only.'}</h1>{access && <>{!access.enrolled && !setup ? <form onSubmit={enable}><p>Connect an authenticator app to protect incoming project details.</p><label>Current password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label><button className="primary" disabled={busy}>Set up authenticator</button></form> : <><p>{setup ? 'Add this key to an authenticator app. Save the recovery codes somewhere private before continuing.' : 'Enter a fresh authenticator code. Staff verification lasts 30 minutes.'}</p>{setup && <><div className="setup-key" aria-label="Authenticator setup key">{setup.key}</div><details><summary>Recovery codes — save these now</summary><div className="setup-key">{setup.backupCodes.join('\n')}</div></details></>}<form onSubmit={verify}><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value)} required /></label><button className="primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify and enter'}</button></form></>}</>}{error && <p className="error" role="alert">{error}</p>}<button className="secondary" onClick={() => { void signOut(); setAccess(null); }}>Sign out</button></div> : <div className="admin-shell"><header className="admin-hero"><div><span className="eyebrow">OPAC LABS / PROJECT DESK</span><h1>Ideas coming in<span>.</span></h1><p>Review enquiries and move projects forward.</p></div><button className="signout" onClick={() => { void signOut(); setAccess(null); }}>Sign out ↗</button></header><nav className="inbox-tabs" aria-label="Staff inboxes"><button className={project ? 'active' : ''} onClick={() => setTab('projectRequests')}>Project briefs</button><button className={!project ? 'active' : ''} onClick={() => setTab('contactMessages')}>Messages</button><button onClick={() => { void loadInbox(); }}>Refresh ↻</button></nav><div className="inbox-heading"><h2>{project ? 'Project briefs' : 'Contact messages'}</h2><span>Latest {rows.length} records</span></div>{error && <p className="error" role="alert">{error}</p>}{loading ? <div className="empty">Loading records…</div> : !rows.length ? <div className="empty">Nothing here yet. New enquiries appear here.</div> : <div className="record-grid">{rows.map(item => <article className="record" key={item.id}><div className="record-top"><span>{project ? services[item.projectType || ''] || 'Project' : 'Message'}</span><time>{new Date(item.createdAt).toLocaleString()}</time></div><h3>{item.name}</h3><div className="contact-line"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div><p className="brief">{project ? item.description : item.message}</p>{project && <div className="details"><span>Budget: {budgets[item.budget || ''] || item.budget}</span><span>Timeline: {timelines[item.timeline || ''] || item.timeline}</span></div>}<div className="record-foot"><span>REF {item.id.slice(0, 8).toUpperCase()}</span><label>{saving.includes(item.id) ? 'Saving…' : 'Status'}<select value={item.status || statuses[0]} disabled={saving.includes(item.id)} onChange={event => { void changeStatus(item, event.target.value); }}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></label></div></article>)}</div>}</div>}
    </main></div>;
}
