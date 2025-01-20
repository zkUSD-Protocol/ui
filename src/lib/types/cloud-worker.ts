import { TransactionType } from "./vault";

export type CloudWorkerTask = TransactionType;

export interface CloudWorkerRequest {
  task: CloudWorkerTask;
  args: string; // JSON stringified arguments
  transactions?: string[];
}

export interface CloudWorkerResponse {
  success: boolean;
  jobId?: string;
  error?: string;
  result?: any;
}
