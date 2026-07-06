import type { Request, Response } from "express";

export type TypedRequest<TBody = unknown> = Request<
  Record<string, string>,
  unknown,
  TBody
>;

export type TypedResponse<TData = unknown> = Response<TData>;
