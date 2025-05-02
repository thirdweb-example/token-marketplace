import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Token {
  name: string
  symbol: string
  price: number
  change24h: number
  icon: string
  chainId: number
  address: string
  iconUrl: string
}

type Props = {
  popularTokens: Token[]
  setPayModalToken: (token: Token) => void
}

const PopularTokensGrid: React.FC<Props> = ({ popularTokens, setPayModalToken }) => {
  return (
    <div className="container mx-auto px-4 pt-10">
      <h2 className="text-2xl font-bold mb-4">Popular Tokens</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {popularTokens.slice(0, 16).map((token) => (
          <Link
            key={token.symbol}
            href={`/swap?token=${encodeURIComponent(token.symbol)}&name=${encodeURIComponent(token.name)}&chainId=${token.chainId}&address=${encodeURIComponent(token.address)}&iconUrl=${encodeURIComponent(token.iconUrl)}`}
            className="block group"
          >
            <div
              className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6 flex flex-col justify-between min-h-[220px] transition-shadow hover:shadow-lg cursor-pointer relative"
              style={{ borderRadius: 8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#18181b] flex items-center justify-center">
                  <Image
                    src={token.icon || "/placeholder.svg"}
                    alt={token.symbol}
                    width={56}
                    height={56}
                    unoptimized={true}
                    className="object-cover w-14 h-14 rounded-full"
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
                  <div className="text-xl font-bold">
                    $TODO
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-gray-400">24H</div>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 ${token.change24h >= 0 ? "bg-green-900/60 text-green-400" : "bg-red-900/60 text-red-400"}`}
                  >
                    TODO
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-[#171717] text-white hover:bg-[#262626] px-4 py-2 rounded mt-auto"
                onClick={e => {
                  e.preventDefault(); // Prevent Link navigation
                  setPayModalToken(token);
                }}
              >
                Buy
              </Button>
              <span className="absolute inset-0" aria-label={`Go to ${token.name} page`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PopularTokensGrid; 