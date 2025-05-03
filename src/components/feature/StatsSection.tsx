import { Info } from "lucide-react"
import { useState, useEffect } from "react"

export default function StatsSection({ tokenData }: { tokenData: any }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const tooltipClass = `
    absolute ${isMobile ? 'bottom-full left-0' : 'bottom-full left-1/2 -translate-x-1/2'} 
    mb-2 w-auto max-w-[280px] min-w-[200px] 
    bg-[#18181b] text-xs text-white rounded shadow-lg px-3 py-2 
    opacity-0 group-hover:opacity-100 group-focus:opacity-100 
    pointer-events-none z-30 transition-opacity duration-200 
    border border-[#232329] 
    ${isMobile 
      ? 'after:content-[\'\'] after:absolute after:top-full after:left-4 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-[#18181b]' 
      : 'after:content-[\'\'] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-[#18181b]'
    }
  `

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-2">
      <div className="bg-black rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Market Cap</span>
          <span className="relative group inline-block">
            <Info
              className="h-4 w-4 text-gray-500 cursor-pointer group-hover:text-white group-focus:text-white transition-colors duration-150"
              tabIndex={0}
            />
            <span className={tooltipClass}>
              Market capitalization is the total value of all tokens in circulation, calculated by multiplying the
              current price by the circulating supply.
            </span>
          </span>
        </div>
        <div className="text-base sm:text-lg font-semibold">
          {typeof tokenData?.marketCap === "number"
            ? `$${tokenData.marketCap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "$0.00"}
        </div>
      </div>
      <div className="bg-black rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Number of Holders</span>
          <span className="relative group inline-block">
            <Info
              className="h-4 w-4 text-gray-500 cursor-pointer group-hover:text-white group-focus:text-white transition-colors duration-150"
              tabIndex={0}
            />
            <span className={tooltipClass}>
              The total number of unique wallet addresses that currently hold this token on the blockchain.
            </span>
          </span>
        </div>
        <div className="text-base sm:text-lg font-semibold">
          {typeof tokenData?.holdersCount === "number"
            ? tokenData.holdersCount.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : "0"}
        </div>
      </div>
    </div>
  )
}
