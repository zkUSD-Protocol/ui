import { Mina, PublicKey, UInt64 } from "o1js";
import {
  ZkusdEngineTransactionArgs,
  ZkusdEngineTransactionType,
  TxLifecycleStatus,
} from "@zkusd/core";

const prepareTransaction = async (
  callback: () => Promise<void>,
  memo: string,
  account: PublicKey
) => {
  if (!account) {
    throw new Error("No account provided");
  }

  if (!Mina) {
    throw new Error("Mina not found");
  }

  try {
    const tx = await Mina.transaction(
      {
        sender: account,
        fee: UInt64.from(1e8),
        memo,
      },
      async () => {
        await callback();
      }
    );

    return tx;
  } catch (error) {
    console.error("Error preparing transaction", error);
    throw error;
  }
};

const serializeTransaction = (tx: Mina.Transaction<false, false>) => {
  const length = tx.transaction.accountUpdates.length;
  let blindingValues = [];
  for (let i = 0; i < length; i++) {
    const la = tx.transaction.accountUpdates[i].lazyAuthorization;
    if (
      la !== undefined &&
      //@ts-ignore
      la.blindingValue !== undefined &&
      la.kind === "lazy-proof"
    )
      blindingValues.push(la.blindingValue.toJSON());
    else blindingValues.push("");
  }

  return JSON.stringify(
    {
      tx: tx.toJSON(),
      blindingValues,
      length,
      fee: tx.transaction.feePayer.body.fee.toJSON(),
      sender: tx.transaction.feePayer.body.publicKey.toBase58(),
      nonce: tx.transaction.feePayer.body.nonce.toBigint().toString(),
    },
    null,
    2
  );
};

const signAndProve = async ({
  task,
  tx,
  memo,
  args,
  setTxStatus,
  setTxError,
}: {
  task: ZkusdEngineTransactionType;
  tx: Mina.Transaction<false, false>;
  memo: string;
  args: ZkusdEngineTransactionArgs[ZkusdEngineTransactionType];
  setTxStatus: (txStatus: TxLifecycleStatus) => void;
  setTxError: (txError: string | undefined) => void;
}) => {
  try {
    const serializedTx = serializeTransaction(tx);

    setTxStatus(TxLifecycleStatus.SIGNING);

    const signResult = await window.mina?.sendTransaction({
      onlySign: true,
      transaction: tx.toJSON(),
      feePayer: {
        fee: Number(tx.transaction.feePayer.body.fee),
        memo,
      },
    });

    if (!signResult || "code" in signResult) {
      throw new Error(signResult?.message || "Signing failed");
    }

    if (!("signedData" in signResult)) {
      throw new Error("Expected signed zkApp command");
    }

    const transaction = JSON.stringify({
      serializedTx,
      signedData: signResult.signedData,
    });

    setTxStatus(TxLifecycleStatus.PREPARING);

    const response = await fetch("/api/cloud-worker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task,
        transactions: [transaction],
        args: JSON.stringify(args),
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.error);
    }

    return result;
  } catch (error: any) {
    console.error("Error in signAndProve:", error);
    if ((error.code = 1002)) {
      setTxError(error.message);
    } else {
      setTxError("Something went wrong, please try again.");
    }
    setTxStatus(TxLifecycleStatus.FAILED);

    throw error;
  }
};

export { prepareTransaction, serializeTransaction, signAndProve };
