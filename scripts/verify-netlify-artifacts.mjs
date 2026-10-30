import { existsSync, lstatSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// A separate --no-build deployment must publish the adapter's curated output.
// The adapter restores .next after its build hooks; that directory contains server files.
const root = resolve('.netlify/static');
const handler = resolve('.netlify/functions-internal/___netlify-server-handler/___netlify-server-handler.mjs');
if (!existsSync(join(root, '_next/static')) || !existsSync(handler)) throw new Error('Run netlify build --context production before deploying.');
if (realpathSync(root) !== root) throw new Error('The public asset directory must not redirect to another directory.');
let files = 0;
function inspect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const file = join(dir, entry.name);
        const path = relative(root, file).replaceAll('\\', '/');
        if (lstatSync(file).isSymbolicLink() || /(^|\/)(server|standalone|node_modules|\.env[^/]*|BUILD_ID|required-server-files\.json)(\/|$)/i.test(path)) {
            throw new Error(`Private build material cannot be published: ${path}`);
        }
        if (entry.isDirectory()) inspect(file);
        else files++;
    }
}
inspect(root);
console.log(`Verified ${files} public assets and a separate server function. Publish .netlify/static only.`);
