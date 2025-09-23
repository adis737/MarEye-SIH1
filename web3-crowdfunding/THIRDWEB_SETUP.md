# 🔧 Thirdweb Setup Guide

## Issue: 401 RPC Error

The error "RPC request failed with status 401" occurs because the Thirdweb client needs a proper client ID to access RPC endpoints.

## 🚀 Quick Fix

### Step 1: Get a Free Thirdweb Client ID

1. Go to [Thirdweb Portal](https://portal.thirdweb.com/typescript/v5/client)
2. Click "Create Project"
3. Enter project name: "Oceanova Crowdfunding"
4. Select "Ethereum" as the chain
5. Copy the Client ID

### Step 2: Set Environment Variable

Create a `.env.local` file in the `web3-crowdfunding` directory:

```bash
# In web3-crowdfunding/.env.local
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_actual_client_id_here
```

Replace `your_actual_client_id_here` with the client ID you copied.

### Step 3: Restart the Server

```bash
cd web3-crowdfunding
npm run dev
```

## 🔍 Alternative: Use Public RPC

If you don't want to create a Thirdweb account, you can modify the client configuration to use public RPC endpoints directly.

### Update client.ts:

```typescript
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: "demo_client_id",
  rpc: {
    "sepolia": "https://rpc.sepolia.org"
  }
});
```

## 🧪 Test the Fix

1. Start the web3-crowdfunding server
2. Connect your wallet
3. Try creating a campaign
4. The 401 error should be resolved

## 📝 Notes

- The demo client ID works for basic functionality
- For production, always use a proper client ID
- Public RPC endpoints may have rate limits
- Thirdweb client ID provides better reliability and features


