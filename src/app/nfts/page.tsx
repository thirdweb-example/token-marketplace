"use client";

import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import NFTCard from "@/components/feature/NFTCard";
import { fetchNFTs, NFT } from "@/lib/nfts";
import { Skeleton } from "@/components/ui/skeleton";

const CHAINS = [
  { key: "ethereum", label: "Ethereum" },
  { key: "base", label: "Base" },
  { key: "polygon", label: "Polygon" },
];

export default function NFTsGalleryPage() {
  const [selectedChain, setSelectedChain] = useState<string>("ethereum");
  const [owner, setOwner] = useState<string>("");
  const [inputOwner, setInputOwner] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // React Query – infinite NFTs
  type FetchResponse = Awaited<ReturnType<typeof fetchNFTs>>;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    status,
  } = useInfiniteQuery<
    FetchResponse,
    Error,
    FetchResponse,
    [string, string, string]
  >({
    queryKey: ["nfts", selectedChain, owner],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      const res = await fetchNFTs({
        chain: selectedChain as any,
        owner,
        cursor,
      });
      return res;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 5,
  });

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Handle Apply owner filter
  const applyOwnerFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setOwner(inputOwner.trim());
    // Refetch on owner change
    refetch({ cancelRefetch: true });
  };

  const allNFTs: NFT[] = ((data as any)?.pages ?? []).flatMap(
    (p: any) => p.nfts as NFT[]
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NFT Gallery</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
          {/* Chain selector */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="chain-select"
            >
              Chain
            </label>
            <select
              id="chain-select"
              className="bg-[#121212] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
            >
              {CHAINS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filters dropdown */}
          <div className="flex-1">
            <button
              type="button"
              className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              Filters
            </button>

            {showFilters && (
              <form
                onSubmit={applyOwnerFilter}
                className="mt-4 bg-[#121212] border border-[#1F1F1F] rounded-md p-4"
              >
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="owner-input"
                >
                  Owner address
                </label>
                <div className="flex gap-2">
                  <input
                    id="owner-input"
                    type="text"
                    value={inputOwner}
                    onChange={(e) => setInputOwner(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-black border border-[#1F1F1F] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {status === "pending" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton key={idx} className="w-full pt-[100%]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allNFTs.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center">
                No NFTs found. Ensure your thirdweb client ID is enabled for the
                selected chain.
              </p>
            ) : (
              allNFTs.map((nft, idx) => (
                <NFTCard
                  key={`${nft.contract_address}_${nft.token_id}_${idx}`}
                  nft={nft}
                />
              ))
            )}
          </div>
        )}

        {/* Load more sentinel */}
        <div ref={lastElementRef} className="h-10" />

        {/* Fetching next page skeleton */}
        {isFetchingNextPage && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton key={idx} className="w-full pt-[100%]" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
