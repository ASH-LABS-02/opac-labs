const DAY_MS = 24 * 60 * 60 * 1000;

export function expiresAt(setting: string, defaultDays: number) {
    const raw = process.env[setting];
    const days = raw === undefined ? defaultDays : Number(raw);
    if (!Number.isInteger(days) || days < 1 || days > 3650) {
        throw new Error(`${setting} must be an integer from 1 to 3650 days.`);
    }
    return new Date(Date.now() + days * DAY_MS);
}
