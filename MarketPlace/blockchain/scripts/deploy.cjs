const hre = require("hardhat");

async function main() {
  const ComputeMarketplaceMVP = await hre.ethers.getContractFactory("ComputeMarketplaceMVP");
  const marketplace = await ComputeMarketplaceMVP.deploy();
  await marketplace.waitForDeployment();

  console.log("ComputeMarketplaceMVP deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
