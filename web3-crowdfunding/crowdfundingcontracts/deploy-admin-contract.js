const { ethers } = require("ethers");

// You can change this to any working Base Sepolia RPC
const BASE_SEPOLIA_RPC = "https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY"; // Replace with your API key
// Alternative: "https://sepolia.base.org"
// Alternative: "https://base-sepolia.publicnode.com"

// Your private key (make sure to use a test account with Base Sepolia ETH)
const PRIVATE_KEY = "772a8c71208dfbb15b9ee1f73eee8f4b1a72956a58ad0696e7420b520555241c";

// Updated CrowdfundingFactory contract ABI with adminRemoveCampaign
const FACTORY_ABI = [
  "constructor()",
  "function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays) external",
  "function getAllCampaigns() external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function getUserCampaigns(address _user) external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function removeCampaign(address _campaignAddress) external",
  "function adminRemoveCampaign(address _campaignAddress) external",
  "function togglePause() external",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function deployAdminContract() {
  try {
    console.log("🚀 Deploying Admin-Enabled CrowdfundingFactory...");
    console.log("📡 Using RPC:", BASE_SEPOLIA_RPC);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("👤 Deploying from address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("❌ Insufficient balance!");
      console.log("💡 Get Base Sepolia ETH from: https://bridge.base.org/deposit");
      console.log("💡 Or use a faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      return;
    }
    
    // Deploy Updated CrowdfundingFactory
    console.log("📦 Deploying contract...");
    const factoryFactory = new ethers.ContractFactory(FACTORY_ABI, "", wallet);
    const factory = await factoryFactory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ Admin-Enabled CrowdfundingFactory deployed to:", factoryAddress);
    
    console.log("\n🎉 Deployment successful!");
    console.log("📝 Update your contract address in src/app/constants/contracts.ts:");
    console.log(`export const CROWDFUNDING_FACTORY = "${factoryAddress}";`);
    console.log("\n🔑 IMPORTANT: You are now the contract owner and can use admin functions!");
    console.log("🛡️  Admin can now remove ANY campaign using adminRemoveCampaign()");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Check your RPC URL is correct");
    console.log("2. Ensure you have Base Sepolia ETH");
    console.log("3. Try a different RPC endpoint");
  }
}

// Run deployment
deployAdminContract();

