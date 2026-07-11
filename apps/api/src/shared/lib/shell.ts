import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(execCb);

export interface ShellResult {
  stdout: string;
  stderr: string;
}

export async function shell(command: string): Promise<ShellResult> {
  const { stdout, stderr } = await execAsync(command, {
    timeout: 30_000,
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

// Runs a command in the HOST's namespaces (mount/net/pid) via a one-shot
// privileged helper — the same pattern reboot and smartctl use. This is how the
// containerised API reaches host-only tools like `tailscale`, whose daemon and
// network live on the host, not inside this container.
export const HOST_HELPER =
  "docker run --rm --privileged --pid=host justincormack/nsenter1";

export async function hostShell(command: string): Promise<ShellResult> {
  return shell(`${HOST_HELPER} ${command}`);
}
