'use client';

import { createContext, useContext, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { postAuthPath } from '@/lib/authRedirect';

type AppUser = { uid: string; email: string; emailVerified: boolean; displayName: string; photoURL?: string | null };
type AuthState = { user: AppUser | null; loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>; refresh: () => void };
const Context = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const session = authClient.useSession();
    const user = useMemo(() => session.data?.user ? {
        uid: session.data.user.id, email: session.data.user.email, emailVerified: session.data.user.emailVerified,
        displayName: session.data.user.name, photoURL: session.data.user.image,
    } : null, [session.data?.user]);
    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await authClient.signIn.email({ email: email.trim(), password });
        if (error) throw new Error(error.message || 'Could not sign in.');
        if (data && 'twoFactorRedirect' in data && data.twoFactorRedirect) {
            window.location.assign(`/two-factor?${new URLSearchParams({ next: postAuthPath() })}`);
            return new Promise<void>(() => {});
        }
        await session.refetch();
    };
    const signUpWithEmail = async (email: string, password: string, name: string) => {
        const callbackURL = `${window.location.origin}/login?${new URLSearchParams({ next: postAuthPath() })}`;
        const { error } = await authClient.signUp.email({ email: email.trim(), password, name: name.trim(), callbackURL });
        if (error) throw new Error(error.message || 'Could not create an account.');
    };
    const signOut = async () => { const { error } = await authClient.signOut(); if (error) throw new Error('Could not sign out.'); await session.refetch(); };
    return <Context.Provider value={{ user, loading: session.isPending, signInWithEmail, signUpWithEmail, signOut, refresh: () => { void session.refetch(); } }}>{children}</Context.Provider>;
}

export function useAuth() {
    const context = useContext(Context);
    if (!context) throw new Error('AuthProvider is required.');
    return context;
}
