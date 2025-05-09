import { ThirdwebContract, toTokens, getContract } from "thirdweb";
import { getActiveClaimCondition } from "thirdweb/extensions/erc20";
import { contractURI, getContractMetadata } from "thirdweb/extensions/common";
import { defaultChain, defaultClient } from "@/lib/constants";
import { client } from "@/app/client";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { download } from "thirdweb/storage";

export async function getERC20Info(contract: ThirdwebContract) {
  const [claimCondition, contractMetadata, uri] = await Promise.all([
    getActiveClaimCondition({ contract }),
    getContractMetadata({ contract }),
    contractURI({ contract }),
  ]);
  const metadata = await download({ client: defaultClient, uri });
  let metadataJson = await metadata.json();
  
  const priceInWei = claimCondition?.pricePerToken;
  const currencyMetadata = claimCondition?.currency
    ? await getCurrencyMetadata({
        contract: getContract({
          address: claimCondition?.currency,
          chain: defaultChain,
          client,
        }),
      })
    : null;

  return {
    displayName: metadataJson?.name || contractMetadata?.name,
    description: metadataJson?.description || contractMetadata?.description,
    pricePerToken:
      currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null,
    contractImage: metadataJson?.image || "",
    currencySymbol: currencyMetadata?.symbol || "",
  };
} 