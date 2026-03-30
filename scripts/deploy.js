const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying PasswordVault contract...\n");

  // Get the contract factory
  const PasswordVault = await hre.ethers.getContractFactory("PasswordVault");

  console.log("Deploying contract...");

  // Deploy the contract
  const passwordVault = await PasswordVault.deploy();

  // Wait for deployment to be confirmed
  await passwordVault.waitForDeployment();

  const deployedAddress = await passwordVault.getAddress();

  console.log(`✅ PasswordVault deployed successfully!`);
  console.log(`📍 Contract Address: ${deployedAddress}`);
  console.log(`🔗 Transaction Hash: ${passwordVault.deploymentTransaction()?.hash}`);

  // Save contract address to a file for frontend use
  const deploymentInfo = {
    contractAddress: deployedAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
  };

  // Create deployments folder if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n📁 Deployment info saved to: deployments/${hre.network.name}.json`);

  // Also update .env file with contract address (optional)
  try {
    const envPath = path.join(__dirname, "../.env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Remove old CONTRACT_ADDRESS if exists
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, "");
    
    // Add new one
    envContent += `\nCONTRACT_ADDRESS=${deployedAddress}\n`;

    fs.writeFileSync(envPath, envContent.trim() + "\n");
    console.log("✅ CONTRACT_ADDRESS updated in .env file");
  } catch (error) {
    console.log("⚠️  Could not update .env file (optional)");
  }

  console.log("\n🎉 Deployment complete!");
  console.log(`\nNext steps:`);
  console.log(`1. Update CONTRACT_ADDRESS in your frontend components`);
  console.log(`2. Run frontend with: cd frontend && npm run dev`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
