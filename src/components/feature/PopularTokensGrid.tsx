import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Token {
  name: string
  symbol: string
  price: number
  change24h: number
  icon: string
  chainId: number
  address: string
  iconUrl: string
  price_usd?: number | null
  percent_change_24h?: number | null
}

type Props = {
  popularTokens: Token[]
  setPayModalToken: (token: Token) => void
}

const PopularTokensGrid: React.FC<Props> = ({ popularTokens, setPayModalToken }) => {
  const [tokensWithPrices, setTokensWithPrices] = useState<Token[]>(popularTokens);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      try {
        // Build URL params for insight API
        const params = new URLSearchParams();
        // Get unique chains, but limit to 5 per API constraint
        const uniqueChains = Array.from(new Set(popularTokens.map(t => t.chainId))).slice(0, 5);
        uniqueChains.forEach(chainId => params.append("chain", String(chainId)));
        
        // Add addresses
        popularTokens.forEach(token => params.append("address", token.address));
        
        params.append("include_historical_prices", "false");
        params.append("include_holders", "false");
        params.append("clientId", process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!);

        const insightUrl = `https://insight.thirdweb.com/v1/tokens/price?${params.toString()}`;
        const response = await fetch(insightUrl);
        const data = await response.json();

        if (data && data.data) {
          // Create lookup map for O(1) access
          const priceMap = new Map(
            data.data.map((item: any) => [
              `${item.chain_id}:${item.address.toLowerCase()}`,
              item
            ])
          );

          // Update tokens with price data
          const updatedTokens = popularTokens.map(token => {
            const key = `${token.chainId}:${token.address.toLowerCase()}`;
            const priceData = priceMap.get(key) as { price_usd?: number, percent_change_24h?: number } || {};
            
            return {
              ...token,
              price_usd: priceData?.price_usd || null,
              percent_change_24h: priceData?.percent_change_24h || null
            };
          });

          setTokensWithPrices(updatedTokens);
        }
      } catch (error) {
        console.error("Error fetching price data for popular tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [popularTokens]);

  return (
    <div className="container mx-auto px-4 pt-10">
      <h2 className="text-2xl font-bold mb-4">Popular Tokens</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {tokensWithPrices.slice(0, 16).map((token) => (
          <div
            key={token.symbol}
            className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 flex flex-col justify-between min-h-[220px] transition-shadow hover:shadow-lg cursor-pointer relative"
            style={{ borderRadius: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#1F1F1F' }}
          >
            <Link
              href={`/swap?token=${encodeURIComponent(token.symbol)}&name=${encodeURIComponent(token.name)}&chainId=${token.chainId}&address=${encodeURIComponent(token.address)}&iconUrl=${encodeURIComponent(token.iconUrl)}`}
              className="block group flex-1"
              style={{ minHeight: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#18181b] flex items-center justify-center">
                  <Image
                    src={token.icon || "/placeholder.svg"}
                    alt={token.symbol}
                    width={56}
                    height={56}
                    unoptimized={true}
                    className="object-cover w-16 h-16 rounded-full"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg">{token.name}</div>
                  <div className="text-xs text-gray-400 font-semibold">{token.symbol}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 mb-4">
                <div>
                  <div className="text-xs text-gray-400">Price</div>
                  {loading ? (
                    <Skeleton className="h-6 w-20 bg-[#222]" />
                  ) : (
                    <div className="text-xl font-bold">
                      {typeof token.price_usd === 'number' 
                        ? `$${token.price_usd.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 3 
                          })}` 
                        : '--'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-gray-400">24H</div>
                  {loading ? (
                    <Skeleton className="h-6 w-16 bg-[#222] rounded-full mt-1" />
                  ) : (
                    <div
                      className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 ${
                        typeof token.percent_change_24h === 'number'
                          ? (token.percent_change_24h >= 0 
                            ? "bg-green-900/60 text-green-400" 
                            : "bg-red-900/60 text-red-400")
                          : "bg-gray-900/60 text-gray-400"
                      }`}
                    >
                      {typeof token.percent_change_24h === 'number'
                        ? `${token.percent_change_24h >= 0 ? '+' : ''}${token.percent_change_24h.toFixed(2)}%`
                        : '--'}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <Button
              className="w-full bg-[#171717] text-white hover:bg-[#262626] px-4 py-2 rounded mt-4"
              onClick={e => {
                e.stopPropagation();
                // Use real-time price data if available
                setPayModalToken({
                  ...token,
                  // Don't override with nulls if API data isn't available
                  ...(token.price_usd !== null && token.price_usd !== undefined && { price: token.price_usd }),
                  ...(token.percent_change_24h !== null && token.percent_change_24h !== undefined && { change24h: token.percent_change_24h })
                });
              }}
            >
              Buy
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PopularTokensGrid; 