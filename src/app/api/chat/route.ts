import { NextResponse } from "next/server"
import { Nebula } from "thirdweb/ai"
import { defineChain } from "thirdweb"
import { createThirdwebClient } from "thirdweb"

// Increase route handler timeout to 2 minutes
export const runtime = 'edge' // 'nodejs' is limited to 10s
export const maxDuration = 120 // This is in seconds

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is not set in environment variables")
}

// Create a client with the secret key
const client = createThirdwebClient({
  secretKey: process.env.SECRET_KEY,
})

export async function POST(request: Request) {
  try {
    const { message, chainId, sessionId, chainName, tokenAddress, walletAddress } = await request.json()
    console.log(message, chainId, sessionId, chainName, tokenAddress, walletAddress)

    if (!message || !chainId) {
      return NextResponse.json(
        { error: "Message and chainId are required" },
        { status: 400 }
      )
    }

    const chain = defineChain(Number(chainId))

    // Include context in the message itself
    const contextualizedMessage = `Context: You are helping with questions about the ${tokenAddress} token on ${chainName}. 
User question: ${message}`
    console.log(contextualizedMessage)
    const response = await Nebula.chat({
      client,
      message: contextualizedMessage,
      sessionId,
      contextFilter: {
        chains: [chain],
        contractAddresses: [tokenAddress],
        walletAddresses: [walletAddress],
      },
    })

    // Extract sessionId from response for future use
    const newSessionId = response.sessionId
    console.log(response.message)
    return NextResponse.json({ 
      message: response.message,
      sessionId: newSessionId
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
} 