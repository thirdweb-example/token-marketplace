"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NATIVE_TOKEN_ADDRESS, defineChain } from "thirdweb";
import { toEther } from "thirdweb/utils";
import { client } from "../client";

import { getChainMetadata } from "thirdweb/chains";
import Header from "@/components/Header";

import PayEmbedWidget from "@/components/feature/PayEmbedWidget";
import TokenHeader from "@/components/feature/TokenHeader";
import ChartSection from "@/components/feature/ChartSection";
import StatsSection from "@/components/feature/StatsSection";
import AboutSection from "@/components/feature/AboutSection";
import TransfersTable from "@/components/feature/TransfersTable";

interface TokenData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  volumeChange24h: number;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  holdersCount: number;
  historicalPrices: {
    "1h": Array<{
      timestamp: number;
      price: number;
    }>;
    "24h": Array<{
      timestamp: number;
      price: number;
    }>;
    "7d": Array<{
      timestamp: number;
      price: number;
    }>;
    "30d": Array<{
      timestamp: number;
      price: number;
    }>;
  };
  transfers: Array<{
    from: string;
    to: string;
    amount: string;
    timestamp: number;
    transactionHash: string;
    blockNumber: string;
    transferType: string;
    formattedAmount: string;
  }>;
}

function getPayEmbedCodeLines(
  chainIdParam: string | number,
  tokenName: string,
  tokenSymbol: string,
  tokenAddress: string,
) {
  return [
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "createThirdwebClient" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb"' },
      { type: "plain", value: ";" },
    ],
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "PayEmbed" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb/react"' },
      { type: "plain", value: ";" },
    ],
    [],
    [
      { type: "keyword", value: "import" },
      { type: "plain", value: " { " },
      { type: "identifier", value: "defineChain" },
      { type: "plain", value: " } " },
      { type: "keyword", value: "from" },
      { type: "plain", value: " " },
      { type: "string", value: '"thirdweb/chains"' },
      { type: "plain", value: ";" },
    ],
    [],
    [
      { type: "keyword", value: "const" },
      { type: "plain", value: " client = createThirdwebClient({" },
    ],
    [
      { type: "plain", value: "  clientId: " },
      { type: "string", value: '"...."' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "});" }],
    [],
    [
      { type: "keyword", value: "const" },
      { type: "plain", value: " chain = defineChain(" },
      { type: "number", value: chainIdParam },
      { type: "plain", value: ");" },
    ],
    [],
    [
      { type: "keyword", value: "function" },
      { type: "plain", value: " Example() {" },
    ],
    [
      { type: "plain", value: "  " },
      { type: "keyword", value: "return" },
      { type: "plain", value: " (" },
    ],
    [{ type: "plain", value: "    <PayEmbed" }],
    [{ type: "plain", value: "      client={client}" }],
    [{ type: "plain", value: "      payOptions={{" }],
    [
      { type: "plain", value: "        mode: " },
      { type: "string", value: '"fund_wallet"' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "        prefillBuy: {" }],
    [{ type: "plain", value: "          chain: chain," }],
    [{ type: "plain", value: "          token: {" }],
    [
      { type: "plain", value: "            name: " },
      { type: "string", value: `"${tokenName}"` },
      { type: "plain", value: "," },
    ],
    [
      { type: "plain", value: "            symbol: " },
      { type: "string", value: `"${tokenSymbol}"` },
      { type: "plain", value: "," },
    ],
    [
      { type: "plain", value: "            address: " },
      { type: "string", value: `"${tokenAddress}"` },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "          }," }],
    [
      { type: "plain", value: "          amount: " },
      { type: "string", value: '"1"' },
      { type: "plain", value: "," },
    ],
    [{ type: "plain", value: "        }," }],
    [{ type: "plain", value: "      }}" }],
    [{ type: "plain", value: "    />" }],
    [{ type: "plain", value: "  );" }],
    [{ type: "plain", value: "}" }],
  ];
}

export default function SwapPage() {
  const searchParams = useSearchParams();
  const tokenSymbol = searchParams.get("token") || "ETH";
  const tokenName = searchParams.get("name") || tokenSymbol;
  const chainIdParam = searchParams.get("chainId") || "1";
  const tokenAddress = searchParams.get("address") || NATIVE_TOKEN_ADDRESS;
  const iconUrl = searchParams.get("iconUrl") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [chainExplorer, setChainExplorer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const chain = defineChain(Number(chainIdParam));

  useEffect(() => {
    const fetchChainData = async () => {
      try {
        const chainData = await getChainMetadata(chain);
        if (chainData.explorers && chainData.explorers.length > 0) {
          setChainExplorer(chainData.explorers[0].url);
        }
      } catch (error) {
        console.error("Error fetching chain data:", error);
        // Default to Etherscan for mainnet
        if (chain.id === 1) {
          setChainExplorer("https://etherscan.io");
        }
      }
    };

    fetchChainData();
  }, [chain]);

  useEffect(() => {
    const generateShareUrl = () => {
      const url = new URL(window.location.href);
      return url.toString();
    };
    setShareUrl(generateShareUrl());
  }, [tokenSymbol, chainIdParam, tokenAddress]);

  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true);
      try {
        const [priceResponse, transfersResponse] = await Promise.all([
          fetch(
            `https://insight.thirdweb.com/v1/tokens/price?chain=${chainIdParam}&address=${tokenAddress}&include_historical_prices=true&include_holders=true&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`,
          ),
          fetch(
            `https://insight.thirdweb.com/v1/tokens/transfers/${tokenAddress}?chain=${chainIdParam}&limit=50&metadata=false&sales=false&include_owners=false&resolve_metadata_links=true&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`,
          ),
        ]);

        const [priceData, transfersData] = await Promise.all([
          priceResponse.json(),
          transfersResponse.json(),
        ]);

        if (priceData.data && priceData.data[0]) {
          const tokenInfo = priceData.data[0];

          // Process historical prices for different timeframes
          const historicalPrices = tokenInfo.historical_prices || [];
          const now = Date.now();

          const prices1h = historicalPrices
            .filter(
              (hp: any) =>
                now - new Date(hp.date).getTime() <= 1 * 60 * 60 * 1000,
            )
            .map((hp: any) => ({
              timestamp: new Date(hp.date).getTime(),
              price: hp.price_usd,
            }));

          const prices24h = historicalPrices
            .filter(
              (hp: any) =>
                now - new Date(hp.date).getTime() <= 24 * 60 * 60 * 1000,
            )
            .map((hp: any) => ({
              timestamp: new Date(hp.date).getTime(),
              price: hp.price_usd,
            }));

          const prices7d = historicalPrices
            .filter(
              (hp: any) =>
                now - new Date(hp.date).getTime() <= 7 * 24 * 60 * 60 * 1000,
            )
            .map((hp: any) => ({
              timestamp: new Date(hp.date).getTime(),
              price: hp.price_usd,
            }));

          const prices30d = historicalPrices
            .filter(
              (hp: any) =>
                now - new Date(hp.date).getTime() <= 30 * 24 * 60 * 60 * 1000,
            )
            .map((hp: any) => ({
              timestamp: new Date(hp.date).getTime(),
              price: hp.price_usd,
            }));

          const decimals = tokenInfo.decimals || 18; // Default to 18 decimals if not provided

          // Extract holders count from API response
          const holdersCount = tokenInfo.holders;

          setTokenData({
            price: tokenInfo.price_usd,
            priceChange24h: tokenInfo.percent_change_24h,
            marketCap: tokenInfo.market_cap_usd,
            volume24h: tokenInfo.volume_24h_usd,
            volumeChange24h: tokenInfo.volume_change_24h,
            tokenName: tokenInfo.name || tokenInfo.symbol,
            tokenSymbol: tokenInfo.symbol,
            tokenLogo: tokenInfo.logo || iconUrl,
            holdersCount: holdersCount,
            historicalPrices: {
              "1h": prices1h,
              "24h": prices24h,
              "7d": prices7d,
              "30d": prices30d,
            },
            transfers:
              transfersData.data?.map((transfer: any) => {
                // Handle possible scientific notation or very large numbers
                let formattedAmount;
                try {
                  // First try using toEther which is best for standard amounts
                  formattedAmount = toEther(BigInt(transfer.amount));
                } catch (e) {
                  // Fallback for any parsing errors
                  formattedAmount = (
                    Number(transfer.amount) / Math.pow(10, decimals)
                  ).toString();
                }

                return {
                  from: transfer.from_address,
                  to: transfer.to_address,
                  amount: transfer.amount,
                  timestamp: new Date(transfer.block_timestamp).getTime(),
                  transactionHash: transfer.transaction_hash,
                  blockNumber: transfer.block_number,
                  transferType: transfer.transfer_type,
                  formattedAmount,
                };
              }) || [],
          });
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [chainIdParam, tokenAddress, iconUrl, tokenSymbol]);



  // Pagination logic
  const handleNextPage = () => {
    if (
      tokenData &&
      currentPage < Math.ceil(tokenData.transfers.length / itemsPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current items for pagination
  const getCurrentItems = () => {
    if (!tokenData) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return tokenData.transfers.slice(indexOfFirstItem, indexOfLastItem);
  };

  const payEmbedCodeLines = getPayEmbedCodeLines(
    chainIdParam,
    tokenData?.tokenName || tokenName,
    tokenSymbol,
    tokenAddress,
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Token Header */}
          <TokenHeader tokenData={tokenData} tokenSymbol={tokenSymbol} tokenName={tokenName} />

          {/* Main Content with Sidebar Space */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Content (Main Content) */}
            <div className="flex-1 order-2 lg:order-1">
              {/* Chart Section */}
              <ChartSection
                tokenData={tokenData}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                isLoading={isLoading}
              />
              {/* Stats Section */}
              <StatsSection tokenData={tokenData} />
              {/* About Section */}
              <AboutSection />
              {/* Buy Widget: below stats and about on mobile, in sidebar on desktop */}
              <div className="block lg:hidden mb-6">
                <PayEmbedWidget
                      client={client}
                  chain={chain}
                  tokenSymbol={tokenSymbol}
                  tokenName={tokenData?.tokenName || tokenName}
                  tokenAddress={tokenAddress}
                  chainIdParam={chainIdParam}
                  isMobile={true}
                  showCopySnippet={true}
                    />
              </div>
              {/* Transfers Data */}
              <TransfersTable
                tokenData={tokenData}
                getCurrentItems={getCurrentItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
                chainExplorer={chainExplorer}
                tokenSymbol={tokenSymbol}
                isLoading={isLoading}
              />
            </div>

            {/* Buy Widget sidebar: only on desktop */}
            <div className="hidden lg:block lg:w-96 order-2">
              <PayEmbedWidget
                        client={client}
                chain={chain}
                tokenSymbol={tokenSymbol}
                tokenName={tokenName}
                tokenAddress={tokenAddress}
                chainIdParam={chainIdParam}
                isMobile={false}
                showCopySnippet={true}
                      />
                    </div>
          </div>
        </div>
      </div>
    </main>
  );
}
