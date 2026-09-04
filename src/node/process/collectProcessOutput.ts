import type { ChildProcess } from 'node:child_process';

/*** Collect stdout and stderr chunks from a child process into one ordered string buffer. */
export function collectProcessOutput(
  processToCollect: Pick<ChildProcess, 'stderr' | 'stdout'>,
  output: string[],
): void {
  processToCollect.stdout?.on('data', (chunk: Buffer | string) => output.push(String(chunk)));
  processToCollect.stderr?.on('data', (chunk: Buffer | string) => output.push(String(chunk)));
}
