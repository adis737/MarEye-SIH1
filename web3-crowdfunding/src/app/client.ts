import { createThirdwebClient } from "thirdweb";

// For development, we'll use a public client ID
// In production, make sure to set NEXT_PUBLIC_TEMPLATE_CLIENT_ID in your environment
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "demo_client_id";

// Debug: Log the client ID being used
console.log("Thirdweb Client ID:", clientId);

// Try to create client with explicit RPC configuration
let client;
try {
  client = createThirdwebClient({
    clientId: clientId,
    rpc: {
      "sepolia": "https://ethereum-sepolia.publicnode.com",
      "ethereum-sepolia": "https://ethereum-sepolia.publicnode.com"
    }
  });
} catch (error) {
  console.error("Error creating Thirdweb client:", error);
  // Fallback to basic client with RPC
  try {
    client = createThirdwebClient({
      clientId: "demo_client_id",
      rpc: {
        "sepolia": "https://ethereum-sepolia.publicnode.com",
        "ethereum-sepolia": "https://ethereum-sepolia.publicnode.com"
      }
    });
  } catch (fallbackError) {
    console.error("Fallback client creation failed:", fallbackError);
    // Last resort - minimal client
    client = createThirdwebClient({
      clientId: "demo_client_id",
    });
  }
}

export { client };
