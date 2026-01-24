import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { rmSync } from 'fs';

// Clean dist
rmSync('./dist', { recursive: true, force: true });

const shared = {
  entryPoints: ['src/plugin.ts', 'src/setup.ts'],
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: 'node18',
  packages: 'external', // Don't bundle dependencies
};

// Build ESM
await esbuild.build({
  ...shared,
  format: 'esm',
  outdir: 'dist',
});

// Build CJS with banner shim for import.meta.url
await esbuild.build({
  ...shared,
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
  outdir: 'dist',
  banner: {
    js: `const importMetaUrl = require('url').pathToFileURL(__filename).href;`,
  },
  define: {
    'import.meta.url': 'importMetaUrl',
  },
});

// Generate type declarations
execSync('tsc --emitDeclarationOnly', { stdio: 'inherit' });

console.log('Build complete!');
