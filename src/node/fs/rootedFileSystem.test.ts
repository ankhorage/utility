import { expect, test } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  readDirectoryWithinRoot,
  readTextFileWithinRoot,
  resolveFileSystemPathWithinRoot,
  writeFileWithinRoot,
} from './index.js';

test('resolves contained filesystem paths and rejects lexical escapes', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'ankhorage-utility-fs-'));
  const root = path.join(parent, 'project');

  try {
    await mkdir(root);
    await writeFile(path.join(root, 'inside.txt'), 'inside');

    expect(resolveFileSystemPathWithinRoot(root, 'inside.txt')).toBe(path.join(root, 'inside.txt'));
    expect(() => resolveFileSystemPathWithinRoot(root, '../outside.txt')).toThrow(
      'Path escaped the allowed root',
    );
    expect(() => resolveFileSystemPathWithinRoot(root, path.join(parent, 'outside.txt'))).toThrow(
      'Path escaped the allowed root',
    );
  } finally {
    await rm(parent, { force: true, recursive: true });
  }
});

test('rejects symlink escapes for reads and writes', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'ankhorage-utility-fs-'));
  const root = path.join(parent, 'project');
  const outside = path.join(parent, 'outside');

  try {
    await mkdir(root);
    await mkdir(outside);
    await writeFile(path.join(outside, 'secret.txt'), 'secret');
    await symlink(
      outside,
      path.join(root, 'escape'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    expect(() =>
      readTextFileWithinRoot({
        rootPath: root,
        filePath: 'escape/secret.txt',
      }),
    ).toThrow('Path escaped the allowed root');

    expect(
      writeFileWithinRoot({
        rootPath: root,
        filePath: 'escape/output.txt',
        body: new TextEncoder().encode('blocked'),
        exclusive: false,
      }),
    ).rejects.toThrow('Path escaped the allowed root');
  } finally {
    await rm(parent, { force: true, recursive: true });
  }
});

test('reads files and directories within the root', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'ankhorage-utility-fs-'));

  try {
    await mkdir(path.join(root, 'src'));
    await writeFile(path.join(root, 'src', 'index.ts'), 'export {};');

    const file = readTextFileWithinRoot({ rootPath: root, filePath: 'src/index.ts' });
    expect(file.content).toBe('export {};');
    expect(file.path).toBe(path.join(root, 'src', 'index.ts'));

    const directory = readDirectoryWithinRoot({ rootPath: root, directoryPath: 'src' });
    expect(directory.entries.map((entry) => entry.name)).toEqual(['index.ts']);

    await writeFileWithinRoot({
      rootPath: root,
      filePath: 'generated/audit.json',
      body: new TextEncoder().encode('{}'),
      exclusive: false,
    });
    expect(await readFile(path.join(root, 'generated', 'audit.json'), 'utf8')).toBe('{}');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
