# 🔧 Troubleshooting 401 RPC Error

## Current Issue
Even after adding the Thirdweb client ID, you're still getting:
```
Error creating campaign: RPC request failed with status 401
```

## 🔍 Debugging Steps

### 1. Check Environment Variable
Run this in the web3-crowdfunding directory:
```bash
node test-env.js
```

This will show if your client ID is being loaded correctly.

### 2. Verify .env.local File
Make sure your `.env.local` file in `web3-crowdfunding/` contains:
```
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_actual_client_id_here
```

### 3. Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for "Thirdweb Client ID:" log message
4. Verify it shows your actual client ID, not "demo_client_id"

### 4. Restart Server
After making changes to .env.local:
```bash
cd web3-crowdfunding
npm run dev
```

## 🛠️ Alternative Solutions

### Solution 1: Use Different RPC Endpoint
If the issue persists, try updating the client configuration to use a different RPC:

```typescript
// In src/app/client.ts
export const client = createThirdwebClient({
  clientId: clientId,
  rpc: {
    "sepolia": "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
  }
});
```

### Solution 2: Use Alchemy RPC
```typescript
export const client = createThirdwebClient({
  clientId: clientId,
  rpc: {
    "sepolia": "https://eth-sepolia.g.alchemy.com/v2/demo"
  }
});
```

### Solution 3: Check Client ID Format
Make sure your client ID:
- Starts with a letter
- Contains only alphanumeric characters
- Is exactly as copied from Thirdweb portal
- Has no extra spaces or quotes

## 🧪 Test Steps

1. **Check environment variable**:
   ```bash
   node test-env.js
   ```

2. **Restart server**:
   ```bash
   npm run dev
   ```

3. **Check browser console** for client ID log

4. **Try creating campaign** again

## 📞 If Still Not Working

If you're still getting 401 errors:

1. **Double-check client ID** in Thirdweb portal
2. **Try a different RPC endpoint**
3. **Clear browser cache** completely
4. **Check if client ID has proper permissions**

The issue is likely that the environment variable isn't being loaded correctly or the client ID format is wrong.


