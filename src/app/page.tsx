"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb"
import type { Route } from "thirdweb/bridge"
import { client } from "./client"

import Header from "@/components/Header"
import "keen-slider/keen-slider.min.css"
import PopularTokensGrid from "@/components/feature/PopularTokensGrid"
import AvailableTokensTable from "@/components/feature/AvailableTokensTable"
import HomePayModal from "@/components/feature/HomePayModal"

export default function Home() {
  const [destinationTokens, setDestinationTokens] = useState<Route["destinationToken"][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const routesPerPage = 10
  const [searchTerm, setSearchTerm] = useState("")
  const [payModalToken, setPayModalToken] = useState<null | typeof popularTokens[0]>(null)

  // Hardcoded popular tokens
  const popularTokens = [
    {
      name: "PLUME",
      symbol: "PLUME",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/53623/standard/plume-token.png?1736896935",
      chainId: 1,
      address: "0x4C1746A800D224393fE2470C70A35717eD4eA5F1",
      iconUrl: "https://assets.coingecko.com/coins/images/53623/standard/plume-token.png?1736896935",
    },
    {
      name: "Dai Stablecoin",
      symbol: "DAI",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
      chainId: 1,
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      iconUrl: "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
    },
    {
      name: "G7",
      symbol: "G7",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/37207/standard/G.jpg",
      chainId: 1,
      address: "0x12c88a3C30A7AaBC1dd7f2c08a97145F5DCcD830",
      iconUrl: "https://assets.coingecko.com/coins/images/37207/standard/G.jpg",
    },
    {
      name: "Gho Token",
      symbol: "GHO",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/30663/large/gho-token-logo.png?1720517092",
      chainId: 1,
      address: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
      iconUrl: "https://coin-images.coingecko.com/coins/images/30663/large/gho-token-logo.png?1720517092",
    },
    {
      name: "Degen",
      symbol: "DEGEN",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/34515/large/android-chrome-512x512.png?1706198225",
      chainId: 8453,
      address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
      iconUrl: "https://coin-images.coingecko.com/coins/images/34515/large/android-chrome-512x512.png?1706198225",
    },
    {
      name: "Godcoin",
      symbol: "GOD",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/53848/standard/GodcoinTickerIcon_02.png",
      chainId: 1,
      address: "0xb5130F4767AB0ACC579f25a76e8f9E977CB3F948",
      iconUrl: "https://assets.coingecko.com/coins/images/53848/standard/GodcoinTickerIcon_02.png",
    },
    {
      name: "BERA Token",
      symbol: "BERA",
      price: 0,
      change24h: 0,
      icon: "https://assets.relay.link/icons/currencies/bera.png",
      chainId: 80094,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      iconUrl: "https://assets.relay.link/icons/currencies/bera.png",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      iconUrl: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731",
      chainId: 1,
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      iconUrl: "https://coin-images.coingecko.com/coins/images/39963/large/usdt.png?1724952731",
    },
    {
      name: "Ether",
      symbol: "ETH",
      price: 0,
      change24h: 0,
      icon: "https://assets.relay.link/icons/1/light.png",
      chainId: 1,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      iconUrl: "https://assets.relay.link/icons/1/light.png",
    },
    {
      name: "ApeCoin",
      symbol: "APE",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/24383/large/apecoin.jpg?1696523566",
      chainId: 1,
      address: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
      iconUrl: "https://coin-images.coingecko.com/coins/images/24383/large/apecoin.jpg?1696523566",
    },
    {
      name: "Wrapped BTC",
      symbol: "WBTC",
      price: 0,
      change24h: 0,
      icon: "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696508617",
      chainId: 1,
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      iconUrl: "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696508617",
    },
    {
      name: "POL",
      symbol: "POL",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
      chainId: 137,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      iconUrl: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
    },
    {
      name: "USDB",
      symbol: "USDB",
      price: 0,
      change24h: 0,
      icon: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/blast/assets/0x4300000000000000000000000000000000000003/logo.png",
      chainId: 81457,
      address: "0x4300000000000000000000000000000000000003",
      iconUrl: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/blast/assets/0x4300000000000000000000000000000000000003/logo.png",
    },
    {
      name: "Powerloom Token",
      symbol: "POWER",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/53319/standard/powerloom-200px.png",
      chainId: 1,
      address: "0x429F0d8233e517f9acf6F0C8293BF35804063a83",
      iconUrl: "https://assets.coingecko.com/coins/images/53319/standard/powerloom-200px.png",
    },
    {
      name: "Animecoin",
      symbol: "ANIME",
      price: 0,
      change24h: 0,
      icon: "https://assets.coingecko.com/coins/images/53575/standard/anime.jpg",
      chainId: 1,
      address: "0x4DC26fC5854e7648a064a4ABD590bBE71724C277",
      iconUrl: "https://assets.coingecko.com/coins/images/53575/standard/anime.jpg",
    },
  ]

  useEffect(() => {
    const fetchUniqueDestinationTokens = async () => {
      setLoading(true)
      setError(null)
      try {
        const tokensMap = new Map<string, Route["destinationToken"]>()
        const batchSize = 50 // Increased batch size to get more tokens at once
        let batchOffset = (currentPage - 1) * batchSize
        let attempts = 0
        const maxAttempts = 20 // Increased max attempts to find more tokens with price data

        while (tokensMap.size < routesPerPage * 5 && attempts < maxAttempts) { // Get more tokens to filter
          const result = await Bridge.routes({
            client,
            limit: batchSize,
            offset: batchOffset,
          })
          console.log(result)

          if (!result.length) {
            console.log(`No more tokens available after ${attempts} attempts. Found ${tokensMap.size} tokens.`)
            break
          }

          for (const route of result) {
            const token = route.destinationToken
            // Filter by search term if it exists
            if (searchTerm) {
              const searchLower = searchTerm.toLowerCase()
              const matchesSearch =
                token.symbol.toLowerCase().includes(searchLower) ||
                token.chainId.toString().includes(searchLower) ||
                token.address.toLowerCase().includes(searchLower)
              if (!matchesSearch) continue
            }

            // Create a unique key using symbol, chainId, and address
            const uniqueKey = `${token.symbol.toLowerCase()}_${token.chainId}_${token.address.toLowerCase()}`;
            if (!tokensMap.has(uniqueKey)) {
              tokensMap.set(uniqueKey, token)
            }
            if (tokensMap.size >= routesPerPage * 10) break // Fetch even more tokens to ensure we have enough with price data
          }

          attempts++
          batchOffset += batchSize
        }

        // Group tokens into batches with at most 5 unique chains per batch
        function groupTokensByChains(tokens: Route["destinationToken"][], maxChains = 5) {
          const groups: Route["destinationToken"][][] = [];
          let currentGroup: Route["destinationToken"][] = [];
          let currentChains = new Set<number>();

          for (const token of tokens) {
            if (!currentChains.has(token.chainId) && currentChains.size >= maxChains) {
              groups.push([...currentGroup]);
              currentGroup = [token];
              currentChains = new Set([token.chainId]);
            } else {
              currentGroup.push(token);
              currentChains.add(token.chainId);
            }
          }
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          return groups;
        }

        const tokensArray = Array.from(tokensMap.values());
        const tokenGroups = groupTokensByChains(tokensArray, 5);

        let allInsightData: any[] = [];
        for (const group of tokenGroups) {
          const addresses = group.map(t => t.address);
          const params = addresses.map(addr => `address=${addr}`).join('&');
          const uniqueChains = Array.from(new Set(group.map(t => t.chainId)));
          const chainParams = uniqueChains.map(chainId => `chain=${chainId}`).join('&');
          const insightUrl = `https://insight.thirdweb.com/v1/tokens/price?${chainParams}&include_historical_prices=false&include_holders=false&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}&${params}`;
          
          console.log(`Fetching price data for ${addresses.length} tokens across ${uniqueChains.length} chains: ${uniqueChains.join(', ')}`);
          
          const insightRes = await fetch(insightUrl);
          const insightData = await insightRes.json();
          
          if (insightData && insightData.data) {
            allInsightData = allInsightData.concat(insightData.data);
          }
        }

        console.log(`Total tokens with price data: ${allInsightData.length}`);

        // After fetching tokensMap and insightData
        const insightMap = new Map(
          allInsightData.map((item: { chain_id: any; address: string }) => [
            `${item.chain_id}:${item.address.toLowerCase()}`,
            item,
          ])
        );

        const mergedTokens = Array.from(tokensMap.values()).map(token => {
          const key = `${token.chainId}:${token.address.toLowerCase()}`;
          const insight: any = insightMap.get(key);
          return {
            ...token,
            price_usd: insight?.price_usd ?? null,
            percent_change_24h: insight?.percent_change_24h ?? null,
            market_cap_usd: insight?.market_cap_usd ?? null,
            volume_24h_usd: insight?.volume_24h_usd ?? null,
            volume_change_24h: insight?.volume_change_24h ?? null,
          };
        });

        // Filter out tokens without price data - only keep tokens with price data
        const filteredTokens = mergedTokens.filter(token => 
          typeof token.price_usd === 'number' && token.price_usd !== null
        );

        // Create a unique key for each token based on symbol, chainId, and address
        const uniqueTokensMap = new Map();
        filteredTokens.forEach(token => {
          const uniqueKey = `${token.symbol.toLowerCase()}_${token.chainId}_${token.address.toLowerCase()}`;
          uniqueTokensMap.set(uniqueKey, token);
        });

        // Get unique tokens as array
        const uniqueTokens = Array.from(uniqueTokensMap.values());

        const sortedTokens = [...uniqueTokens].sort((a, b) => {
          // Sort by market cap if available
          if (a.market_cap_usd && b.market_cap_usd) {
            return b.market_cap_usd - a.market_cap_usd;
          }
          // Then by price
          return (b.price_usd ?? 0) - (a.price_usd ?? 0);
        });

        // Limit to exactly 10 tokens
        const limitedTokens = sortedTokens.slice(0, 10);

        setDestinationTokens(limitedTokens)
        if (limitedTokens.length === 0) {
          setError("No tokens with price data found matching your search criteria")
        } else if (limitedTokens.length < 10) {
          console.log(`Could only find ${limitedTokens.length} tokens with price data`)
        }
      } catch (error) {
        console.error("Error fetching unique destination tokens", error)
        setError("Failed to fetch tokens. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUniqueDestinationTokens()
  }, [currentPage, searchTerm])

  const totalPages = Math.ceil(35000 / routesPerPage)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const refreshRoutes = () => {
    setCurrentPage(1)
    setSearchTerm("")
  }

  return (
    <main className="min-h-screen bg-[#000] text-white">
      <Header />

      {/* Explore Section */}
      <section className="container mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-gray-400 mb-4 max-w-2xl">
          Track live cryptocurrency prices, charts, market caps, and volume. Discover trending coins, explore top movers, and purchase tokens seamlessly with Universal Bridge.
        </p>
      </section>

      {/* Popular Tokens Section */}
      <PopularTokensGrid
        popularTokens={popularTokens}
        setPayModalToken={setPayModalToken}
      />

      {/* Available Tokens Section */}
      <AvailableTokensTable
        destinationTokens={destinationTokens}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        refreshRoutes={refreshRoutes}
        setPayModalToken={setPayModalToken}
        NATIVE_TOKEN_ADDRESS={NATIVE_TOKEN_ADDRESS}
      />

      {/* Modal for PayEmbed */}
      <HomePayModal open={!!payModalToken} onClose={() => setPayModalToken(null)} token={payModalToken} client={client} />
    </main>
  )
}

