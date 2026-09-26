import path from 'node:path';

import { resolveStaticExportPaths } from '../../http/resolveStaticExportPaths.js';

/*** Serve static-export files through an ephemeral loopback Bun server. */
export function createStaticExportServer(
  projectRoot: string,
  outputDirectory = 'dist',
): ReturnType<typeof Bun.serve> {
  const outputRoot = path.resolve(projectRoot, outputDirectory);
  return Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    async fetch(request) {
      const candidates = resolveStaticExportPaths(new URL(request.url).pathname);
      for (const candidate of candidates) {
        const targetPath = path.resolve(outputRoot, candidate);
        if (!targetPath.startsWith(`${outputRoot}${path.sep}`) && targetPath !== outputRoot) {
          return new Response('Not found', { status: 404 });
        }
        const file = Bun.file(targetPath);
        if (await file.exists()) return new Response(file);
      }
      return new Response('Not found', { status: 404 });
    },
  });
}
