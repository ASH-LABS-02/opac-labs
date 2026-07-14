'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Profile() {
    const { user, loading } = useFirebaseAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <main>
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <p>Loading...</p>
                </div>
            </main>
        );
    }

    const getInitial = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <main>
            <div className="container" style={{ padding: '80px 24px 120px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '500', marginBottom: '48px', textAlign: 'center' }}>
                        My Profile
                    </h1>
                    
                    <div style={{ 
                        border: '1px solid #e5e5e5', 
                        padding: '48px', 
                        background: '#ffffff',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#1a1a1a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: '600',
                            margin: '0 auto 32px'
                        }}>
                            {getInitial(user.displayName || '')}
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Name
                            </div>
                            <div style={{ fontSize: '18px', color: '#1a1a1a', fontWeight: '500' }}>
                                {user.displayName || 'Not provided'}
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Email
                            </div>
                            <div style={{ fontSize: '18px', color: '#1a1a1a', fontWeight: '500' }}>
                                {user.email}
                            </div>
                        </div>
                        
                        <button 
                            className="btn-primary"
                            style={{ maxWidth: '300px', margin: '0 auto' }}
                            onClick={() => alert('Edit profile feature coming soon!')}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
