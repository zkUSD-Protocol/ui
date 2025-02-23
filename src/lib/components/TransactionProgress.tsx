import { Progress } from "@/lib/components/ui/progress";
import { TxLifecycleStatus } from "@zkusd/core";
import Link from "next/link";
import { useTransactionStatus } from "../context/transaction-status";

interface TransactionProgressProps {
  status: TxLifecycleStatus;
}

export function TransactionProgress({ status }: TransactionProgressProps) {
  const { txHash } = useTransactionStatus();

  // Map status to step number (1-6)
  const getStepNumber = (status: TxLifecycleStatus): number => {
    switch (status) {
      case TxLifecycleStatus.PREPARING:
        return 1;
      case TxLifecycleStatus.SIGNING:
        return 2;
      case TxLifecycleStatus.PROVING:
        return 3;
      case TxLifecycleStatus.SCHEDULED:
        return 4;
      case TxLifecycleStatus.PENDING:
        return 5;
      case TxLifecycleStatus.AWAITING_INCLUSION:
        return 6;
      case TxLifecycleStatus.SUCCESS:
        return 7;
      default:
        return 0;
    }
  };

  // Get progress percentage
  const progress = (getStepNumber(status) / 7) * 100;

  // Get status message
  const getStatusMessage = (status: TxLifecycleStatus): string => {
    switch (status) {
      case TxLifecycleStatus.PREPARING:
        return "1/7 - Preparing the transaction";
      case TxLifecycleStatus.SIGNING:
        return "2/7 - Sign the transaction with your wallet";
      case TxLifecycleStatus.PROVING:
        return "3/7 - Proving the transaction";
      case TxLifecycleStatus.SCHEDULED:
        return "4/7 - Scheduling the transaction";
      case TxLifecycleStatus.PENDING:
        return "5/7 - Transaction is pending";
      case TxLifecycleStatus.AWAITING_INCLUSION:
        return "6/7 - Awaiting inclusion in a block";
      case TxLifecycleStatus.SUCCESS:
        return "7/7 - Transaction included";
      default:
        return "Transaction status unknown";
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2 h-5 items-center tracking-[0.06em]">
        <p className="text-xs font-sans font-light text-muted-foreground">
          {getStatusMessage(status)}
        </p>

        {txHash && (
          <Link
            className="mb-[2px]"
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_EXPLORER_TRANSACTION_URL}${txHash}`}
          >
            {" "}
            <span className="text-xs leading-[18px] tracking-[0.06em] font-sans font-light text-muted-foreground">
              -
            </span>{" "}
            <span className="text-xs  font-sans font-light text-white underline cursor-pointer">
              View on explorer
            </span>
          </Link>
        )}
      </div>

      <Progress value={progress} className="w-full h-[1px]" />
    </div>
  );
}

export default TransactionProgress;
