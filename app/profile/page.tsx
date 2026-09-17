'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Profile() {
    const { user, loading, signOut } = useFirebaseAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user, loading, router]);

    const getInitial = (name: string) => {
        if (name && name.trim().length > 0) {
            return name.trim().charAt(0).toUpperCase();
        }
        return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setIsSaving(true);
        setSaveSuccess('');
        setSaveError('');

        try {
            await updateProfile(auth.currentUser, {
                displayName: displayName
            });

            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                name: displayName,
                phone: phoneNumber,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setSaveSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(''), 4000);
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            const errorObj = err as { message?: string };
            setSaveError(errorObj.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    if (loading || !user) {
        return (
            <main className="manga-profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="manga-panel" style={{ background: '#ffe87a', textAlign: 'center', padding: '24px 36px' }}>
                    <h2 style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '20px', margin: 0 }}>
                        LOADING PROFILE...
                    </h2>
                </div>
            </main>
        );
    }

    return (
        <main className="manga-profile-page" style={{ padding: '60px 20px 100px' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>

                {/* Page Title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-archivo-black), sans-serif',
                        fontSize: 'clamp(28px, 4vw, 38px)',
                        textTransform: 'uppercase',
                        margin: '0 0 8px 0',
                        letterSpacing: '1px'
                    }}>
                        MY PROFILE
                    </h1>
                    <p style={{ fontFamily: 'var(--font-kalam), cursive', fontSize: '1.1rem', color: '#444', margin: 0 }}>
                        Manage your account details and orders
                    </p>
                </div>

                {/* Notifications */}
                {saveSuccess && (
                    <div style={{
                        background: 'var(--opac-green)',
                        border: '3px solid #111',
                        padding: '12px 18px',
                        boxShadow: '4px 4px 0px #111',
                        marginBottom: '20px',
                        fontFamily: 'var(--font-archivo-black), sans-serif',
                        fontSize: '0.85rem'
                    }}>
                        {saveSuccess}
                    </div>
                )}

                {saveError && (
                    <div style={{
                        background: '#ffcdd2',
                        border: '3px solid #111',
                        padding: '12px 18px',
                        boxShadow: '4px 4px 0px #111',
                        marginBottom: '20px',
                        fontFamily: 'var(--font-archivo-black), sans-serif',
                        fontSize: '0.85rem',
                        color: '#b71c1c'
                    }}>
                        {saveError}
                    </div>
                )}

                {/* Main Profile Card */}
                <div className="manga-panel" style={{ background: '#ffffff', padding: '36px 32px' }}>

                    {/* User Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        paddingBottom: '24px',
                        borderBottom: '3px solid #111',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: '#ffe87a',
                            border: '3px solid #111',
                            boxShadow: '3px 3px 0px #111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontFamily: 'var(--font-archivo-black), sans-serif',
                            color: '#111',
                            flexShrink: 0
                        }}>
                            {getInitial(user.displayName || '')}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '22px', margin: '0 0 4px 0', fontFamily: 'var(--font-archivo-black), sans-serif' }}>
                                {user.displayName || 'Lab User'}
                            </h2>
                            <p style={{ margin: 0, fontFamily: 'var(--font-space-mono), monospace', fontSize: '0.85rem', color: '#555' }}>
                                {user.email}
                            </p>
                        </div>

                        <button
                            className="manga-btn-secondary"
                            onClick={() => setIsEditing(!isEditing)}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                            {isEditing ? 'CANCEL' : 'EDIT'}
                        </button>
                    </div>

                    {/* Edit Form */}
                    {isEditing ? (
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="manga-input"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="manga-input"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <button type="submit" className="manga-btn-primary" disabled={isSaving} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                                <button type="button" className="manga-btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    ) : null}

                    {/* Quick Navigation Action Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link href="/orders" className="manga-btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <span>MY ORDERS & INVOICES</span>
                            <span>→</span>
                        </Link>

                        <Link href="/request-project" className="manga-btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <span>REQUEST CUSTOM PROJECT</span>
                            <span>→</span>
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="manga-btn-danger"
                            style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                        >
                            SIGN OUT
                        </button>
                    </div>

                </div>

            </div>
        </main>
    );
}
