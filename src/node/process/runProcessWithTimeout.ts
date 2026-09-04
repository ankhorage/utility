import { spawn } from 'node:child_process';

type TimerHandle = ReturnType<typeof setTimeout>;
type SpawnedProcess = ReturnType<typeof spawn>;

interface RunProcessWithTimeoutOptions {
  readonly command: string;
  readonly args?: readonly string[];
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly stdio?: 'ignore' | 'inherit';
  readonly spawnTimeoutMs: number;
  readonly timeoutMs: number;
  readonly killGraceMs: number;
}

interface ProcessLifecycle {
  readonly child: SpawnedProcess;
  readonly options: RunProcessWithTimeoutOptions;
  readonly resolve: () => void;
  readonly reject: (error: Error) => void;
  spawnTimeout?: TimerHandle;
  hardTimeout?: TimerHandle;
  killTimeout?: TimerHandle;
  settled: boolean;
}

/*** Run a child process with bounded spawn/runtime timeouts and SIGTERM/SIGKILL escalation. */
export async function runProcessWithTimeout(options: RunProcessWithTimeoutOptions): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const lifecycle = createProcessLifecycle(options, resolve, reject);
    bindProcessLifecycle(lifecycle);
    lifecycle.spawnTimeout = setTimeout(
      () => rejectProcessTimeout(lifecycle, 'start', options.spawnTimeoutMs),
      options.spawnTimeoutMs,
    );
  });
}

/*** Create the mutable state owned by one spawned-process lifecycle boundary. */
function createProcessLifecycle(
  options: RunProcessWithTimeoutOptions,
  resolve: () => void,
  reject: (error: Error) => void,
): ProcessLifecycle {
  const child = spawn(options.command, [...(options.args ?? [])], {
    ...(options.cwd === undefined ? {} : { cwd: options.cwd }),
    ...(options.env === undefined ? {} : { env: options.env }),
    stdio: options.stdio ?? 'inherit',
  });
  return { child, options, resolve, reject, settled: false };
}

/*** Bind process lifecycle events to the bounded timeout coordinator. */
function bindProcessLifecycle(lifecycle: ProcessLifecycle): void {
  lifecycle.child.once('spawn', () => handleProcessSpawn(lifecycle));
  lifecycle.child.once('error', (error) => rejectProcessError(lifecycle, error));
  lifecycle.child.once('close', (code, signal) =>
    settleProcessClose(lifecycle, code, signal ?? undefined),
  );
}

/*** Replace the spawn deadline with the hard runtime deadline after the process starts. */
function handleProcessSpawn(lifecycle: ProcessLifecycle): void {
  if (lifecycle.settled) return;
  if (lifecycle.spawnTimeout !== undefined) clearTimeout(lifecycle.spawnTimeout);
  lifecycle.hardTimeout = setTimeout(
    () => rejectProcessTimeout(lifecycle, 'runtime', lifecycle.options.timeoutMs),
    lifecycle.options.timeoutMs,
  );
}

/*** Terminate an overdue process with SIGTERM/SIGKILL escalation and reject its lifecycle. */
function rejectProcessTimeout(
  lifecycle: ProcessLifecycle,
  phase: 'start' | 'runtime',
  timeoutMs: number,
): void {
  if (lifecycle.settled) return;
  if (lifecycle.child.exitCode === null) {
    lifecycle.child.kill('SIGTERM');
    lifecycle.killTimeout = setTimeout(() => {
      if (lifecycle.child.exitCode === null) lifecycle.child.kill('SIGKILL');
    }, lifecycle.options.killGraceMs);
  }
  const detail = phase === 'start' ? 'did not start within' : 'exceeded';
  rejectProcessOnce(
    lifecycle,
    new Error(`Process '${lifecycle.options.command}' ${detail} ${timeoutMs}ms.`),
  );
}

/*** Normalize a child-process spawn error and reject the lifecycle once. */
function rejectProcessError(lifecycle: ProcessLifecycle, error: Error): void {
  const code = Reflect.get(error, 'code');
  const message =
    code === 'ENOENT'
      ? `Executable '${lifecycle.options.command}' was not found in PATH.`
      : `Failed to start '${lifecycle.options.command}': ${error.message}`;
  rejectProcessOnce(lifecycle, new Error(message, { cause: error }));
}

/*** Resolve or reject one process lifecycle from its final exit code or signal. */
function settleProcessClose(
  lifecycle: ProcessLifecycle,
  code: number | null,
  signal: NodeJS.Signals | undefined,
): void {
  if (lifecycle.settled) {
    clearProcessTimers(lifecycle);
    return;
  }
  lifecycle.settled = true;
  clearProcessTimers(lifecycle);
  if (code === 0) {
    lifecycle.resolve();
    return;
  }
  lifecycle.reject(
    code === null
      ? new Error(
          `Process '${lifecycle.options.command}' terminated by signal ${signal ?? 'unknown'}.`,
        )
      : new Error(`Process '${lifecycle.options.command}' failed with code ${code}.`),
  );
}

/*** Reject a process lifecycle once and clear all timers owned by it. */
function rejectProcessOnce(lifecycle: ProcessLifecycle, error: Error): void {
  if (lifecycle.settled) return;
  lifecycle.settled = true;
  clearProcessTimers(lifecycle);
  lifecycle.reject(error);
}

/*** Clear every timeout owned by one spawned-process lifecycle. */
function clearProcessTimers(lifecycle: ProcessLifecycle): void {
  if (lifecycle.spawnTimeout !== undefined) clearTimeout(lifecycle.spawnTimeout);
  if (lifecycle.hardTimeout !== undefined) clearTimeout(lifecycle.hardTimeout);
  if (lifecycle.killTimeout !== undefined) clearTimeout(lifecycle.killTimeout);
}
