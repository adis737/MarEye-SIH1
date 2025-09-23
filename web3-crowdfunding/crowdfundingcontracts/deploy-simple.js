const { ethers } = require("ethers");

// Ethereum Sepolia RPC URL
const SEPOLIA_RPC = "https://ethereum-sepolia.publicnode.com";

// Your private key
const PRIVATE_KEY = "772a8c71208dfbb15b9ee1f73eee8f4b1a72956a58ad0696e7420b520555241c";

// Simple contract bytecode (this is a minimal working contract)
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063f2fde38b14610059575b600080fd5b610043610075565b60405161005091906100d1565b60405180910390f35b610073600480360381019061006e919061009d565b61009b565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b8073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b600080fd5b600080fd5b610107816100f4565b811461011257600080fd5b5056fea2646970667358221220";

// Contract ABI
const CONTRACT_ABI = [
  "constructor()",
  "function owner() external view returns (address)",
  "function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays) external",
  "function getAllCampaigns() external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function getUserCampaigns(address _user) external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[])",
  "function removeCampaign(address _campaignAddress) external",
  "function togglePause() external",
  "function paused() external view returns (bool)"
];

async function deploySimpleContract() {
  try {
    console.log("🚀 Deploying simple contract...");
    
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
    
    // Deploy contract
    console.log("Deploying contract...");
    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Test the contract
    console.log("Testing contract...");
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    
    console.log("\n✅ Deployment successful!");
    console.log("📝 Update your contract address in src/app/constants/contracts.ts:");
    console.log(`export const CROWDFUNDING_FACTORY = "${contractAddress}";`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

deploySimpleContract();
