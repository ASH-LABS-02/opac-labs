'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

type ProjectRequest = {
  id: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
  status: string;
  createdAt: string | null;
};

const typeNames: Record<string, string> = {
  software: 'Software', erp: 'ERP system', crm: 'CRM system', hardware: 'Hardware', hybrid: 'Software + hardware',
  iot: 'IoT & smart devices', robotics: 'Robotics', automation: 'Automation',
  embedded: 'Embedded systems', custom: 'Custom project',
};

export default function MyProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setRequests([]);
    setError('');
    fetch('/api/request-project', {
      signal: AbortSignal.timeout(15_000),
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load your projects');
      if (active) setRequests(data.requests || []);
    }).catch(cause => { if (active) setError(cause instanceof Error && cause.name === 'TimeoutError' ? 'Loading took too long. Please try again.' : cause instanceof Error ? cause.message : 'Could not load your projects'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, authLoading, retry]);

  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <div className={styles.inner}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>OPAC LABS / YOUR PROJECTS</span>
        <h1>Ideas in motion<span>.</span></h1>
        <p>Track the briefs you have sent to our software and hardware team.</p>
      </div>

      {authLoading || loading ? <div className={styles.notice}>Loading your projects…</div> :
        !user ? <div className={styles.notice}>
          <h2>Sign in to see your projects.</h2>
          <p>Sign in to send a project brief and track its progress here.</p>
          <Link href="/login?next=/my-projects" className={styles.action}>Sign in ↗</Link>
        </div> : error ? <div className={styles.notice} role="alert"><p>{error}</p><button type="button" className={styles.action} onClick={() => setRetry(value => value + 1)}>Try again</button></div> :
          requests.length === 0 ? <div className={styles.notice}>
            <h2>No briefs yet.</h2><p>Your next idea can start here.</p>
            <Link href="/request-project" className={styles.action}>Start a project ↗</Link>
          </div> : <div className={styles.grid}>
            {requests.map((request, index) => <article className={styles.card} key={request.id}>
              <div className={styles.cardTop}><span>{String(index + 1).padStart(2, '0')} / {typeNames[request.projectType] || 'Project'}</span><span className={styles.status}>{{ pending: 'Brief received', reviewing: 'Under review', quoted: 'Quote sent', closed: 'Closed' }[request.status] || request.status}</span></div>
              <h2>{typeNames[request.projectType] || 'Custom project'}</h2>
              <p>{request.description}</p>
              <div className={styles.cardFoot}><span>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Just sent'}</span><span>REF {request.id.slice(0, 8).toUpperCase()}</span></div>
            </article>)}
          </div>}
      <div className={styles.bottom}><span>MORE IDEAS IN THE WORKS?</span><Link href="/request-project" className={styles.action}>Send another brief ↗</Link></div>
    </div>
  </main>;
}
