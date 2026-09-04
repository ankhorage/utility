import type { ChildProcess } from 'node:child_process';

/*** Stop a child-process group when possible and fall back to stopping the child process itself. */
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
