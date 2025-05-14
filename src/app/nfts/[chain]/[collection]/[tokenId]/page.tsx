"use client";

import Header from "@/components/Header";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { NFT_CONTRACTS, MARKETPLACE_CONTRACTS, SUPPORTED_TOKENS } from "@/lib/nfts";
import { getListing, cancelListing, makeOffer } from "thirdweb/extensions/marketplace";
import { getContract, toEther } from "thirdweb";
import { client } from "@/app/client";
import {
  BuyDirectListingButton,
  CreateDirectListingButton,
  useActiveAccount,
  TransactionButton,
} from "thirdweb/react";
import { useQuery } from "@tanstack/react-query";
import { sendTransaction } from "thirdweb";

export default function NFTItemPage() {
  // Params & State
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chain, collection, tokenId } = params as {
    chain: string;
    collection: string;
    tokenId: string;
  };
  const listingId = searchParams.get("listing");

  const account = useActiveAccount();

  // --- React Query Data Fetching ---
  // Find contract and chainId
  const contract = NFT_CONTRACTS.find(
    (c) => c.address.toLowerCase() === collection.toLowerCase()
  );
  const chainId = contract?.chainId || chain;
  const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

  // Fetch NFT data
  const {
    data: nft,
    isLoading: nftLoading,
    error: nftError,
  } = useQuery({
    queryKey: ["nft", chain, collection, tokenId],
    queryFn: async () => {
      const res = await fetch(
        `https://insight.thirdweb.com/v1/nfts/${collection}/${tokenId}?chain=${chainId}&resolve_metadata_links=true&clientId=${clientId}`
      );
      if (!res.ok) throw new Error("Failed to fetch NFT");
      const json = await res.json();
      return json.data[0];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch collection metadata
  const {
    data: collectionMeta,
    isLoading: collectionLoading,
    error: collectionError,
  } = useQuery({
    queryKey: ["collectionMeta", chain, collection],
    queryFn: async () => {
      const res = await fetch(
        `https://insight.thirdweb.com/v1/nfts/collections/${collection}?chain=${chainId}&include_stats=true&resolve_metadata_links=true&clientId=${clientId}`
      );
      if (!res.ok) throw new Error("Failed to fetch collection metadata");
      const json = await res.json();
      return json.data ? json.data[0] : json;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch activity/transfers
  const {
    data: activity,
    isLoading: activityLoading,
    error: activityError,
  } = useQuery({
    queryKey: ["activity", chain, collection, tokenId],
    queryFn: async () => {
      const res = await fetch(
        `https://insight.thirdweb.com/v1/nfts/transfers/${collection}/${tokenId}?chain=${chainId}&limit=50&metadata=false&sales=false&include_owners=false&resolve_metadata_links=true&clientId=${clientId}`
      );
      if (!res.ok) throw new Error("Failed to fetch activity");
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Compute current owner from activity
  const currentOwner = activity && activity.length > 0 ? activity[0].to_address : null;

  // Fetch listing (if listingId is present)
  const {
    data: listing,
    isLoading: listingLoading,
    error: listingError,
  } = useQuery({
    queryKey: ["listing", chain, collection, listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const contractInfo = NFT_CONTRACTS.find(
        (c) => c.address.toLowerCase() === collection.toLowerCase()
      );
      const _chainId = contractInfo?.chainId || chain;
      const marketplace = MARKETPLACE_CONTRACTS.find(
        (m: { chainId: number }) => m.chainId === Number(_chainId)
      );
      if (!marketplace || !listingId) return null;
      const contract = getContract({
        address: marketplace.address,
        chain: marketplace.chain,
        client,
      });
      return await getListing({ contract, listingId: BigInt(listingId) });
    },
    staleTime: 1000 * 60 * 5,
  });

  const loading = nftLoading || collectionLoading;
  const error = nftError?.message || collectionError?.message || null;

  const marketplace = MARKETPLACE_CONTRACTS.find((m: any) => m.chainId === Number(chain));

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("");
  const [offerValidity, setOfferValidity] = useState(24); // hours
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);

  // Find supported tokens for this chain
  const supportedTokens = SUPPORTED_TOKENS.find(
    (t) => t.chainId === Number(chain)
  )?.tokens || [];

  // --- Render ---
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">Loading…</div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : nft ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Image */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="relative w-full h-[800px] bg-[#050505] rounded-lg overflow-hidden border border-[#1F1F1F] flex items-center justify-center mx-auto">
                {nft.extra_metadata?.image_url ? (
                  <img
                    src={nft.extra_metadata?.image_url}
                    alt={nft.name ?? nft.token_id}
                    style={{
                      objectFit: "cover",
                      background: "#181818",
                      width: "100%",
                      height: "100%",
                      display: "block",
                    }}
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
                  <a href={`/nfts/${chain}/${collection}`} className="hover:underline">
                    {collectionMeta?.name ?? "Collection"}
                  </a>
                </p>
                <h1 className="text-3xl font-bold break-all mb-2">
                  {nft.name ?? `Token #${nft.token_id}`}
                </h1>
                {/* Current owner */}
                {currentOwner && (
                  <div className="text-xs text-gray-400 mb-2">
                    Owner: <span className="font-mono text-blue-400">{currentOwner.slice(0, 6)}…{currentOwner.slice(-4)}</span>
                  </div>
                )}
              </div>

              {/* Attributes */}
              {nft.extra_metadata?.attributes?.length > 0 && (
                <div className="border border-[#1F1F1F] p-4 rounded-lg">
                  <div className="font-semibold mb-2">Attributes</div>
                  <div className="flex flex-wrap gap-2">
                    {nft.extra_metadata.attributes.map((attr: any, idx: number) => (
                      <div key={idx} className="bg-[#181818] border border-[#232323] rounded px-3 py-1 text-xs">
                        <span className="text-gray-400 mr-1">{attr.trait_type}:</span>
                        <span className="text-white font-semibold">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price box */}
              <div className="border border-[#1F1F1F] p-6 rounded-lg relative">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  Current Price
                
                </p>
                {listing ? (
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-semibold text-green-400">{toEther(listing.pricePerToken)}</span>
                    <span className="text-gray-400">{listing.currencyValuePerToken?.symbol || ""}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-semibold">-</span>
                    <span className="text-gray-400">-</span>
                  </div>
                )}
                <div className="flex gap-3">
                  {listing && account && currentOwner && account.address.toLowerCase() !== currentOwner.toLowerCase() && marketplace && (
                    <div className="flex w-full gap-3">
                      <BuyDirectListingButton
                        contractAddress={listing.assetContractAddress}
                        chain={marketplace.chain}
                        client={client}
                        listingId={listing.id}
                        quantity={1n}
                        onError={(error) => {
                          console.error("Transaction error", error);
                        }}
                        unstyled
                        className="flex-1 bg-white text-black border border-black font-semibold py-2 px-6 rounded-none rounded-l-md hover:bg-gray-100 transition"
                      >
                        Buy now
                      </BuyDirectListingButton>
                      <button
                        className="flex-1 bg-black text-white border border-[#333] font-semibold py-2 px-6 rounded-none rounded-r-md hover:bg-[#181818] transition"
                        onClick={() => {
                          setShowOfferModal(true);
                          setOfferPrice("");
                          setOfferCurrency("");
                          setOfferValidity(24);
                          setOfferError(null);
                        }}
                      >
                        Make offer
                      </button>
                    </div>
                  )}
                  {account && currentOwner && account.address.toLowerCase() === currentOwner.toLowerCase() && marketplace && (
                    listing ? (
                      <TransactionButton
                        transaction={async () => {
                          const contract = getContract({
                            address: marketplace.address,
                            chain: marketplace.chain,
                            client,
                          });
                          return cancelListing({
                            contract,
                            listingId: listing.id,
                          });
                        }}
                        onTransactionSent={(result) => {
                          console.log("Transaction submitted", result.transactionHash);
                        }}
                        onTransactionConfirmed={(receipt) => {
                          console.log("Transaction confirmed", receipt.transactionHash);
                          // Remove ?listing=... from the URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("listing");
                          router.replace(url.pathname + url.search);
                        }}
                        onError={(error) => {
                          console.error("Transaction error", error);
                        }}
                        unstyled
                        className="flex-1 bg-white text-black border border-black font-semibold py-2 px-6 rounded-md hover:bg-gray-100 transition"
                      >
                        Cancel Listing
                      </TransactionButton>
                    ) : (
                      <button
                        className="flex-1 border-white border-2 hover:bg-white/10 rounded px-4 py-2 text-white"
                        onClick={() => {
                          setShowDetailsModal(true);
                          setShowCreateListing(false);
                          setSellPrice("");
                        }}
                      >
                        Sell NFT
                      </button>
                    )
                  )}
                </div>
                {/* Details Modal */}
                {showDetailsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowDetailsModal(false)}>
                    <div
                      className="bg-[#18181b] rounded-xl border border-[#232329] shadow-2xl p-6 w-full max-w-md relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
                        onClick={() => setShowDetailsModal(false)}
                        aria-label="Close"
                        style={{ lineHeight: 1 }}
                      >
                        ×
                      </button>
                      <h2 className="text-xl font-bold mb-4 text-white">NFT Price & Supported Tokens</h2>
                      <div className="mb-4">
                        <div className="text-gray-400 text-sm mb-1">Current Price</div>
                        <div className="text-2xl font-semibold text-green-400">
                          {listing ? toEther(listing.pricePerToken) : "-"}
                          <span className="text-base text-gray-400 ml-2">{listing?.currencyValuePerToken?.symbol || "-"}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Supported Tokens for this Chain</div>
                        <div className="flex flex-wrap gap-2">
                          {supportedTokens.length === 0 ? (
                            <span className="text-gray-500">No supported tokens found.</span>
                          ) : (
                            supportedTokens.map((token, idx) => (
                              <div key={token.tokenAddress} className="flex items-center gap-2 bg-[#232329] px-3 py-1 rounded text-xs text-white border border-[#333]">
                                {token.icon && <img src={token.icon} alt={token.symbol} className="w-4 h-4 rounded-full" />}
                                <span className="font-semibold">{token.symbol}</span>
                                <span className="text-gray-400">{token.tokenAddress.slice(0, 6)}…{token.tokenAddress.slice(-4)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Sell Modal */}
                {showDetailsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowDetailsModal(false)}>
                    <div
                      className="bg-[#18181b] rounded-xl border border-[#232329] shadow-2xl p-6 w-full max-w-md relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
                        onClick={() => setShowDetailsModal(false)}
                        aria-label="Close"
                        style={{ lineHeight: 1 }}
                      >
                        ×
                      </button>
                      <h2 className="text-xl font-bold mb-4 text-white">Sell NFT</h2>
                      <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-1" htmlFor="sellPrice">Set your price</label>
                        <input
                          id="sellPrice"
                          type="number"
                          min="0"
                          step="any"
                          value={sellPrice}
                          onChange={e => setSellPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded border border-[#232329] bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter price (ETH)"
                        />
                      </div>
                      {!showCreateListing ? (
                        <button
                          className="w-full bg-white text-black rounded px-4 py-2 font-semibold hover:bg-gray-200 transition"
                          disabled={!sellPrice || Number(sellPrice) <= 0}
                          onClick={() => setShowCreateListing(true)}
                        >
                          Continue
                        </button>
                      ) : (
                        marketplace ? (
                          <CreateDirectListingButton
                            contractAddress={marketplace.address}
                            chain={marketplace.chain}
                            client={client}
                            tokenId={BigInt(nft.token_id)}
                            assetContractAddress={nft.contract.address}
                            pricePerToken={sellPrice}
                            unstyled
                            className="w-full border-white border-2 hover:bg-white/10 rounded px-4 py-2 text-white mt-2"
                            onTransactionConfirmed={(receipt) => {
                              // TODO: Extract listing id from receipt if possible
                              // If your CreateDirectListingButton provides the new listing id another way, use that here
                              // Example: if (receipt.listingId) { ... }
                              setShowDetailsModal(false);
                              setShowCreateListing(false);
                              setSellPrice("");
                            }}
                            onError={(error) => {
                              console.error("Transaction error", error);
                            }}
                          >
                            Confirm & List NFT
                          </CreateDirectListingButton>
                        ) : (
                          <div className="text-red-500 text-center">Marketplace not found for this chain.</div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Collection info */}
              {collectionMeta && (
                <div className="border border-[#1F1F1F] p-6 rounded-lg">
                  <div className="font-semibold mb-2">Collection Info</div>
                  <div className="flex items-center gap-3 mb-2">
                    {collectionMeta.image_url && (
                      <img
                        src={collectionMeta.image_url}
                        alt={collectionMeta.name}
                        className="w-10 h-10 rounded border border-[#232323] object-cover"
                      />
                    )}
                    <span className="font-bold">{collectionMeta.name}</span>
                    {collectionMeta.symbol && (
                      <span className="text-xs text-gray-400 ml-2">{collectionMeta.symbol}</span>
                    )}
                  </div>
                  {collectionMeta.description && (
                    <div className="text-xs text-gray-400 mb-2">{collectionMeta.description}</div>
                  )}
                  {collectionMeta.stats && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
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
                    </div>
                  )}
                </div>
              )}

              {/* Item Activity */}
              <div className="border border-[#1F1F1F] p-6 rounded-lg">
                <div className="font-semibold mb-2">Item Activity</div>
                {activityLoading ? (
                  <div>Loading activity…</div>
                ) : activityError ? (
                  <div className="text-red-500">{typeof activityError === 'string' ? activityError : (activityError?.message || 'Error loading activity')}</div>
                ) : activity && activity.length === 0 ? (
                  <div className="text-gray-400">No activity found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#222]">
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">From</th>
                          <th className="py-2 pr-4">To</th>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Txn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.map((tx: any, idx: number) => (
                          <tr key={tx.transaction_hash + tx.log_index} className="border-b border-[#181818]">
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
            </div>
          </div>
        ) : (
          <p>NFT not found.</p>
        )}
        {/* Make Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowOfferModal(false)}>
            <div
              className="bg-[#18181b] rounded-xl border border-[#232329] shadow-2xl p-6 w-full max-w-md relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
                onClick={() => setShowOfferModal(false)}
                aria-label="Close"
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-white">Make an Offer</h2>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1" htmlFor="offerPrice">Offer Price</label>
                <input
                  id="offerPrice"
                  type="number"
                  min="0"
                  step="any"
                  value={offerPrice}
                  onChange={e => setOfferPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#232329] bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter offer price"
                  disabled={offerLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1" htmlFor="offerCurrency">Currency</label>
                <select
                  id="offerCurrency"
                  value={offerCurrency}
                  onChange={e => setOfferCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#232329] bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={offerLoading}
                >
                  <option value="">Select a token</option>
                  {supportedTokens.map((token) => (
                    <option key={token.tokenAddress} value={token.tokenAddress}>
                      {token.symbol} ({token.tokenAddress.slice(0, 6)}…{token.tokenAddress.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1" htmlFor="offerValidity">Offer Validity (hours)</label>
                <input
                  id="offerValidity"
                  type="number"
                  min="1"
                  step="1"
                  value={offerValidity}
                  onChange={e => setOfferValidity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded border border-[#232329] bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="24"
                  disabled={offerLoading}
                />
              </div>
              {offerError && (
                <div className="text-red-500 text-sm mb-2 text-center">{offerError}</div>
              )}
              <TransactionButton
                transaction={async () => {
                  setOfferLoading(true);
                  setOfferError(null);
                  try {
                    const contractInfo = NFT_CONTRACTS.find(
                      (c) => c.address.toLowerCase() === collection.toLowerCase()
                    );
                    const chainId = contractInfo?.chainId || chain;
                    const marketplace = MARKETPLACE_CONTRACTS.find(
                      (m: { chainId: number }) => m.chainId === Number(chainId)
                    );
                    if (!marketplace) throw new Error("Marketplace not found for this chain");
                    const contract = getContract({
                      address: marketplace.address,
                      chain: marketplace.chain,
                      client,
                    });
                    const offerTx = makeOffer({
                      contract,
                      assetContractAddress: collection,
                      tokenId: BigInt(tokenId),
                      currencyContractAddress: offerCurrency,
                      offerExpiresAt: new Date(Date.now() + offerValidity * 60 * 60 * 1000),
                      totalOffer: offerPrice,
                    });
                    return offerTx;
                  } catch (err: any) {
                    setOfferError(err?.message || "Failed to create offer");
                    throw err;
                  } finally {
                    setOfferLoading(false);
                  }
                }}
                onTransactionSent={() => setOfferLoading(true)}
                onTransactionConfirmed={() => {
                  setOfferLoading(false);
                  setShowOfferModal(false);
                }}
                onError={(error) => {
                  setOfferLoading(false);
                  setOfferError(error?.message || "Failed to create offer");
                }}
                disabled={!offerPrice || !offerCurrency || Number(offerPrice) <= 0 || offerLoading}
                unstyled
                className="w-full bg-blue-500 text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {offerLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                )}
                Submit Offer
              </TransactionButton>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
