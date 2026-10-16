// Corre después de `vite build`. Compila src/prerender/entry.tsx para Node,
// renderiza cada página estática y escribe worker/prerendered.generated.js,
// que el Worker importa para servirle HTML con contenido real a los bots.
//
// El HTML va dentro del bundle del Worker y no en dist/ a propósito: un .html
// en dist/ quedaría publicado como asset en su propia URL (contenido
// duplicado indexable).
import { build, loadConfigFromFile } from 'vite';
import react from '@vitejs/plugin-react';
import { rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'worker', 'prerendered.generated.js');

// Sin sesión: así se renderiza lo que ve un visitante anónimo (y Google).
const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  };
};
globalThis.localStorage = memoryStorage();
globalThis.sessionStorage = memoryStorage();

// Reutiliza los alias de vite.config.js, pero no sus plugins (PWA, Tailwind
// y el código del Service Worker no aplican a un build de Node).
const { config } = await loadConfigFromFile({ command: 'build', mode: 'production' }, path.join(root, 'vite.config.js'));
// Dentro del proyecto: las dependencias externas (react, react-router…) se
// resuelven desde node_modules relativo al bundle.
const outDir = path.join(root, 'node_modules', '.cache', 'merku-prerender');

try {
  await build({
    configFile: false,
    root,
    mode: 'production',
    logLevel: 'warn',
    plugins: [react()],
    resolve: { alias: config.resolve.alias },
    build: {
      ssr: path.join(root, 'src/prerender/entry.tsx'),
      outDir,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry.mjs' } },
    },
  });

  const { PAGES, render } = await import(pathToFileURL(path.join(outDir, 'entry.mjs')).href);
  const pages = {};
  for (const [route, { standalone }] of Object.entries(PAGES)) {
    // Con React 19, los <title>/<meta>/<link> del <Helmet> de la página salen
    // dentro del HTML renderizado: se separan para usarlos como <head>.
    const headTags = [];
    const body = render(route).replace(/<title>[^<]*<\/title>|<(?:meta|link)\b[^>]*\/?>/g, (tag) => {
      headTags.push(tag);
      return '';
    });
    if (!headTags.some((t) => t.startsWith('<title>')) || !headTags.some((t) => t.includes('rel="canonical"'))) {
      throw new Error(`Prerender de ${route}: falta <title> o canonical en el <Helmet> de la página`);
    }
    if (body.length < 2000) throw new Error(`Prerender de ${route} salió casi vacío (${body.length} bytes)`);
    pages[route] = { head: headTags.join(''), body, standalone };
    console.log(`prerender ${route}: ${(body.length / 1024).toFixed(1)} KiB`);
  }

  await writeFile(
    outFile,
    `// Generado por scripts/prerender.mjs en cada build. No editar a mano.\nexport default ${JSON.stringify(pages)};\n`,
  );
} finally {
  await rm(outDir, { recursive: true, force: true });
}
