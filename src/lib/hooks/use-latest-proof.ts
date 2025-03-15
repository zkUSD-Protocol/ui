import { useQuery } from "@tanstack/react-query";
import { AggregateOraclePricesProof } from "@zkusd/core";
import type { JsonProof } from "o1js";

export function useLatestProof() {
  return useQuery({
    queryKey: ["latestProof"],
    queryFn: async () => {
      const rawResponse = await fetch("/api/mina-price-proof");

      if (!rawResponse.ok) {
        throw new Error("Failed to fetch latest proof");
      }

      const response = await rawResponse.json();

      const proof: AggregateOraclePricesProof =
        await AggregateOraclePricesProof.fromJSON(
          response.data.proof as JsonProof,
        );

      return proof;
    },
  });
}
