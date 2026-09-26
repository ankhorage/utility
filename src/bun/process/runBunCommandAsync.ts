/*** Run a Bun child process with optional stdout capture and a bounded timeout. */
export async function runBunCommandAsync(options: RunBunCommandOptions): Promise<string> {
  const child = Bun.spawn([options.command, ...(options.args ?? [])], {
    cwd: options.cwd,
    env: { ...Bun.env, ...options.env },
    stderr: 'inherit',
    stdout: options.captureOutput === true ? 'pipe' : 'inherit',
  });
  const timeout =
    options.timeoutMs === undefined ? undefined : setTimeout(() => child.kill(), options.timeoutMs);
  try {
    const output = options.captureOutput === true ? await new Response(child.stdout).text() : '';
    const exitCode = await child.exited;
    if (exitCode !== 0) throw new Error(`${options.label} failed with exit code ${exitCode}.`);
    return output;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

interface RunBunCommandOptions {
  readonly args?: readonly string[];
  readonly captureOutput?: boolean;
  readonly command: string;
  readonly cwd: string;
  readonly env?: Readonly<Record<string, string>>;
  readonly label: string;
  readonly timeoutMs?: number;
}
