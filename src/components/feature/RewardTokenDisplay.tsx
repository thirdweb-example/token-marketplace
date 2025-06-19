import React from 'react';
import { Gift } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useActiveAccount, useWalletBalance  } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import { client } from '@/app/client';

interface RewardTokenDisplayProps {
  className?: string;
}

export default function RewardTokenDisplay({ className = '' }: RewardTokenDisplayProps) {
  const address = useActiveAccount()?.address
  const { data } = useWalletBalance({
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
          <div className={`bg-black border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-900 transition-colors ${className}`}>
            <Gift className="w-4 h-4 text-white" />
            <div className="flex flex-col">
              <span className="text-xs text-white/70">Rewards</span>
              <span className="font-bold text-white">{data?.displayValue} {data?.symbol}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black border border-gray-800 text-white max-w-xs">
          <p className="text-sm">
            <strong>Demo Rewards:</strong> These are demo tokens that represent rewards you would earn for each transaction on the platform. 
            <br /><br />          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 