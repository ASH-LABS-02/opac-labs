import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { collection, doc, getDocs, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { getMultiFactorResolver, multiFactor, onAuthStateChanged, signInWithEmailAndPassword, signOut, TotpMultiFactorGenerator, type MultiFactorError, type MultiFactorResolver, type TotpSecret, type User } from 'firebase/auth';
import './App.css';

type Inbox = 'projectRequests' | 'contactMessages';
type RecordItem = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  description?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  status?: string;
  createdAt?: { toDate(): Date };
};

const serviceLabels: Record<string, string> = {
  software: 'Software', hardware: 'Hardware', hybrid: 'Software + hardware', iot: 'IoT',
  robotics: 'Robotics', automation: 'Automation', embedded: 'Embedded systems', custom: 'Other',
};
const budgetLabels: Record<string, string> = {
  'not-sure': 'Not sure yet', 'under-5k': 'Under ₹5,000', '5k-10k': '₹5,000–₹10,000',
  '10k-20k': '₹10,000–₹20,000', '20k-plus': '₹20,000+',
};
const timelineLabels: Record<string, string> = {
  '1-week': 'Within 1 week', '2-weeks': 'Within 2 weeks',
  '1-month': 'Within 1 month', flexible: 'Flexible',
};

const requireAdminMfa = import.meta.env.VITE_ADMIN_MFA_REQUIRED === 'true';

function AdminGate({ enrollmentUser }: { enrollmentUser: User | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [setupUnavailable, setSetupUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!enrollmentUser) { setSecret(null); setSetupUnavailable(false); return; }
    setError(''); setSetupUnavailable(false);
    if (multiFactor(enrollmentUser).enrolledFactors.some(factor => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
      setSetupUnavailable(true);
      setError('An authenticator is already enrolled. Sign out and sign in again to use it.');
      return;
    }
    let cancelled = false;
    multiFactor(enrollmentUser).getSession()
      .then(session => TotpMultiFactorGenerator.generateSecret(session))
      .then(nextSecret => { if (!cancelled) setSecret(nextSecret); })
      .catch(() => { if (!cancelled) { setSetupUnavailable(true); setError('Could not start authenticator setup. Ask the Firebase project owner to enable TOTP MFA.'); } });
    return () => { cancelled = true; };
  }, [enrollmentUser]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified || (await credential.user.getIdTokenResult(true)).claims.admin !== true) {
        await signOut(auth);
        throw new Error('This account does not have admin access.');
      }
    } catch (cause) {
      if (cause instanceof Error && 'code' in cause && cause.code === 'auth/multi-factor-auth-required') {
        const nextResolver = getMultiFactorResolver(auth, cause as MultiFactorError);
        if (nextResolver.hints.some(hint => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
          setResolver(nextResolver);
          setError('');
        } else setError('This account needs a supported authenticator factor.');
      } else setError('Could not sign in. Check your details and try again.');
      setPassword('');
    } finally { setBusy(false); }
  };

  const completeChallenge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolver) return;
    const hint = resolver.hints.find(factor => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    if (!hint) return;
    setBusy(true); setError('');
    try {
      await resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code.trim()));
      setResolver(null); setCode('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The authenticator code was not accepted.');
    } finally { setBusy(false); }
  };

  const enrollAuthenticator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enrollmentUser || !secret) return;
    setBusy(true); setError('');
    try {
      await multiFactor(enrollmentUser).enroll(TotpMultiFactorGenerator.assertionForEnrollment(secret, code.trim()), 'OPAC admin');
      setCode('');
      await signOut(auth);
      setError('Authenticator added. Sign in again and enter a fresh code.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not enroll the authenticator.');
    } finally { setBusy(false); }
  };
  return <main className="admin-login">
    <div className="login-card">
      <span className="eyebrow">OPAC LABS / PRIVATE WORKSPACE</span>
      <h1>Project desk<span>.</span></h1>
      {enrollmentUser ? <>
        <p>Secure this admin account with an authenticator app. Add a time based account using this setup key, then enter its six digit code.</p>
        {secret ? <form onSubmit={enrollAuthenticator}>
          <div className="setup-key" aria-label="Authenticator setup key">{secret.secretKey}</div>
          <label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value)} required /></label>
          <button className="primary" disabled={busy}>{busy ? 'Setting up…' : 'Enable authenticator'}</button>
        </form> : !setupUnavailable && <p>Preparing authenticator setup…</p>}
        <button className="secondary" type="button" onClick={() => signOut(auth)}>Sign out</button>
      </> : resolver ? <>
        <p>Enter the six digit code from your authenticator app.</p>
        <form onSubmit={completeChallenge}>
          <label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value)} required autoFocus /></label>
          <button className="primary" disabled={busy}>{busy ? 'Verifying…' : 'Verify and sign in'}</button>
        </form>
        <button className="secondary" type="button" onClick={() => { setResolver(null); setCode(''); setError(''); }}>Use another account</button>
      </> : <>
        <p>Sign in to review briefs and messages.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Enter project desk ↗'}</button>
        </form>
      </>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  </main>;
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [enrollmentUser, setEnrollmentUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Inbox>('projectRequests');
  const [rows, setRows] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  useEffect(() => onAuthStateChanged(auth, async user => {
    if (!user) { setAuthed(false); setEnrollmentUser(null); setChecking(false); return; }
    try {
      const token = await user.getIdTokenResult(true);
      const isAdmin = user.emailVerified && token.claims.admin === true;
      const secondFactor = (token.claims.firebase as { sign_in_second_factor?: string } | undefined)?.sign_in_second_factor;
      const allowed = isAdmin && (!requireAdminMfa || secondFactor === 'totp');
      setAuthed(allowed);
      setEnrollmentUser(isAdmin && !allowed ? user : null);
      if (!isAdmin) await signOut(auth);
    } catch { setAuthed(false); setEnrollmentUser(null); }
    setChecking(false);
  }), []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    setLoading(true); setError('');
    getDocs(query(collection(db, tab), orderBy('createdAt', 'desc'), limit(100))).then(snapshot => {
      const data = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as RecordItem));
      if (active) setRows(data);
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load the inbox.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authed, tab]);

  const changeStatus = async (item: RecordItem, status: string) => {
    setError('');
    setSavingIds(current => new Set(current).add(item.id));
    setRows(current => current.map(row => row.id === item.id ? { ...row, status } : row));
    try {
      await updateDoc(doc(db, tab, item.id), { status });
    } catch (cause) {
      setRows(current => current.map(row => row.id === item.id ? { ...row, status: item.status } : row));
      setError(cause instanceof Error ? cause.message : 'Could not update the status.');
    } finally {
      setSavingIds(current => { const next = new Set(current); next.delete(item.id); return next; });
    }
  };

  if (checking) return <main className="admin-loading">Checking admin access…</main>;
  if (!authed) return <AdminGate enrollmentUser={enrollmentUser} />;
  const isProjects = tab === 'projectRequests';
  const statuses = isProjects ? ['pending', 'reviewing', 'quoted', 'closed'] : ['new', 'read', 'resolved'];

  return <main className="admin-page">
    <div className="admin-shell">
      <header className="admin-hero">
        <div><span className="eyebrow">OPAC LABS / PROJECT DESK</span><h1>Ideas coming in<span>.</span></h1><p>Review enquiries, move projects forward, and keep every conversation in one place.</p></div>
        <button className="signout" onClick={() => signOut(auth)}>Sign out ↗</button>
      </header>
      <nav className="inbox-tabs" aria-label="Admin inboxes">
        <button className={isProjects ? 'active' : ''} onClick={() => setTab('projectRequests')}>Project briefs</button>
        <button className={!isProjects ? 'active' : ''} onClick={() => setTab('contactMessages')}>Messages</button>
      </nav>
      <div className="inbox-heading"><h2>{isProjects ? 'Project briefs' : 'Contact messages'}</h2><span>Latest {rows.length} {rows.length === 1 ? 'record' : 'records'}</span></div>
      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <div className="empty">Loading records…</div> : rows.length === 0 ? <div className="empty">Nothing here yet. New enquiries will appear as they arrive.</div> :
        <div className="record-grid">{rows.map(item => <article className="record" key={item.id}>
          <div className="record-top"><span>{isProjects ? serviceLabels[item.projectType || ''] || 'Project' : 'Message'}</span><time>{item.createdAt?.toDate().toLocaleString() || 'Just received'}</time></div>
          <h3>{item.name || 'New enquiry'}</h3>
          <div className="contact-line"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div>
          <p className="brief">{isProjects ? item.description : item.message}</p>
          {isProjects && <div className="details"><span>Budget: {budgetLabels[item.budget || ''] || '—'}</span><span>Timeline: {timelineLabels[item.timeline || ''] || '—'}</span></div>}
          <div className="record-foot"><span>REF {item.id.slice(0, 8).toUpperCase()}</span><label>{savingIds.has(item.id) ? 'Saving…' : 'Status'} <select value={item.status || statuses[0]} disabled={savingIds.has(item.id)} onChange={event => changeStatus(item, event.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></label></div>
        </article>)}</div>}
    </div>
  </main>;
}
