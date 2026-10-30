import { readFileSync } from 'node:fs';

let openAiKey: string | undefined;

export function getOpenAiKey() {
    // Managed hosts may inject provider keys. Paid calls need our own explicit opt-in.
    if (process.env.OPAC_PAID_AI_ENABLED !== 'true') return '';
    if (openAiKey === undefined) {
        openAiKey = process.env.OPENAI_API_KEY_FILE
            ? readFileSync(process.env.OPENAI_API_KEY_FILE, 'utf8').trim()
            : (process.env.OPENAI_API_KEY || '').trim();
    }
    return openAiKey;
}
