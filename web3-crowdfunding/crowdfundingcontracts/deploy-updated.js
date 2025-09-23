const { ethers } = require("ethers");

// Base Sepolia RPC URL (using public endpoint)
const BASE_SEPOLIA_RPC = "https://base-sepolia.g.alchemy.com/v2/demo";

// Your private key (make sure to use a test account with Sepolia ETH)
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

async function deployUpdatedContract() {
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Deploying from address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Insufficient balance. Please get Base Sepolia ETH from a faucet.");
    }
    
    // Deploy Updated CrowdfundingFactory
    console.log("Deploying Updated CrowdfundingFactory...");
    const factoryFactory = new ethers.ContractFactory(FACTORY_ABI, "", wallet);
    const factory = await factoryFactory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("Updated CrowdfundingFactory deployed to:", factoryAddress);
    
    console.log("\n✅ Deployment successful!");
    console.log("Update your contract address in src/app/constants/contracts.ts:");
    console.log(`export const CROWDFUNDING_FACTORY = "${factoryAddress}";`);
    console.log("\n⚠️  IMPORTANT: You are now the owner of this contract and can use admin functions!");
    
  } catch (error) {
    console.error("Deployment failed:", error.message);
  }
}

// Run deployment
deployUpdatedContract();
