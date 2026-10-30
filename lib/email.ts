import nodemailer from 'nodemailer';
import { appendFile } from 'node:fs/promises';
import { enforceRateLimit } from './serverSecurity';

export async function sendAccountEmail(to: string, subject: string, url: string) {
    await enforceRateLimit('account-email-global', 'all', 200, 86_400_000);
    await enforceRateLimit('account-email-recipient', to.toLowerCase(), 5, 86_400_000);
    if (!process.env.SMTP_HOST) {
        if (process.env.NODE_ENV === 'production') throw new Error('Account email is not configured.');
        if (process.env.OPAC_LOCAL_MAILBOX) await appendFile(process.env.OPAC_LOCAL_MAILBOX, JSON.stringify({ to, subject, url, createdAt: new Date() }) + '\n', { mode: 0o600 });
        else console.info(`[Local account email] ${to} | ${subject} | ${url}`);
        return;
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        requireTLS: process.env.NODE_ENV === 'production' && process.env.SMTP_PORT !== '465' &&
            !(process.env.SMTP_ALLOW_INSECURE_LOCAL === 'true' && ['mailpit', 'localhost', '127.0.0.1'].includes(process.env.SMTP_HOST)),
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
        connectionTimeout: 10000, socketTimeout: 15000,
    });
    await transport.sendMail({ from: process.env.EMAIL_FROM || 'OPAC Labs <local@opac.test>', to, subject,
        text: `${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.\nOPAC Labs`,
    });
}
