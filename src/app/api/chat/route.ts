import { NextResponse } from "next/server"
import { defineChain } from "thirdweb"

// Increase route handler timeout to 2 minutes
export const runtime = 'edge' // 'nodejs' is limited to 10s
export const maxDuration = 120 // This is in seconds

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is not set in environment variables")
}

export async function POST(request: Request) {
  try {
    const { message, chainId, sessionId, chainName, tokenAddress, walletAddress } = await request.json()

     if (!message || !chainId) {
       return NextResponse.json(
         { error: "Message and chainId are required" },
         { status: 400 }
       )
     }

     // Ensure SECRET_KEY is available
     if (!process.env.SECRET_KEY) {
       return NextResponse.json(
         { error: "SECRET_KEY is not configured" },
         { status: 500 }
       )
     }

     // Include context in the message itself
     const contextualizedMessage = `Context: You are helping with questions about the ${tokenAddress} token on ${chainName}. 
 User question: ${message}`

     let data
     try {
       const response = await fetch("https://api.thirdweb.com/ai/chat", {
         method: "POST",
         headers: {
           "x-secret-key": process.env.SECRET_KEY,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           messages: [
             {
               role: "user",
               content: contextualizedMessage,
             },
           ],
           context: {
             chain_ids: [Number(chainId)],
             from: walletAddress,
             contract_addresses: tokenAddress ? [tokenAddress] : undefined,
           },
           stream: false,
         }),
       })

       if (!response.ok) {
         throw new Error(`API request failed: ${response.status}`)
       }

       data = await response.json()
     } catch (fetchError) {
       console.error("Error fetching from AI API:", fetchError)
       return NextResponse.json(
         { error: "Failed to communicate with AI service" },
         { status: 503 }
       )
     }
     
     return NextResponse.json({ 
       message: data.message,
       sessionId: data.session_id || sessionId,
       requestId: data.request_id,
     })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
} 