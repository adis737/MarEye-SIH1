const { ethers } = require("ethers");

// Ethereum Sepolia RPC URL (using public endpoint)
const SEPOLIA_RPC = "https://ethereum-sepolia.publicnode.com";

// Your private key (make sure to use a test account with Sepolia ETH)
const PRIVATE_KEY = "772a8c71208dfbb15b9ee1f73eee8f4b1a72956a58ad0696e7420b520555241c";

// CrowdfundingFactory contract ABI (simplified)
const FACTORY_ABI = [
  "constructor()",
  "function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays) external",
  "function getAllCampaigns() external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function getUserCampaigns(address _user) external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function removeCampaign(address _campaignAddress) external",
  "function togglePause() external",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)"
];

// Crowdfunding contract ABI (simplified)
const CROWDFUNDING_ABI = [
  "constructor(address _owner, string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays)",
  "function name() external view returns (string)",
  "function description() external view returns (string)",
  "function goal() external view returns (uint256)",
  "function deadline() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function state() external view returns (uint8)",
  "function getContractBalance() external view returns (uint256)",
  "function getTiers() external view returns (tuple(string name, uint256 amount, uint256 backers)[])",
  "function addTier(string memory _name, uint256 _amount) external",
  "function fund(uint256 _tierIndex) external payable",
  "function withdraw() external",
  "function refund() external"
];

async function deployContracts() {
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Deploying from address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Insufficient balance. Please get Sepolia ETH from a faucet.");
    }
    
    // Deploy CrowdfundingFactory
    console.log("Deploying CrowdfundingFactory...");
    const factoryFactory = new ethers.ContractFactory(FACTORY_ABI, "", wallet);
    const factory = await factoryFactory.deploy();
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("CrowdfundingFactory deployed to:", factoryAddress);
    
    console.log("\n✅ Deployment successful!");
    console.log("Update your contract address in src/app/constants/contracts.ts:");
    console.log(`export const CROWDFUNDING_FACTORY = "${factoryAddress}";`);
    
  } catch (error) {
    console.error("Deployment failed:", error.message);
  }
}

// Run deployment
deployContracts();
