import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chain, defineChain } from "thirdweb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert chain ID string to proper chain object
export function getChainFromId(chainId: string): Chain {
  // Map common chain IDs to their configurations
  // In a real app, you would use a more complete mapping or a library
  const chain = defineChain(parseInt(chainId));
  return chain;
}
