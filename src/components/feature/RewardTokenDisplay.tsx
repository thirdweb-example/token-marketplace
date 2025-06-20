import React from 'react';
import { Gift, Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useActiveAccount, useWalletBalance  } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import { client } from '@/app/client';

interface RewardTokenDisplayProps {
  className?: string;
}

export default function RewardTokenDisplay({ className = '' }: RewardTokenDisplayProps) {
  const address = useActiveAccount()?.address
  const { data, isLoading } = useWalletBalance({
    chain: baseSepolia,
    address,
    client: client,
    tokenAddress: "0xC1e2D076830C09d5a3087acA1B58F6590F536804",
  });
  console.log("balance", data?.displayValue, data?.symbol);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`bg-black border border-zinc-800 rounded-xl shadow-lg shadow-purple-900/10 px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-purple-500/30 transition-all duration-300 ${className}`}>
            <div className="relative flex-shrink-0">
              <div className="bg-zinc-800 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-purple-400" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-purple-300 tracking-wide uppercase">REWARDS</span>
              <div className="flex items-center gap-1">
                {isLoading ? (
                  <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded"></div>
                ) : (
                  <span className="font-bold text-white tracking-tight">
                    {data?.displayValue || '0'} <span className="text-purple-300">{data?.symbol} $GIFT</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border border-purple-900/50 text-white max-w-xs p-4 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h4 className="font-bold text-purple-300">Reward System</h4>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong className="text-purple-300">Earn 1 GIFT token</strong> for each transaction you complete on our platform!
              </p>
              
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800 mt-2">
                <div className="flex gap-2 items-start">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400">
                    This is a demo site and the rewards have no real value. rewards are only for demo purposes and are on base Sepolia testnet.
                  </p>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <h5 className="text-sm font-medium text-purple-300 mb-1">How to earn:</h5>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                  <li>Complete token swaps</li>
                  <li>Make bridge transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 