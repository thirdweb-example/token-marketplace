"use client";

import Header from "@/components/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DUMMY_NFTS } from "@/lib/nfts";
import { Button } from "@/components/ui/button";

export default function NFTItemPage() {
  const params = useParams();
  const { chain, collection, tokenId } = params as {
    chain: string;
    collection: string;
    tokenId: string;
  };

  // Try to locate NFT in dummy dataset
  const chainKey = chain as keyof typeof DUMMY_NFTS;
  const nft = (DUMMY_NFTS[chainKey] || []).find(
    (n) =>
      n.contract_address.toLowerCase() === collection.toLowerCase() &&
      n.token_id === tokenId
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="container mx-auto px-4 py-10">
        {nft ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative w-full pt-[100%] bg-[#050505] rounded-lg overflow-hidden border border-[#1F1F1F]">
                {nft.image ? (
                  <Image
                    src={nft.image}
                    alt={nft.name ?? "NFT image"}
                    fill
                    sizes="100%"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-6">
              {/* Title */}
              <div>
                <p className="text-sm text-gray-400 mb-1 break-all">
                  <a
                    href={`/nfts/${chain}/${collection}`}
                    className="hover:underline"
                  >
                    {nft.collection_name ?? "Collection"}
                  </a>
                </p>
                <h1 className="text-3xl font-bold break-all mb-4">
                  {nft.name ?? `Token #${nft.token_id}`}
                </h1>
              </div>

              {/* Price box */}
              <div className="border border-[#1F1F1F] p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Current Price</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-semibold">1.23 ETH</span>
                  <span className="text-gray-400">$3,450</span>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-white text-black hover:bg-white/90">
                    Buy now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    Make offer
                  </Button>
                </div>
              </div>

              {/* Price history placeholder */}
              <div className="border border-[#1F1F1F] p-6 rounded-lg h-40 flex items-center justify-center text-gray-500">
                Price History (placeholder)
              </div>

              {/* Item activity placeholder */}
              <div className="border border-[#1F1F1F] p-6 rounded-lg h-40 flex items-center justify-center text-gray-500">
                Item Activity (placeholder)
              </div>
            </div>
          </div>
        ) : (
          <p>NFT not found.</p>
        )}
      </section>
    </main>
  );
}
