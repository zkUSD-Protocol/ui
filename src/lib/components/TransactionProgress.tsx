import { Progress } from "@/lib/components/ui/progress";
import { TxLifecycleStatus } from "zkusd";

interface TransactionProgressProps {
  status: TxLifecycleStatus;
}

export function TransactionProgress({ status }: TransactionProgressProps) {
  // Map status to step number (1-6)
  const getStepNumber = (status: TxLifecycleStatus): number => {
    switch (status) {
      case TxLifecycleStatus.SIGNING:
        return 1;
      case TxLifecycleStatus.PREPARING:
        return 2;
      case TxLifecycleStatus.COMPILING:
        return 3;
      case TxLifecycleStatus.PROVING:
        return 4;
      case TxLifecycleStatus.AWAITING_INCLUSION:
        return 5;
      case TxLifecycleStatus.SUCCESS:
        return 6;
      default:
        return 0;
    }
  };

  // Get progress percentage
  const progress = (getStepNumber(status) / 6) * 100;

  // Get status message
  const getStatusMessage = (status: TxLifecycleStatus): string => {
    switch (status) {
      case TxLifecycleStatus.SIGNING:
        return "1/6 - Sign the transaction with your wallet";
      case TxLifecycleStatus.PREPARING:
        return "2/6 - Preparing the transaction";
      case TxLifecycleStatus.COMPILING:
        return "3/6 - Compiling the contracts";
      case TxLifecycleStatus.PROVING:
        return "4/6 - Proving the transaction";
      case TxLifecycleStatus.AWAITING_INCLUSION:
        return "5/6 - Awaiting inclusion in a block";
      case TxLifecycleStatus.SUCCESS:
        return "6/6 - Transaction included";
      default:
        return "Transaction status unknown";
    }
  };

  return (
    <div className="w-full space-y-2">
      <p className="text-xs leading-[18px] tracking-[0.06em] font-sans font-light text-muted-foreground">
        {getStatusMessage(status)}
      </p>

      <Progress value={progress} className="w-full h-[1px]" />
    </div>
  );
}

export default TransactionProgress;
