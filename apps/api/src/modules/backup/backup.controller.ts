import type { Request, Response, NextFunction } from "express";
import * as backupService from "./backup.service.js";
import * as cloudAuth from "./gdrive-auth.service.js";
import type { CreateBackupJobRequest } from "./backup.types.js";

export async function getJobs(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobs = await backupService.getJobs();
    res.json({ data: { jobs } });
  } catch (err) {
    next(err);
  }
}

export async function createJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const job = await backupService.createJob(
      req.body as CreateBackupJobRequest,
    );
    res.json({ data: { success: true, job } });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await backupService.deleteJob(req.params["jobId"] as string);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function runJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const message = await backupService.runJob(req.params["jobId"] as string);
    res.json({ data: { success: true, message } });
  } catch (err) {
    next(err);
  }
}

export async function getUsbDevices(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const devices = await backupService.detectUsbDevices();
    res.json({ data: { devices } });
  } catch (err) {
    next(err);
  }
}

export function getCloudProviders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const providers = cloudAuth.getProviders();
    res.json({ data: { providers } });
  } catch (err) {
    next(err);
  }
}

export function startCloudAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const providerId = req.params["provider"] as string;
    const result = cloudAuth.startCloudAuth(providerId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export function getCloudAuthStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const status = cloudAuth.getAuthStatus();
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function saveCloudToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const providerId = req.params["provider"] as string;
    const { token } = req.body as { token: string };
    await cloudAuth.saveCloudToken(providerId, token);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export function cancelCloudAuth(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    cloudAuth.cancelAuth();
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}
