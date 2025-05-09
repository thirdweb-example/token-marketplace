"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Minus, Plus, Info, ExternalLink, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import type { ThirdwebContract } from "thirdweb"
import { ClaimButton, ConnectButton, MediaRenderer, NFTProvider, NFTMedia, useActiveAccount } from "thirdweb/react"
import { client } from "@/app/client"
import type React from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastProvider } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image";
import Link from "next/link";

type Props = {
  contract: ThirdwebContract
  displayName: string
  description: string
  contractImage: string
  pricePerToken: number | null
  currencySymbol: string | null
  isERC1155: boolean
  isERC721: boolean
  tokenId: bigint
  explorerUrl: string
}

type Transaction = {
  from_address: string
  to_address: string
  amount: string
  block_timestamp: string
  transaction_hash: string
}

export function NftMint(props: Props) {
  const [isMinting, setIsMinting] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [useCustomAddress, setUseCustomAddress] = useState(false)
  const [customAddress, setCustomAddress] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const account = useActiveAccount()

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!Number.isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value)))
    }
  }

  // Function to fetch recent transfers
  const fetchTransfers = async () => {
    try {
      setIsLoading(true)
      const contractAddress = props.contract.address
      const chainId = props.contract.chain.id

      let endpoint = ""
      
      if (props.isERC721 || props.isERC1155) {
        endpoint = `https://insight.thirdweb.com/v1/nfts/transfers/${contractAddress}?chain=${chainId}&limit=5&metadata=false&sales=false&include_owners=false&resolve_metadata_links=true&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`
      } else {
        endpoint = `https://insight.thirdweb.com/v1/tokens/transfers/${contractAddress}?limit=50&metadata=false&sales=false&include_owners=false&resolve_metadata_links=true&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`
      }

      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      setTransactions(data.data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      // For demo purposes, create some mock data if API fails
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch transactions on load
  useEffect(() => {
    fetchTransfers()
  }, [props.contract.address])

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string) => {
    try {
      // Handle the timestamp format properly by adding Z to treat as UTC
      const formattedTimestamp = timestamp.replace(' ', 'T') + 'Z'
      
      // Parse the date and current time in UTC
      const date = new Date(formattedTimestamp)
      const now = new Date()
      
      // Get time difference in seconds
      const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      // Future dates will show as "upcoming"
      if (secondsAgo < 0) return "upcoming"
      
      // Format based on how long ago
      if (secondsAgo < 60) return `${secondsAgo}s ago`
      if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`
      if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`
      return `${Math.floor(secondsAgo / 86400)}d ago`
    } catch (e) {
      console.error("Error parsing timestamp:", e, timestamp)
      return "recently"
    }
  }

  // Format address to truncated form
  const formatAddress = (address: string) => {
    if (!address) return ""
    if (address === "0x0000000000000000000000000000000000000000") return "Mint"
    return `${address.substring(0, 8)}...`
  }

  // Get block explorer URL
  const getExplorerUrl = () => {
    return props.explorerUrl;
  }

  // Format address URL for explorer


  if (props.pricePerToken === null || props.pricePerToken === undefined) {
    console.error("Invalid pricePerToken")
    return null
  }

  return (
    <ToastProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        {/* Background gradient effect */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/10 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
        
        {/* Navigation */}
        <div className="w-full max-w-6xl px-6 py-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-black/90 backdrop-blur-md">
          <div className="flex items-center space-x-10">
			<Link href="/" className="flex items-center gap-2">
              <Image
                src="/thirdweb.svg"
                alt="thirdweb"
                width={44}
                height={44}
              />
              <span className="text-xl font-semibold">Mint</span>
            </Link>

          </div>
          <div>
            <ConnectButton client={client} />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl px-6 py-10 flex flex-col md:flex-row gap-10 relative z-10">
          {/* Project Info Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-white">TEST </span>
                <span className="text-white">DROP</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm">TEST DROP MINT TEMPLATE</p>
            </div>
            
            {/* NFT Image */}
            <div className="aspect-square overflow-hidden rounded-2xl relative bg-black/50 border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-tl from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              {props.isERC1155 ? (
                <NFTProvider contract={props.contract} tokenId={props.tokenId}>
                  <NFTMedia
                    loadingComponent={<Skeleton className="w-full h-full object-cover bg-black/50" />}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </NFTProvider>
              ) : (
                <MediaRenderer
                  client={client}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt=""
                  src={props.contractImage || "/placeholder.svg?height=400&width=400"}
                />
              )}
              
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/20 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
            </div>

            <div className="mt-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                {props.description}
              </p>
            </div>
          </div>

          {/* Mint Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <Card className="border-0 bg-black/50 shadow-2xl backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 relative">
              {/* Subtle gradient border effect */}
              <div className="absolute inset-px z-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/20 opacity-50"></div>
              
              <CardHeader className="pb-3 pt-6 px-6 relative z-10">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-black/80 text-white border-white/10 px-3 py-1 font-medium text-xs rounded-full">
                    LIVE DROP
                  </Badge>
                  <div className="flex items-center text-sm text-white font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-green mr-2 animate-pulse"></span>
                    MINTING NOW
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 relative z-10">
                <div className="flex justify-between items-center mb-6 mt-2">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {props.pricePerToken} {props.currencySymbol}
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-black/80 p-1 rounded-lg border border-white/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="h-9 w-9 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 h-9 text-center border-0 bg-transparent text-white focus-visible:ring-0 text-base px-0"
                      min="1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={increaseQuantity}
                      className="h-9 w-9 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-5 bg-white/10" />

                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative flex items-center">
                    <Switch 
                      id="custom-address" 
                      checked={useCustomAddress} 
                      onCheckedChange={setUseCustomAddress}
                      className="data-[state=checked]:bg-white" 
                    />
                    <Label
                      htmlFor="custom-address"
                      className={`text-sm pl-2 ${useCustomAddress ? "text-white" : "text-gray-400"} cursor-pointer`}
                    >
                      Mint to a custom address
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-white/10">
                          <p className="text-xs">Send this NFT directly to another wallet</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {useCustomAddress && (
                  <div className="mb-6 animate-in fade-in-0 slide-in-from-top-3 duration-300">
                    <Input
                      id="address-input"
                      type="text"
                      placeholder="Enter recipient address"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full bg-black/50 border-white/10 text-white rounded-lg focus-visible:ring-white focus-visible:border-white"
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="px-6 pb-6 relative z-10">
                {account ? (
                  <ClaimButton
                    theme={"dark"}
                    contractAddress={props.contract.address}
                    chain={props.contract.chain}
                    client={props.contract.client}
                    claimParams={
                      props.isERC1155
                        ? {
                            type: "ERC1155",
                            tokenId: props.tokenId,
                            quantity: BigInt(quantity),
                            to: customAddress,
                            from: account.address,
                          }
                        : props.isERC721
                        ? {
                            type: "ERC721",
                            quantity: BigInt(quantity),
                            to: customAddress,
                            from: account.address,
                          }
                        : {
                            type: "ERC20",
                            quantity: String(quantity),
                            to: customAddress,
                            from: account.address,
                          }
                    }
                    style={{
                      background: "linear-gradient(to right, #ffffff, #f0f0f0)",
                      color: "black",
                      width: "100%",
                      borderRadius: "12px",
                      padding: "16px",
                      fontWeight: "600",
                      fontSize: "16px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                    onTransactionSent={() => toast.info("Minting NFT")}
                    onTransactionConfirmed={() => toast.success("Minted successfully")}
                    onError={(err) => toast.error(err.message)}
                  >
                    MINT {quantity} NFT{quantity > 1 ? "S" : ""}
                  </ClaimButton>
                ) : (
                  <ConnectButton
                    client={client}
                    connectButton={{
                      style: {
                        background: "linear-gradient(to right, #ffffff, #f0f0f0)",
                        color: "black",
                        width: "100%",
                        borderRadius: "12px",
                        padding: "16px",
                        fontWeight: "600",
                        fontSize: "16px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  />
                )}
              </CardFooter>
            </Card>

            {/* Activity Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  LIVE MINTS
                </h3>
                <a 
                  href={getExplorerUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-gray-400 flex items-center hover:text-white transition-colors"
                >
                  View All <ChevronRight className="ml-1 h-3 w-3" />
                </a>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/5 bg-black/50 backdrop-blur-sm">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-white/5">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Minter
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-white/10 mr-3 flex-shrink-0"></div>
                              <div className="h-4 w-24 bg-white/10 rounded"></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="h-4 w-4 bg-white/10 rounded"></div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="h-4 w-12 bg-white/10 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : transactions.length > 0 ? (
                      transactions.slice(0, 3).map((tx, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${
                                i === 0 ? "from-blue-500 to-purple-500" :
                                i === 1 ? "from-teal-400 to-emerald-500" :
                                "from-gray-400 to-gray-600"
                              } mr-3 flex-shrink-0`}></div>
                              {formatAddress(tx.to_address)}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{tx.amount}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatTimeAgo(tx.block_timestamp)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-6 text-center text-sm text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Powered by thirdweb */}
              <div className="mt-8 flex justify-center items-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Powered by</p>
                  <div className="flex items-center justify-center mt-1">
                    <img src="/thirdweb.svg" alt="thirdweb" className="w-10 h-10" />
                    <span className="text-white font-medium text-sm">thirdweb</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
