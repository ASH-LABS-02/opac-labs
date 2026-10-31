import { flushTelegramNotifications } from '../../lib/notifications';

async function retryTelegramNotifications() {
    try { await flushTelegramNotifications(); }
    catch { throw new Error('Telegram delivery deferred; saved enquiries will be retried.'); }
}

export default retryTelegramNotifications;
export const config = { schedule: '*/5 * * * *' };
