import { Info } from "lucide-react";

export default function StatsSection({ tokenData }: { tokenData: any }) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-2">
      <div className="bg-black rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Market Cap</span>
          <span className="relative group inline-block">
            <Info className="h-3.5 w-3.5 text-gray-500 cursor-pointer group-hover:text-white group-focus:text-white transition-colors duration-150" tabIndex={0} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#18181b] text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-20 transition-opacity duration-200 border border-[#232329] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-[#18181b]">
              Market capitalization is the total value of all tokens in circulation, calculated by multiplying the current price by the circulating supply.
            </span>
          </span>
        </div>
        <div className="text-lg font-semibold">
          {typeof tokenData?.marketCap === "number"
            ? `$${tokenData.marketCap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "$0.00"}
        </div>
      </div>
      <div className="bg-black rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Number of Holders</span>
          <span className="relative group inline-block">
            <Info className="h-3.5 w-3.5 text-gray-500 cursor-pointer group-hover:text-white group-focus:text-white transition-colors duration-150" tabIndex={0} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#18181b] text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-20 transition-opacity duration-200 border border-[#232329] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-[#18181b]">
              The total number of unique wallet addresses that currently hold this token on the blockchain.
            </span>
          </span>
        </div>
        <div className="text-lg font-semibold">
          {typeof tokenData?.holdersCount === "number"
            ? tokenData.holdersCount.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : "0"}
        </div>
      </div>
    </div>
  );
}
