import { client } from "@/app/client";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Add type declaration for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CONTRACT_ADDRESS?: string;
    }
  }
}

// Default token ID to use when none is specified
export const defaultTokenId = 0n

// Default chain to use when none is specified
export const defaultChain = defineChain(1);

// Default contract address to use when none is specified
export const defaultClient = createThirdwebClient({
  secretKey: process.env.SECRET_KEY ?? "",
});
