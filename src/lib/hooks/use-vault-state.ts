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
      await fetchMinaAccount({
        publicKey: PublicKey.fromBase58(vaultAddress),
        tokenId: engine.deriveTokenId(),
      });

      const vaultUpdate = AccountUpdate.create(
        PublicKey.fromBase58(vaultAddress),
        engine.deriveTokenId()
      );

      const vault = Vault.get(vaultUpdate);

      if (!vault) {
        throw new Error("Vault not found");
      }

      const collateralAmount = vault.state.collateralAmount.toBigInt();
      const debtAmount = vault.state.debtAmount.toBigInt();
      const ownerPublicKey = vault.state.owner;
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
