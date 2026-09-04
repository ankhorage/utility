import type { ChildProcess } from 'node:child_process';

/***
 * Collect stdout and stderr chunks from a child process into one ordered string buffer.
 */
export function collectProcessOutput(
  processToCollect: Pick<ChildProcess, 'stderr' | 'stdout'>,
  output: string[],
): void {
  processToCollect.stdout?.on('data', (chunk: Buffer | string) => output.push(String(chunk)));
  processToCollect.stderr?.on('data', (chunk: Buffer | string) => output.push(String(chunk)));
}

/***
 * Stop a child-process group when possible and fall back to stopping the child process itself.
 */
export function stopProcess(
  processToStop: Pick<ChildProcess, 'exitCode' | 'kill' | 'pid'> | null | undefined,
  signal: NodeJS.Signals = 'SIGTERM',
): void {
  if (!processToStop?.pid || processToStop.exitCode !== null) return;
  try {
    globalThis.process.kill(-processToStop.pid, signal);
  } catch {
    try {
      processToStop.kill(signal);
    } catch {
      // The process may already have exited between the state check and termination attempt.
    }
  }
}
