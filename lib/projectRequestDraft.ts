export type ProjectBriefFields = {
    name: string; email: string; phone: string;
    projectType: string; description: string; budget: string; timeline: string; website: string;
};

const KEY = 'opac-project-request-draft-v1';
const MAX_AGE = 24 * 60 * 60 * 1000;
const LIMITS = { name: 120, email: 254, phone: 30, projectType: 30, description: 3000, budget: 30, timeline: 30 } as const;

export function readProjectBriefDraft(): { fields: Partial<ProjectBriefFields>; source: string } | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        if (raw.length > 16000) throw new Error('Invalid draft');
        const draft = JSON.parse(raw);
        if (draft?.version !== 1 || typeof draft.savedAt !== 'number' ||
            !Number.isFinite(draft.savedAt) || draft.savedAt > Date.now() ||
            Date.now() - draft.savedAt > MAX_AGE || !draft.fields || typeof draft.fields !== 'object') {
            throw new Error('Expired or invalid draft');
        }
        const fields: Partial<ProjectBriefFields> = {};
        for (const [key, max] of Object.entries(LIMITS)) {
            const value = draft.fields[key];
            if (typeof value === 'string') fields[key as keyof typeof LIMITS] = value.slice(0, max);
        }
        return { fields, source: typeof draft.source === 'string' ? draft.source : '' };
    } catch {
        clearProjectBriefDraft();
        return null;
    }
}

export function saveProjectBriefDraft(form: ProjectBriefFields): boolean {
    try {
        // Keep only brief fields in this tab, never tokens, passwords, or the spam trap.
        const fields = Object.fromEntries(Object.entries(LIMITS).map(([key, max]) => [key, form[key as keyof typeof LIMITS].slice(0, max)]));
        sessionStorage.setItem(KEY, JSON.stringify({ version: 1, savedAt: Date.now(), source: window.location.search, fields }));
        return true;
    } catch { return false; }
}

export function clearProjectBriefDraft() {
    try { sessionStorage.removeItem(KEY); } catch { /* Storage may be blocked. */ }
}
