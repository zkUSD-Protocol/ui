import { VaultTransactionType } from "zkusd";

export interface CloudWorkerRequest {
  task: VaultTransactionType;
  args: string; // JSON stringified arguments
  transactions?: string[];
}

export interface CloudWorkerResponse {
  success: boolean;
  jobId?: string;
  error?: string;
  result?: any;
}
