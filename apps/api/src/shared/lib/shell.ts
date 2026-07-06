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
