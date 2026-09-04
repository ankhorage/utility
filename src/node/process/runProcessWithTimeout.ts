import { spawn } from 'node:child_process';

type TimerHandle = ReturnType<typeof setTimeout>;

/*** Run a child process with bounded spawn/runtime timeouts and SIGTERM/SIGKILL escalation. */
export async function runProcessWithTimeout(options: {
  readonly command: string;
  readonly args?: readonly string[];
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly stdio?: 'ignore' | 'inherit';
  readonly spawnTimeoutMs: number;
  readonly timeoutMs: number;
  readonly killGraceMs: number;
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(options.command, [...(options.args ?? [])], {
      ...(options.cwd === undefined ? {} : { cwd: options.cwd }),
      ...(options.env === undefined ? {} : { env: options.env }),
      stdio: options.stdio ?? 'inherit',
    });
    let hardTimeout: TimerHandle | undefined;
    let killTimeout: TimerHandle | undefined;
    let settled = false;

    /*** Clear every timeout owned by the spawned-process lifecycle. */
    const clearTimers = (): void => {
      clearTimeout(spawnTimeout);
      if (hardTimeout !== undefined) clearTimeout(hardTimeout);
      if (killTimeout !== undefined) clearTimeout(killTimeout);
    };

    /*** Reject the lifecycle exactly once and clear pending timeout work. */
    const rejectOnce = (error: Error): void => {
      if (settled) return;
      settled = true;
      clearTimers();
      reject(error);
    };

    /*** Terminate an overdue child with SIGTERM/SIGKILL escalation before rejecting. */
    const rejectWithTimeout = (reason: string): void => {
      if (settled) return;
      if (child.exitCode === null) {
        child.kill('SIGTERM');
        killTimeout = setTimeout(() => {
          if (child.exitCode === null) child.kill('SIGKILL');
        }, options.killGraceMs);
      }
      rejectOnce(new Error(reason));
    };

    const spawnTimeout = setTimeout(
      () => rejectWithTimeout(`Process '${options.command}' did not start within ${options.spawnTimeoutMs}ms.`),
      options.spawnTimeoutMs,
    );

    child.once('spawn', () => {
      if (settled) return;
      clearTimeout(spawnTimeout);
      hardTimeout = setTimeout(
        () => rejectWithTimeout(`Process '${options.command}' exceeded ${options.timeoutMs}ms.`),
        options.timeoutMs,
      );
    });

    child.once('error', (error) => {
      const spawnError = error as NodeJS.ErrnoException;
      rejectOnce(
        new Error(
          spawnError.code === 'ENOENT'
            ? `Executable '${options.command}' was not found in PATH.`
            : `Failed to start '${options.command}': ${spawnError.message}`,
          { cause: error },
        ),
      );
    });

    child.once('close', (code, signal) => {
      if (settled) {
        clearTimers();
        return;
      }
      settled = true;
      clearTimers();
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        code === null
          ? new Error(`Process '${options.command}' terminated by signal ${signal ?? 'unknown'}.`)
          : new Error(`Process '${options.command}' failed with code ${code}.`),
      );
    });
  });
}
