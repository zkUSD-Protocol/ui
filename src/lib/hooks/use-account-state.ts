import { AccountUpdate, Field, PublicKey } from "o1js";
import { useQuery } from "@tanstack/react-query";
import { ZkUsdEngineContract, Vault } from "zkusd";
import { fetchMinaAccount } from "zkcloudworker";
import { VaultState } from "../types/vault";

export function useAccountState(accountAddress: string, tokenId: string) {
  return useQuery({
    queryKey: ["accountState", accountAddress],
    queryFn: async () => {
      //Fetch the vault again
      const minaAccount = await fetchMinaAccount({
        publicKey: PublicKey.fromBase58(accountAddress),
        force: true,
      });
      if (!minaAccount.account) {
        throw new Error("Account not found");
      }

      const zkusdAccount = await fetchMinaAccount({
        publicKey: PublicKey.fromBase58(accountAddress),
        tokenId: Field(tokenId),
      });

      const minaBalance = minaAccount.account?.balance.toBigInt() ?? 0n;
      const zkusdBalance = zkusdAccount.account?.balance.toBigInt() ?? 0n;

      return {
        accountAddress,
        minaBalance,
        zkusdBalance,
      };
    },
    // Add caching configuration as needed
    staleTime: 3000,
    enabled: !!accountAddress,
  });
}
