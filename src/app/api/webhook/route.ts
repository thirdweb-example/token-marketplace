import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Engine, getContract, toWei } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc20";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from 'thirdweb/chains';

// Create thirdweb client
const client = createThirdwebClient({
  secretKey: process.env.SECRET_KEY || "",
});

// Initialize server wallet
const serverWallet = Engine.serverWallet({
  client,
  address: "0xb9192A73074Cf6366Ca3A02eb28c06aaA69cA72A",
  vaultAccessToken: process.env.VAULT_ACCESS_TOKEN || "",
});

// ERC20 contract address to mint tokens from
const REWARD_TOKEN_CONTRACT = "0xC1e2D076830C09d5a3087acA1B58F6590F536804"

export async function POST(req: NextRequest) {
  try {
    // Get the raw body as text
    const payload = await req.text();
    
    // Get headers
    const timestamp = req.headers.get('x-timestamp');
    const receivedSignature = req.headers.get('x-payload-signature');
    
    if (!timestamp || !receivedSignature) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Decrypt the secret if needed
    const decryptedSecret = webhookSecret;

    // Verify signature
    const signature = crypto
      .createHmac('sha256', decryptedSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    // Compare signatures (use constant-time comparison to prevent timing attacks)
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // If signature is valid, parse the payload
    const webhookData = JSON.parse(payload);
    
    // Process the webhook data
    console.log('Webhook received:', webhookData);
    
    // Check if we have the expected data structure
    if (webhookData.data && webhookData.data.status === "COMPLETED") {
      await handleCompletedTransaction(webhookData.data);
    } else {
      console.log(`Unhandled webhook data or status not completed:`, webhookData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCompletedTransaction(data: any) {
  try {
    // Extract sender address from the payload
    const { sender, transactionId, paymentId, action, status } = data;
    
    if (!sender) {
      console.error('No sender address found in webhook payload');
      return;
    }
    
    console.log(`Processing completed ${action} transaction for sender: ${sender}`);
    
    // Check if the reward token contract is configured
    if (!REWARD_TOKEN_CONTRACT) {
      console.error('REWARD_TOKEN_CONTRACT environment variable is not set');
      return;
    }
    
    // Define the reward amount based on transaction type or other criteria
    // This is just an example - adjust according to your tokenomics
    
    try {
      // Get contract reference
      const contract = getContract({
        chain: baseSepolia,
        address: REWARD_TOKEN_CONTRACT,
        client,
      })
      
      // Prepare the transaction to claim tokens to the sender's address
      const transaction = claimTo({
        contract,
        to: sender,
        quantityInWei: toWei('1'),
        from: "0xb9192A73074Cf6366Ca3A02eb28c06aaA69cA72A",
      });
      
      // Enqueue the transaction to be processed by the server wallet
      const { transactionId: rewardTxId } = await serverWallet.enqueueTransaction({
        transaction,
      });
      
      console.log(`Reward tokens minted successfully to ${sender}. Transaction ID: ${rewardTxId}`);
      
      // Here you could store the transaction in your database for tracking
      
    } catch (mintError) {
      console.error('Error minting reward tokens:', mintError);
    }
  } catch (error) {
    console.error('Error handling completed transaction:', error);
  }
} 