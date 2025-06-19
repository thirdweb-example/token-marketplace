"use client"

import React from "react"
import { useState } from "react"
import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb"
import { client } from "./client"
import { useQuery } from "@tanstack/react-query"

import Header from "@/components/Header"
import "keen-slider/keen-slider.min.css"
import PopularTokensGrid from "@/components/feature/PopularTokensGrid"
import AvailableTokensTable from "@/components/feature/AvailableTokensTable"
import HomePayModal from "@/components/feature/HomePayModal"

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

const useTokensData = () => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      // Get tokens directly using Bridge.tokens
      const tokens = await Bridge.tokens({
        client,
        limit: 1000,
      });
      console.log(`Fetched ${tokens.length} tokens from bridge API`);

      // Create unique tokens map to avoid duplicates
      const tokensMap = new Map();
      for (const token of tokens) {
        const uniqueKey = `${token.symbol.toLowerCase()}_${token.chainId}_${token.address.toLowerCase()}`;
        if (!tokensMap.has(uniqueKey)) {
          tokensMap.set(uniqueKey, token);
        }
      }
      console.log(`Found ${tokensMap.size} unique tokens`);

      const tokensArray = Array.from(tokensMap.values());

      // Group tokens by chainId
      const tokensByChain = tokensArray.reduce((acc, token) => {
        if (!acc[token.chainId]) acc[token.chainId] = [];
        acc[token.chainId].push(token);
        return acc;
      }, {});

      // Split chain groups into batches with much smaller size
      const chainIds = Object.keys(tokensByChain);
      const batches = [];
      const MAX_TOKENS_PER_BATCH = 30;
      const MAX_CHAINS_PER_BATCH = 5;

      for (let i = 0; i < chainIds.length; i += MAX_CHAINS_PER_BATCH) {
        const batchChains = chainIds.slice(i, i + MAX_CHAINS_PER_BATCH);
        const allTokensInChains = batchChains.flatMap(chainId => tokensByChain[chainId]);
        
        // Further split tokens into smaller batches
        for (let j = 0; j < allTokensInChains.length; j += MAX_TOKENS_PER_BATCH) {
          const batchTokens = allTokensInChains.slice(j, j + MAX_TOKENS_PER_BATCH);
          batches.push({ chains: batchChains.map(Number), tokens: batchTokens });
        }
      }

      const allInsightData: any[] = [];

      // Send concurrent Insight API requests
      const batchPromises = batches.map(async (batch) => {
        const addresses = batch.tokens.map(t => `address=${t.address}`).join('&');
        const chains = batch.chains.map(c => `chain=${c}`).join('&');
        const insightUrl = `https://insight.thirdweb.com/v1/tokens/price?${chains}&include_historical_prices=false&include_holders=false&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}&${addresses}`;

        console.log(`Fetching price data for ${batch.tokens.length} tokens across ${batch.chains.length} chains`);

        try {
          const response = await fetch(insightUrl);
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          const data = await response.json();
          return data.data || [];
        } catch (err) {
          console.error('Failed fetching batch:', err);
          return [];
        }
      });

      // Use Promise.all instead of Promise.allSettled for better error handling
      // and limit concurrency to avoid overwhelming the API
      const results = [];
      const CONCURRENCY_LIMIT = 5;
      
      for (let i = 0; i < batchPromises.length; i += CONCURRENCY_LIMIT) {
        const batchGroup = batchPromises.slice(i, i + CONCURRENCY_LIMIT);
        const batchResults = await Promise.allSettled(batchGroup);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            allInsightData.push(...result.value);
          }
        }
      }

      const insightMap = new Map(
        allInsightData.map(item => [
          `${item.chain_id}:${item.address.toLowerCase()}`,
          item,
        ])
      );

      const mergedTokens = tokensArray.map(token => {
        const key = `${token.chainId}:${token.address.toLowerCase()}`;
        const insight = insightMap.get(key);
        return {
          ...token,
          price_usd: insight?.price_usd ?? null,
          percent_change_24h: insight?.percent_change_24h ?? null,
          market_cap_usd: insight?.market_cap_usd ?? null,
          volume_24h_usd: insight?.volume_24h_usd ?? null,
          volume_change_24h: insight?.volume_change_24h ?? null,
        };
      });

      const filteredTokens = mergedTokens.filter(token => typeof token.price_usd === 'number');

      const uniqueTokensMap = new Map();
      filteredTokens.forEach(token => {
        const uniqueKey = `${token.symbol.toLowerCase()}_${token.chainId}_${token.address.toLowerCase()}`;
        uniqueTokensMap.set(uniqueKey, token);
      });

      const sortedTokens = Array.from(uniqueTokensMap.values()).sort((a, b) => {
        if (a.market_cap_usd && b.market_cap_usd) {
          return b.market_cap_usd - a.market_cap_usd;
        }
        return (b.price_usd ?? 0) - (a.price_usd ?? 0);
      });

      console.log(`Found ${sortedTokens.length} tokens with price data`);
      return sortedTokens;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};



export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [payModalToken, setPayModalToken] = useState<null | typeof popularTokens[0]>(null);
  const routesPerPage = 10;

  // Fetch token data using React Query
  const { data: allTokens = [], isLoading, error: queryError } = useTokensData();

  // Filter tokens by search term
  const filteredTokens = searchTerm 
    ? allTokens.filter(token => 
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.chainId.toString().includes(searchTerm.toLowerCase())
      )
    : allTokens;

  // Sort tokens alphabetically by name
  const sortedTokens = filteredTokens.slice().sort((a, b) => a.name.localeCompare(b.name));

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(sortedTokens.length / routesPerPage));
  
  // Get current page tokens
  const startIndex = (currentPage - 1) * routesPerPage;
  const paginatedTokens = sortedTokens.slice(startIndex, startIndex + routesPerPage);

  // Reset to page 1 when search term changes
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  }

  // Clear search and reset page
  const refreshRoutes = () => {
    setCurrentPage(1);
    setSearchTerm("");
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
        destinationTokens={paginatedTokens}
        loading={isLoading}
        error={queryError ? "Failed to fetch tokens. Please try again later." : (paginatedTokens.length === 0 && searchTerm ? "No tokens found matching your search criteria" : null)}
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

