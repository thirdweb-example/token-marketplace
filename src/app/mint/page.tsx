import { NftMint } from "@/components/nft-mint";
import { defaultTokenId } from "@/lib/constants";
// lib imports for fetching NFT details
import { getERC20Info } from "@/lib/erc20";
import { getERC721Info } from "@/lib/erc721";
import { getERC1155Info } from "@/lib/erc1155";
// thirdweb imports
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";
import { getContract } from "thirdweb";
import { client } from "@/app/client";
import { getChainFromId } from "@/lib/utils";
import { getChainMetadata } from "thirdweb/chains";

async function getERCType(contract: any) {
  const [isErc721Result, isErc1155Result] = await Promise.all([
    isERC721({ contract }).catch(() => false),
    isERC1155({ contract }).catch(() => false),
  ]);

  return isErc1155Result ? "ERC1155" : isErc721Result ? "ERC721" : "ERC20";
}



export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  try {
    // Get contract address, chain ID, and token ID from URL
    const contractAddress = searchParams.contract || "0x0d7fE9e072171fE4342bf87557318A34d2d74552" 
    const chainIdStr = searchParams.chainId || "43113"
    const tokenIdStr = typeof searchParams.tokenId === 'string' ? searchParams.tokenId : defaultTokenId;
    const tokenId = BigInt(tokenIdStr);
   
    // Convert chain ID string to proper chain object
    const chain = getChainFromId(chainIdStr as string);
    
    // Create contract instance
    const contract = getContract({
      address: contractAddress as string,
      chain,
      client,
    });
    
    const ercType = await getERCType(contract);
    if (!ercType) throw new Error("Failed to determine ERC type.");

    // fetch contract information depending on the ERC type
    let info;
    switch (ercType) {
      case "ERC20":
        info = await getERC20Info(contract);
        break;
      case "ERC721":
        info = await getERC721Info(contract);
        break;
      case "ERC1155":
        info = await getERC1155Info(contract, tokenId);
        break;
      default:
        throw new Error("Unknown ERC type.");
    }

    if (!info) throw new Error("Failed to fetch NFT details.");
    
    // Get chain metadata for explorer URL
    const chainData = await getChainMetadata(chain);
    const explorerBaseUrl = chainData.explorers?.[0]?.url || '';
    
    return (
      <NftMint
        contract={contract}
        displayName={info.displayName || ""}
        contractImage={info.contractImage || ""}
        description={info.description || ""}
        currencySymbol={info.currencySymbol || ""}
        pricePerToken={info.pricePerToken || 0}
        isERC1155={ercType === "ERC1155"}
        isERC721={ercType === "ERC721"}
        tokenId={tokenId}
        explorerUrl={`${explorerBaseUrl}/address/${contractAddress}`}
      />
    );
  } catch (error) {
    console.error("Error in Home component:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to load NFT</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Make sure to include the contract address in the URL: ?contract=0x...
          </p>
        </div>
      </div>
    );
  }
}