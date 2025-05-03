import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, RefreshCwIcon } from "lucide-react"
import DefaultTokenIcon from "@/components/ui/DefaultTokenIcon"
import Image from "next/image"

interface Token {
  name: string
  symbol: string
  address: string
  chainId: number
  iconUri?: string
  price_usd?: number
  percent_change_24h?: number
  market_cap_usd?: number
}

type Props = {
  destinationTokens: Token[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleSearch: (e: React.FormEvent) => void
  refreshRoutes: () => void
  setPayModalToken: (token: any) => void
  NATIVE_TOKEN_ADDRESS: string
}

const AvailableTokensTable: React.FC<Props> = ({
  destinationTokens,
  loading,
  error,
  currentPage,
  totalPages,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  handleSearch,
  refreshRoutes,
  setPayModalToken,
  NATIVE_TOKEN_ADDRESS,
}) => {
  // Sort by market cap and then by price
  const sortedTokens = [...destinationTokens].sort((a, b) => {
    // Sort by market cap if available
    if (a.market_cap_usd && b.market_cap_usd) {
      return b.market_cap_usd - a.market_cap_usd;
    }
    // Then by price - all tokens should have price data now
    return (b.price_usd ?? 0) - (a.price_usd ?? 0);
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Available Tokens</h2>
          <p className="text-gray-500 text-sm">Browse and search through available tokens to bridge</p>
        </div>
        <div className="flex w-full md:w-auto gap-4 mt-4 md:mt-0">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, symbol, or address"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[#171717] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#333] focus:border-[#333] transition-all border border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </form>
          <Button
            type="button"
            onClick={refreshRoutes}
            aria-label="Refresh tokens"
            className="ml-2 h-10 w-10 flex items-center justify-center rounded-md bg-[#171717] border border-[#222] text-gray-300 hover:text-white hover:bg-[#222] hover:border-white transition-all duration-200"
          >
            <RefreshCwIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="border-[#222] text-gray-300 hover:text-white hover:bg-[#111] hover:border-white disabled:opacity-50 transition-all duration-200"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 py-2 rounded-md bg-[#111] border border-[#222]">
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="border-[#222] text-gray-300 hover:text-white hover:bg-[#111] hover:border-white disabled:opacity-50 transition-all duration-200"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error ? (
        <div className="text-center py-8 bg-[#111] rounded-lg border border-[#222] p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#171717] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
              <path d="M12 16V16.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-white text-lg mb-2">{error}</p>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search term or refresh to see all tokens.' : 'Please try refreshing to fetch tokens again.'}
          </p>
          <Button 
            onClick={refreshRoutes} 
            className="mt-4 bg-[#222] hover:bg-[#333] text-white"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      ) : loading ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#111] rounded-lg">
            <thead>
              <tr className="border-b border-[#222] text-gray-400 text-left">
                <th className="px-6 py-3 font-medium">Asset</th>
                <th className="px-6 py-3 font-medium">Chain ID</th>
                <th className="px-6 py-3 font-medium">
                  Price <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">
                24h                <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">
                  Market Cap <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array(10)
                .fill(0)
                .map((_, idx) => (
                  <tr key={idx} className="border-b border-[#222]">
                    {/* Asset */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <Skeleton className="w-8 h-8 rounded-full bg-[#222]" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20 bg-[#222]" />
                          <Skeleton className="h-3 w-32 bg-[#222]" />
                        </div>
                      </div>
                    </td>
                    {/* Chain ID */}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12 bg-[#222] rounded-full" />
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16 bg-[#222]" />
                    </td>
                    {/* 24h change */}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12 bg-[#222] rounded-full" />
                    </td>
                    {/* Market Cap */}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20 bg-[#222]" />
                    </td>
                    {/* Action */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-12 rounded bg-[#222]" />
                        <Skeleton className="h-8 w-12 rounded bg-[#222]" />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : sortedTokens.length === 0 ? (
        <div className="text-center py-8 bg-[#111] rounded-lg border border-[#222] p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#171717] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
              <path d="M12 16V16.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-white text-lg mb-2">No tokens found matching your criteria</p>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Try adjusting your search term or refresh to see all available tokens.
          </p>
          <Button 
            onClick={refreshRoutes} 
            className="mt-4 bg-[#222] hover:bg-[#333] text-white"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" /> Reset filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#111] rounded-lg">
            <thead>
              <tr className="border-b border-[#1F1F1F] text-gray-400 text-left">
                <th className="px-6 py-3 font-medium">Asset</th>
                <th className="px-6 py-3 font-medium">Chain ID</th>
                <th className="px-6 py-3 font-medium">
                  Price <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">
                  24h <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">
                  Market Cap <span className="text-xs">⇅</span>
                </th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTokens.map((token, idx) => {
                const tokenUrl = `/swap?token=${encodeURIComponent(token.symbol)}&name=${encodeURIComponent(token.name)}&chainId=${token.chainId}&address=${encodeURIComponent(token.address)}&iconUrl=${encodeURIComponent(token.iconUri || "")}`;
                return (
                  <tr
                    key={`${token.symbol}_${token.chainId}_${token.address}_${idx}`}
                    className="border-t border-[#1F1F1F] hover:bg-[#222] transition-all duration-200 cursor-pointer group"
                    onClick={() => window.location.href = tokenUrl}
                  >
                    {/* Asset */}
                    <td className="px-6 py-4 flex items-center gap-3 min-w-[200px]">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#1F1F1F] flex-shrink-0">
                        {!token.iconUri ? (
                          <DefaultTokenIcon symbol={token.symbol} />
                        ) : (
                          <Image
                            src={token.iconUri || "/placeholder.svg"}
                            alt={token.symbol}
                            width={32}
                            height={32}
                            unoptimized={true}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white leading-tight">
                          {token.name} ({token.symbol})
                        </div>
                        <div className="text-xs text-gray-400 leading-tight truncate max-w-[250px]">
                          {token.address === NATIVE_TOKEN_ADDRESS ? "Native Token" : token.address}
                        </div>
                      </div>
                    </td>
                    {/* Chain ID */}
                    <td className="px-6 py-4 text-white font-mono">{token.chainId}</td>
                    {/* Price */}
                    <td className="px-6 py-4 text-white font-mono">
                      {typeof token.price_usd === 'number' ? `$${token.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '--'}
                    </td>
                    {/* 24h Change */}
                    <td className="px-6 py-4">
                      {typeof token.percent_change_24h === 'number' ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${token.percent_change_24h >= 0 ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'}`}>
                          {token.percent_change_24h >= 0 ? '+' : ''}{token.percent_change_24h.toFixed(2)}%
                        </span>
                      ) : '--'}
                    </td>
                    {/* Market Cap */}
                    <td className="px-6 py-4 text-white font-mono">
                      {typeof token.market_cap_usd === 'number' && token.market_cap_usd > 0 ? `$${token.market_cap_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '--'}
                    </td>
                    {/* Action */}
                    <td className="px-6 py-4">
                      <div className="w-full min-w-[80px]">
                        <Button
                          className="w-full bg-[#222] text-white hover:bg-[#333] px-4 py-1 rounded"
                          onClick={e => {
                            e.stopPropagation();
                            setPayModalToken({
                              name: token.name,
                              symbol: token.symbol,
                              price: token.price_usd || 0,
                              change24h: token.percent_change_24h || 0,
                              icon: token.iconUri || "",
                              chainId: token.chainId,
                              address: token.address,
                              iconUrl: token.iconUri || "",
                            });
                          }}
                        >
                          Buy
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AvailableTokensTable; 