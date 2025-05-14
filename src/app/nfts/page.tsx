"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { NFT_CONTRACTS } from "@/lib/nfts";
import Link from "next/link";

// Get unique chains from NFT_CONTRACTS
const uniqueChains = Array.from(
  new Map(
    NFT_CONTRACTS.map((c) => [c.chainId, c.chain])
  ).entries()
).map(([chainId, chain]) => ({ chainId, chain }));

export default function NFTsGalleryPage() {
  const [selectedChainId, setSelectedChainId] = useState(
    uniqueChains.length > 0 ? uniqueChains[0].chainId : null
  );

  const selectedChain = uniqueChains.find((c) => c.chainId === selectedChainId);
  const collections = NFT_CONTRACTS.filter((c) => c.chainId === selectedChainId);

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NFT Collections</h1>
        {/* Chain dropdown */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2" htmlFor="chain-select">
            Chain
          </label>
          <select
            id="chain-select"
            className="bg-[#121212] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
            value={selectedChainId ?? ''}
            onChange={(e) => setSelectedChainId(Number(e.target.value))}
          >
            {uniqueChains.map(({ chainId, chain }) => (
              <option key={chainId} value={chainId}>
                {chain.name || `Chain #${chainId}`}
              </option>
            ))}
          </select>
        </div>
        {/* Collections Grid for selected chain */}
        {selectedChain && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              {typeof selectedChain.chain.icon === 'string' && selectedChain.chain.icon && (
                <img src={selectedChain.chain.icon} alt={selectedChain.chain.name} className="w-6 h-6 rounded-full" />
              )}
              {selectedChain.chain.name || `Chain #${selectedChain.chainId}`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {collections.map((contract) => (
                <Link
                  key={contract.address}
                  href={`/nfts/${selectedChainId}/${contract.address}`}
                  className="block bg-[#181818] border border-[#232323] rounded-lg p-4 hover:border-white transition-colors"
                >
                  <div className="w-full aspect-square bg-[#222] rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    {contract.thumbnailUrl ? (
                      <img
                        src={contract.thumbnailUrl}
                        alt={contract.title || contract.address}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-500 text-4xl">?</span>
                    )}
                  </div>
                  <div className="font-semibold text-lg mb-1 truncate">
                    {contract.title || contract.address}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    {contract.type}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {contract.address}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
