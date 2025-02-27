import { Progress } from "@/lib/components/ui/progress";
import { TransactionPhase } from "@zkusd/core";
import Link from "next/link";
import { useTransactionStatus } from "../context/transaction-status";

interface TransactionProgressProps {
  phase: TransactionPhase;
}

export function TransactionProgress({ phase }: TransactionProgressProps) {
  const { txHash } = useTransactionStatus();

  // Map status to step number (1-6)
  const getStepNumber = (phase: TransactionPhase): number => {
    switch (phase) {
      case TransactionPhase.BUILDING:
        return 1;
      case TransactionPhase.SIGNING:
        return 2;
      case TransactionPhase.PROVING:
        return 3;
      case TransactionPhase.SENDING:
        return 4;
      case TransactionPhase.PENDING_INCLUSION:
        return 6;
      case TransactionPhase.INCLUDED:
        return 7;
      default:
        return 0;
    }
  };

  // Get progress percentage
  const progress = (getStepNumber(phase) / 7) * 100;

  // Get status message
  const getStatusMessage = (phase: TransactionPhase): string => {
    switch (phase) {
      case TransactionPhase.BUILDING:
        return "1/6 - Building the transaction";
      case TransactionPhase.SIGNING:
        return "2/6 - Sign the transaction with your wallet";
      case TransactionPhase.PROVING:
        return "3/6 - Proving the transaction";
      case TransactionPhase.SENDING:
        return "4/6 - Sending the transaction";
      case TransactionPhase.PENDING_INCLUSION:
        return "5/6 - Pending inclusion in a block";
      case TransactionPhase.INCLUDED:
        return "6/6 - Transaction included";
      default:
        return "Transaction status unknown";
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2 h-5 items-center tracking-[0.06em]">
        <p className="text-xs font-sans font-light text-muted-foreground">
          {getStatusMessage(phase)}
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
