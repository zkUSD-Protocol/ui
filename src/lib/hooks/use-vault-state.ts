import { PublicKey } from "o1js";
import { useQuery } from "@tanstack/react-query";
import { ZkUsdEngineContract, ZkUsdVault } from "zkusd";
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

      const vault = new ZkUsdVault(
        PublicKey.fromBase58(vaultAddress),
        engine.deriveTokenId()
      );

      if (!vault) {
        throw new Error("Vault not found");
      }

      const collateralAmount =
        (await vault.collateralAmount.fetch())!.toBigInt();
      const debtAmount = (await vault.debtAmount.fetch())!.toBigInt();
      const ownerPublicKey = await vault.owner.fetch();
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
