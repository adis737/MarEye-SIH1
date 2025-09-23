const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployWithForge() {
  try {
    console.log("🔨 Compiling contracts with Forge...");
    
    // Compile contracts
    execSync('forge build', { stdio: 'inherit', cwd: __dirname });
    
    console.log("✅ Compilation successful!");
    
    // Deploy to Sepolia
    console.log("🚀 Deploying to Sepolia...");
    
    const deployCommand = `forge create --rpc-url https://ethereum-sepolia.publicnode.com --private-key 772a8c71208dfbb15b9ee1f73eee8f4b1a72956a58ad0696e7420b520555241c --etherscan-api-key YOUR_ETHERSCAN_API_KEY --verify src/CrowdfundingFactory.sol:CrowdfundingFactory`;
    
    console.log("Running:", deployCommand);
    
    const output = execSync(deployCommand, { 
      stdio: 'pipe', 
      cwd: __dirname,
      encoding: 'utf8'
    });
    
    console.log("Deploy output:", output);
    
    // Extract contract address from output
    const addressMatch = output.match(/Deployed to: (0x[a-fA-F0-9]{40})/);
    if (addressMatch) {
      const contractAddress = addressMatch[1];
      console.log("\n🎉 Deployment successful!");
      console.log("Contract address:", contractAddress);
      console.log("\n📝 Update your contract address in src/app/constants/contracts.ts:");
      console.log(`export const CROWDFUNDING_FACTORY = "${contractAddress}";`);
    } else {
      console.log("❌ Could not extract contract address from output");
      console.log("Full output:", output);
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("\n💡 Make sure you have:");
    console.log("1. Forge installed (foundryup)");
    console.log("2. Sepolia ETH in your wallet");
    console.log("3. Valid Etherscan API key (optional)");
  }
}

deployWithForge();
