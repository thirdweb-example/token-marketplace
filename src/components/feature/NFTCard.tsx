'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import DefaultTokenIcon from "@/components/ui/DefaultTokenIcon";
import type { NFT } from "@/lib/nfts";

interface Props {
  nft: NFT;
  price?: string;
  currencySymbol?: string;
  listingId?: string | number | bigint;
}

const chainNameMap: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  137: "Polygon",
  43113: "Avalanche Fuji",
  80002: "Polygon Amoy",
  11155111: "Sepolia",
};

export default function NFTCard({ nft, price, currencySymbol, listingId }: Props) {
  console.log(nft);
  const href = `/nfts/${nft.contract.chain_id}/${nft.contract.address}/${nft.token_id}` +
    (listingId ? `?listing=${listingId}` : "");
  return (
    <Link href={href} className="block group">
      <Card className="bg-[#121212] border-[#1F1F1F] group-hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
        <div className="relative w-full pt-[100%] bg-[#050505]">
          {nft.extra_metadata.image_url ? (
            <Image
              src={nft.extra_metadata.image_url}
              alt={nft.name || nft.token_id}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-[#18181b]">
              <DefaultTokenIcon symbol={nft.token_id.slice(-2)} />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-1 flex-1">
          <span className="font-semibold text-white text-sm truncate">
            {nft.name || `Token #${nft.token_id}`}
          </span>
          {price && (
            <span className="text-base font-bold text-green-400 truncate">
              {price} {currencySymbol || ""}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {chainNameMap[nft.chain_id] || nft.chain_id}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
