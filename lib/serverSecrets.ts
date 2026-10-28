import { readFileSync } from 'node:fs';

let openAiKey: string | undefined;

export function getOpenAiKey() {
    if (openAiKey === undefined) {
        openAiKey = process.env.OPENAI_API_KEY_FILE
            ? readFileSync(process.env.OPENAI_API_KEY_FILE, 'utf8').trim()
            : (process.env.OPENAI_API_KEY || '').trim();
    }
    return openAiKey;
}
