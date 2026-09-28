import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const engineRoot = process.env.REO_ENGINE_PATH || path.resolve(appRoot, '../../Reo-Engine');

if (!existsSync(engineRoot)) {
    throw new Error(
        `Reo-Engine tidak ditemukan di ${engineRoot}. Set REO_ENGINE_PATH ke folder engine.`,
    );
}

const pdfjsSource = path.join(appRoot, 'node_modules', 'pdfjs-dist');
const pdfjsTarget = path.join(appRoot, 'public', 'build', 'pdfjs');
const pdfjsAssetFolders = ['wasm', 'cmaps', 'standard_fonts', 'iccs'];

function copyPdfjsAssets() {
    mkdirSync(pdfjsTarget, { recursive: true });
    for (const folder of pdfjsAssetFolders) {
        cpSync(path.join(pdfjsSource, folder), path.join(pdfjsTarget, folder), { recursive: true });
    }
}

const pdfjsAssetsPlugin = {
    name: 'reo-pdfjs-assets',
    configureServer: copyPdfjsAssets,
    writeBundle: copyPdfjsAssets,
};

export default defineConfig({
    plugins: [
        pdfjsAssetsPlugin,
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@reo-engine/core': path.join(engineRoot, 'packages/core/src/index.ts'),
            '@reo-engine/parser-pdf': path.join(engineRoot, 'packages/parser-pdf/src/index.ts'),
            '@reo-engine/renderer-web': path.join(engineRoot, 'packages/renderer-web/src/index.ts'),
        },
    },
    server: {
        watch: {
            ignored: ['**/public/models/**'],
        },
    },
});
