import { AccountUpdate, PublicKey } from "o1js";
import { useQuery } from "@tanstack/react-query";
import { ZkUsdEngineContract, Vault } from "zkusd";
import { fetchMinaAccount } from "zkcloudworker";
import { VaultState } from "../types/vault";

export function useVaultState(
  vaultAddress: string,
  engine: InstanceType<ReturnType<typeof ZkUsdEngineContract>>
) {
  return useQuery({
    queryKey: ["vaultState", vaultAddress],
    queryFn: async () => {
      //Fetch the vault again
      const vaultAccount = await fetchMinaAccount({
        publicKey: PublicKey.fromBase58(vaultAddress),
        tokenId: engine.deriveTokenId(),
      });

      if (!vaultAccount.account) {
        throw new Error("Vault not found");
      }

      const vaultState = Vault.fromAccount(vaultAccount.account);

      const collateralAmount = vaultState.collateralAmount.toBigInt();
      const debtAmount = vaultState.debtAmount.toBigInt();
      const ownerPublicKey = vaultState.owner;
      const owner = ownerPublicKey?.toBase58() ?? "Not Found";

      return {
        vaultAddress,
        collateralAmount,
        debtAmount,
        owner,
      } as VaultState;
    },
    // Add caching configuration as needed
    staleTime: 3000,
    enabled: !!vaultAddress && !!engine,
  });
}
