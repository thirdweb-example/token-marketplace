"use client";

import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import NFTCard from "@/components/feature/NFTCard";
import { Twitter, Globe, Instagram } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NFT_CONTRACTS } from "@/lib/nfts";
import React from "react";
import { getAllValidListings, totalListings } from "thirdweb/extensions/marketplace";
import { getContract, toEther } from "thirdweb";
import { client } from "@/app/client";

export default function NFTCollectionPage() {
  const params = useParams();
  const { chain, collection } = params as { chain: string; collection: string };

  const [collectionMeta, setCollectionMeta] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const [holders, setHolders] = useState<any[]>([]);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [holdersError, setHoldersError] = useState<string | null>(null);

  // Attribute filter state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, Set<string>>>({});

  // For attribute filter UX
  const [expandedTraits, setExpandedTraits] = useState<Set<string>>(new Set());
  const [attrSearch, setAttrSearch] = useState("");

  // Extract all unique attributes from NFTs
  const allAttributes = React.useMemo(() => {
    const attrMap: Record<string, Set<string>> = {};
    nfts.forEach((nft) => {
      const attributes = nft.extra_metadata?.attributes || nft.metadata?.attributes || [];
      attributes.forEach((attr: any) => {
        if (!attr.trait_type || attr.value == null) return;
        if (!attrMap[attr.trait_type]) attrMap[attr.trait_type] = new Set();
        attrMap[attr.trait_type].add(String(attr.value));
      });
    });
    return attrMap;
  }, [nfts]);

  // Filter traits/values by search
  const filteredAttributes = React.useMemo(() => {
    if (!attrSearch.trim()) return allAttributes;
    const lower = attrSearch.toLowerCase();
    const filtered: Record<string, Set<string>> = {};
    Object.entries(allAttributes).forEach(([trait, values]) => {
      if (trait.toLowerCase().includes(lower)) {
        filtered[trait] = values;
      } else {
        const matching = [...values].filter((v) => v.toLowerCase().includes(lower));
        if (matching.length) filtered[trait] = new Set(matching);
      }
    });
    return filtered;
  }, [allAttributes, attrSearch]);

  // Filter NFTs by selected attributes
  const filteredNFTs = React.useMemo(() => {
    if (!nfts.length || !Object.keys(selectedAttributes).length) return nfts;
    return nfts.filter((nft) => {
      const attributes = nft.extra_metadata?.attributes || nft.metadata?.attributes || [];
      const attrObj: Record<string, string> = {};
      attributes.forEach((attr: any) => {
        if (attr.trait_type && attr.value != null) {
          attrObj[attr.trait_type] = String(attr.value);
        }
      });
      // Must match all selected attributes
      return Object.entries(selectedAttributes).every(
        ([trait, values]) => values.size === 0 || (attrObj[trait] && values.has(attrObj[trait]))
      );
    });
  }, [nfts, selectedAttributes]);

  // Handler for attribute checkbox
  function handleAttributeChange(trait: string, value: string, checked: boolean) {
    setSelectedAttributes((prev) => {
      const next = { ...prev };
      if (!next[trait]) next[trait] = new Set();
      if (checked) {
        next[trait].add(value);
      } else {
        next[trait].delete(value);
      }
      // Remove empty sets
      if (next[trait].size === 0) delete next[trait];
      return { ...next };
    });
  }

  function toggleTrait(trait: string) {
    setExpandedTraits((prev) => {
      const next = new Set(prev);
      if (next.has(trait)) next.delete(trait);
      else next.add(trait);
      return next;
    });
  }

  const [page, setPage] = useState(1);
  const [pageSize] = useState(50); // You can adjust this if needed
  const [hasMore, setHasMore] = useState(true);

  // Reset NFTs and pagination when collection/chain changes
  useEffect(() => {
    setNfts([]);
    setPage(1);
    setHasMore(true);
  }, [chain, collection]);

  // Fetch NFTs in batches and append
  useEffect(() => {
    async function fetchNFTs() {
      setLoading(true);
      setError(null);
      try {
        // Find chainId from NFT_CONTRACTS
        const contract = NFT_CONTRACTS.find(
          (c) => c.address.toLowerCase() === collection.toLowerCase()
        );
        const chainId = contract?.chainId || chain;
        const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
        const offset = (page - 1) * pageSize;
        const nftsRes = await fetch(
          `https://insight.thirdweb.com/v1/nfts/${collection}?chain=${chainId}&limit=${pageSize}&offset=${offset}&include_owners=false&resolve_metadata_links=true&clientId=${clientId}`
        );
        if (!nftsRes.ok) throw new Error("Failed to fetch NFTs");
        const nftsJson = await nftsRes.json();
        setNfts((prev) => [...prev, ...nftsJson.data]);
        if (!nftsJson.data || nftsJson.data.length < pageSize) {
          setHasMore(false);
        }
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchNFTs();
  }, [chain, collection, page]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
         // Find chainId from NFT_CONTRACTS
         const contract = NFT_CONTRACTS.find(
          (c) => c.address.toLowerCase() === collection.toLowerCase()
        );
        const chainId = contract?.chainId || chain;


        const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
        // Fetch collection metadata
        const metaRes = await fetch(
          `https://insight.thirdweb.com/v1/nfts/collections/${collection}?chain=${chainId}&include_stats=true&resolve_metadata_links=true&clientId=${clientId}`
        );
        if (!metaRes.ok) throw new Error("Failed to fetch collection metadata");
        const meta = await metaRes.json();
        console.log(meta);
        setCollectionMeta(meta.data[0]);

       
        // Fetch NFTs in the collection
        const nftsRes = await fetch(
          `https://insight.thirdweb.com/v1/nfts/${collection}?chain=${chainId}&limit=50&include_owners=false&resolve_metadata_links=true&clientId=${clientId}`
        );
        if (!nftsRes.ok) throw new Error("Failed to fetch NFTs");
        const nftsJson = await nftsRes.json();
        console.log(nftsJson);
        setNfts(nftsJson.data);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chain, collection]);

  const [tab, setTab] = useState<string>("items");

  // Fetch activity only when Activity tab is selected
  useEffect(() => {
    if (tab !== "activity") return;
    let ignore = false;
    async function fetchActivity() {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
        // Find chainId from NFT_CONTRACTS
        const contract = NFT_CONTRACTS.find(
          (c) => c.address.toLowerCase() === collection.toLowerCase()
        );
        const chainId = contract?.chainId || chain;
        const res = await fetch(
          `https://insight.thirdweb.com/v1/nfts/transfers/${collection}?chain=${chainId}&limit=50&metadata=false&sales=false&include_owners=false&resolve_metadata_links=true&clientId=${clientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch activity");
        const json = await res.json();
        if (!ignore) setActivity(json.data || []);
      } catch (e: any) {
        if (!ignore) setActivityError(e.message || "Unknown error");
      } finally {
        if (!ignore) setActivityLoading(false);
      }
    }
    fetchActivity();
    return () => { ignore = true; };
  }, [tab, chain, collection]);

  // Fetch holders only when Holders tab is selected
  useEffect(() => {
    if (tab !== "holders") return;
    let ignore = false;
    async function fetchHolders() {
      setHoldersLoading(true);
      setHoldersError(null);
      try {
        const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
        // Find chainId from NFT_CONTRACTS
        const contract = NFT_CONTRACTS.find(
          (c) => c.address.toLowerCase() === collection.toLowerCase()
        );
        const chainId = contract?.chainId || chain;
        const res = await fetch(
          `https://insight.thirdweb.com/v1/nfts/owners/${collection}?chain=${chainId}&limit=50&clientId=${clientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch holders");
        const json = await res.json();
        if (!ignore) setHolders(json.data || []);
      } catch (e: any) {
        if (!ignore) setHoldersError(e.message || "Unknown error");
      } finally {
        if (!ignore) setHoldersLoading(false);
      }
    }
    fetchHolders();
    return () => { ignore = true; };
  }, [tab, chain, collection]);

  const [listings, setListings] = useState<any[]>([]);

  // Fetch marketplace listings for this collection
  useEffect(() => {
    async function fetchListings() {
      try {
        // Find the marketplace contract for this chain
        const contractInfo = NFT_CONTRACTS.find(
          (c) => c.address.toLowerCase() === collection.toLowerCase()
        );
        const chainId = contractInfo?.chainId || chain;
        // Find the marketplace contract for this chain
        const marketplace = require("@/lib/nfts").MARKETPLACE_CONTRACTS.find(
          (m: { chainId: number; }) => m.chainId === Number(chainId)
        );
        if (!marketplace) return;
        const contract = getContract({
          address: marketplace.address,
          chain: marketplace.chain,
          client,
        });
        const total = await totalListings({ contract });
        if (total > 0) {
          const allListings = await getAllValidListings({ contract, start: 0, count: BigInt(total) });
          // Only keep listings for this collection
          const filtered = allListings.filter((l: any) => l.assetContractAddress.toLowerCase() === collection.toLowerCase());
          setListings(filtered);
        } else {
          setListings([]);
        }
      } catch (err) {
        setListings([]);
      }
    }
    fetchListings();
  }, [chain, collection]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="w-full h-48 bg-[#1F1F1F] relative">
        {collectionMeta?.image_url && (
          <img
            src={collectionMeta.image_url}
            alt={collectionMeta.name}
            className="absolute left-6 bottom-0 translate-y-1/2 w-24 h-24 bg-[#2a2a2a] rounded-md border border-[#333] object-cover"
          />
        )}
      </div>

      <section className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 break-all">
              {collectionMeta?.name || "Collection"}
            </h1>
            <p className="text-gray-400 text-sm break-all">
              {collectionMeta?.creator_address || "By Unknown"}
            </p>
            {collectionMeta?.description && (
              <p className="text-gray-400 text-sm mt-2 max-w-xl">
                {collectionMeta.description}
              </p>
            )}
            {collectionMeta?.stats && (
              <div className="flex gap-6 mt-4 text-xs text-gray-400">
                <div>
                  <span className="font-bold text-white">
                    {collectionMeta.stats.mint_count ?? "-"}
                  </span>{" "}
                  minted
                </div>
                <div>
                  <span className="font-bold text-white">
                    {collectionMeta.stats.owner_count ?? "-"}
                  </span>{" "}
                  owners
                </div>
                <div>
                  <span className="font-bold text-white">
                    {collectionMeta.stats.token_count ?? "-"}
                  </span>{" "}
                  tokens
                </div>
                <div>
                  <span className="font-bold text-white">
                    {collectionMeta.stats.total_quantity ?? "-"}
                  </span>{" "}
                  total qty
                </div>
                {/* Optionally show floor price if present */}
                {collectionMeta.stats.floor_price !== undefined && (
                  <div>
                    <span className="font-bold text-white">
                      {collectionMeta.stats.floor_price}
                    </span>{" "}
                    floor
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4 text-gray-400">
            {collectionMeta?.external_url && (
              <a href={collectionMeta.external_url} aria-label="Website" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              <Globe size={20} />
            </a>
            )}
            {collectionMeta?.twitter_username && (
              <a href={`https://twitter.com/${collectionMeta.twitter_username}`} aria-label="Twitter" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              <Twitter size={20} />
            </a>
            )}
            {collectionMeta?.instagram_username && (
              <a href={`https://instagram.com/${collectionMeta.instagram_username}`} aria-label="Instagram" className="hover:text-white" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            )}
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
          {/* Attribute filter sidebar: only show on items tab */}
          {tab === "items" && (
            <div className="hidden md:block w-44 bg-[#121212] border border-[#1F1F1F] rounded-md h-fit p-4 overflow-y-auto" style={{ minHeight: 384, maxHeight: '80vh' }}>
              {Object.keys(allAttributes).length > 0 ? (
                <div>
                  <div className="font-bold text-sm mb-2">Filter Attributes</div>
                  <input
                    type="text"
                    placeholder="Search traits..."
                    value={attrSearch}
                    onChange={e => setAttrSearch(e.target.value)}
                    className="w-full mb-3 px-2 py-1 rounded bg-[#181818] border border-[#232323] text-xs text-white focus:outline-none"
                  />
                  {Object.entries(filteredAttributes).map(([trait, values]) => {
                    const expanded = expandedTraits.has(trait);
                    const sortedValues = [...values].sort();
                    const showValues = expanded ? sortedValues : sortedValues.slice(0, 5);
                    return (
                      <div key={trait} className="mb-4">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full text-xs text-gray-400 mb-1 font-semibold hover:text-white focus:outline-none"
                          onClick={() => toggleTrait(trait)}
                          aria-expanded={expanded}
                        >
                          <span>{trait}</span>
                          <span className="ml-2">{expanded ? "▲" : "▼"}</span>
                        </button>
                        <div className={expanded ? "" : "max-h-32 overflow-hidden"}>
                          {showValues.map((value) => (
                            <label key={value} className="flex items-center gap-2 text-xs mb-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!selectedAttributes[trait]?.has(value)}
                                onChange={(e) => handleAttributeChange(trait, value, e.target.checked)}
                                className="accent-white"
                              />
                              <span>{value}</span>
                            </label>
                          ))}
                          {sortedValues.length > 5 && (
                            <button
                              type="button"
                              className="text-xs text-gray-500 hover:text-white mt-1"
                              onClick={() => toggleTrait(trait)}
                            >
                              {expanded ? "Show less" : `Show more (${sortedValues.length - 5})`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(selectedAttributes).length > 0 && (
                    <button
                      className="mt-2 text-xs text-gray-400 underline hover:text-white"
                      onClick={() => setSelectedAttributes({})}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No attributes</div>
              )}
            </div>
          )}

          <div className="flex-1">
            {tab === "items" && (
              <>
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <Skeleton key={idx} className="w-full pt-[100%]" />
                    ))}
                  </div>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : filteredNFTs.length === 0 ? (
                  <p>No NFTs in this collection.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredNFTs.map((nft, idx) => {
                      const listing = listings.find(l => l.tokenId?.toString() === nft.token_id?.toString());
                      return (
                        <NFTCard
                          key={`${nft.token_id}_${idx}`}
                          nft={nft}
                          price={listing ? toEther(listing.pricePerToken) : undefined}
                          currencySymbol={listing ? listing.currencyValuePerToken?.symbol : undefined}
                          listingId={listing ? listing.id?.toString() : undefined}
                        />
                      );
                    })}
                  </div>
                )}
                {hasMore && !loading && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 rounded bg-[#181818] border border-[#232323] text-xs hover:bg-[#232323]"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}

            {tab === "activity" && (
              <div className="mt-4">
                {activityLoading ? (
                  <div>Loading activity…</div>
                ) : activityError ? (
                  <div className="text-red-500">{activityError}</div>
                ) : activity.length === 0 ? (
                  <div className="text-gray-400">No activity found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#222]">
                          <th className="py-2 pr-4">Token ID</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">From</th>
                          <th className="py-2 pr-4">To</th>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Txn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.map((tx, idx) => (
                          <tr key={tx.transaction_hash + tx.log_index} className="border-b border-[#181818]">
                            <td className="py-2 pr-4 font-mono">{tx.token_id}</td>
                            <td className="py-2 pr-4 capitalize">{tx.transfer_type}</td>
                            <td className="py-2 pr-4 font-mono text-blue-400">
                              {tx.from_address.slice(0, 6)}…{tx.from_address.slice(-4)}
                            </td>
                            <td className="py-2 pr-4 font-mono text-green-400">
                              {tx.to_address.slice(0, 6)}…{tx.to_address.slice(-4)}
                            </td>
                            <td className="py-2 pr-4">
                              {tx.block_timestamp.replace(" ", "T").slice(0, 16).replace("T", " ")}
                            </td>
                            <td className="py-2 pr-4 font-mono">
                              <a
                                href={`https://explorer.thirdweb.com/${tx.chain_id}/tx/${tx.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-white"
                              >
                                {tx.transaction_hash.slice(0, 6)}…{tx.transaction_hash.slice(-4)}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "holders" && (
              <div className="mt-4">
                {holdersLoading ? (
                  <div>Loading holders…</div>
                ) : holdersError ? (
                  <div className="text-red-500">{holdersError}</div>
                ) : !holders[0] || !holders[0].owner_addresses || holders[0].owner_addresses.length === 0 ? (
                  <div className="text-gray-400">No holders found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#222]">
                          <th className="py-2 pr-4">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holders[0].owner_addresses.map((address: string) => (
                          <tr key={address} className="border-b border-[#181818]">
                            <td className="py-2 pr-4 font-mono text-blue-400">
                              {address.slice(0, 6)}…{address.slice(-4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "about" && collectionMeta && (
              <div className="mt-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-4">
                  {collectionMeta.image_url && (
                    <img
                      src={collectionMeta.image_url}
                      alt={collectionMeta.name}
                      className="w-20 h-20 rounded-lg border border-[#232323] object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{collectionMeta.name}</h2>
                    {collectionMeta.symbol && (
                      <div className="text-gray-400 text-sm mb-1">Symbol: {collectionMeta.symbol}</div>
                    )}
                  </div>
                </div>
                {collectionMeta.description && (
                  <p className="text-gray-300 mb-4 whitespace-pre-line">{collectionMeta.description}</p>
                )}
                <div className="flex flex-wrap gap-6 text-xs text-gray-400 mb-4">
                  {collectionMeta.stats && (
                    <>
                      <div>
                        <span className="font-bold text-white">{collectionMeta.stats.mint_count ?? "-"}</span> minted
                      </div>
                      <div>
                        <span className="font-bold text-white">{collectionMeta.stats.owner_count ?? "-"}</span> owners
                      </div>
                      <div>
                        <span className="font-bold text-white">{collectionMeta.stats.token_count ?? "-"}</span> tokens
                      </div>
                      <div>
                        <span className="font-bold text-white">{collectionMeta.stats.total_quantity ?? "-"}</span> total qty
                      </div>
                      {collectionMeta.stats.floor_price !== undefined && (
                        <div>
                          <span className="font-bold text-white">{collectionMeta.stats.floor_price}</span> floor
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-4 text-gray-400 mb-4">
                  {collectionMeta.external_url && (
                    <a href={collectionMeta.external_url} aria-label="Website" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                      <Globe size={20} />
                    </a>
                  )}
                  {collectionMeta.twitter_username && (
                    <a href={`https://twitter.com/${collectionMeta.twitter_username}`} aria-label="Twitter" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                      <Twitter size={20} />
                    </a>
                  )}
                  {collectionMeta.instagram_username && (
                    <a href={`https://instagram.com/${collectionMeta.instagram_username}`} aria-label="Instagram" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
                {collectionMeta.creator_address && (
                  <div className="text-xs text-gray-500">Created by <span className="font-mono">{collectionMeta.creator_address}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
