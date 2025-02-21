import { Schema, model, models } from "mongoose";
import { AggregateOraclePricesProof } from "@zkusd/core";

interface IProof {
  blockHeight: number;
  timestamp: Date;
  proof: AggregateOraclePricesProof;
  price: number;
}

const ProofSchema = new Schema<IProof>(
  {
    blockHeight: {
      type: Number,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    proof: {
      type: Schema.Types.Mixed,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "oracle_price_proofs",
  }
);

// Prevent model recompilation error in development
export const ProofModel = models.Proof || model<IProof>("Proof", ProofSchema);
