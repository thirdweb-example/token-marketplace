"use client";

import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { useState } from "react";
import NFTCard from "@/components/feature/NFTCard";
import { DUMMY_NFTS } from "@/lib/nfts";
import { Twitter, Globe, Instagram } from "lucide-react";

export default function NFTCollectionPage() {
  const params = useParams();
  const { chain, collection } = params as { chain: string; collection: string };

  const chainKey = chain as keyof typeof DUMMY_NFTS;
  const nfts = (DUMMY_NFTS[chainKey] || []).filter(
    (n) => n.contract_address.toLowerCase() === collection.toLowerCase()
  );

  const collectionName = nfts[0]?.collection_name ?? "Collection";

  const [tab, setTab] = useState<string>("items");

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="w-full h-48 bg-[#1F1F1F] relative">
        <div className="absolute left-6 bottom-0 translate-y-1/2 w-24 h-24 bg-[#2a2a2a] rounded-md border border-[#333]" />
      </div>

      <section className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 break-all">
              {collectionName}
            </h1>
            <p className="text-gray-400 text-sm break-all">By 0xdesigner</p>
          </div>
          <div className="flex gap-4 text-gray-400">
            <a href="#" aria-label="Website" className="hover:text-white">
              <Globe size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div className="border-b border-[#2a2a2a] mb-6">
          {[
            { key: "items", label: "Items" },
            { key: "offers", label: "Offers" },
            { key: "holders", label: "Holders" },
            { key: "activity", label: "Activity" },
            { key: "about", label: "About" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-150 mr-4 border-b-2 ${
                tab === t.key
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <div className="hidden md:block w-44 bg-[#121212] border border-[#1F1F1F] rounded-md h-96" />

          <div className="flex-1">
            {tab === "items" && (
              <>
                {nfts.length === 0 ? (
                  <p>No NFTs in this collection.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {nfts.map((nft, idx) => (
                      <NFTCard key={`${nft.token_id}_${idx}`} nft={nft} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab !== "items" && (
              <div className="text-gray-400">
                {tab.charAt(0).toUpperCase() + tab.slice(1)} coming soon…
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
