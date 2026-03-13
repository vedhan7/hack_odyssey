import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // 1. SKIP SBT (Already deployed)
  const sbtAddress = "0x2c155dEea9a69B1AC012282cB8a63C3057f759Fb";
  console.log(`Using existing CertSBT at: ${sbtAddress}`);
  const certSBT = await hre.ethers.getContractAt("CertSBT", sbtAddress);

  // 2. Deploy Registry
  const CertRegistry = await hre.ethers.getContractFactory("CertRegistry");
  const certRegistry = await CertRegistry.deploy();
  await certRegistry.waitForDeployment();
  const registryAddress = await certRegistry.getAddress();
  console.log(`CertRegistry deployed to: ${registryAddress}`);

  // 3. Link them together
  console.log("Linking contracts...");
  await certRegistry.setSBTContract(sbtAddress);
  await certSBT.setRegistry(registryAddress);
  
  console.log("Deployment and linking complete!");
  console.log("-----------------------------------------");
  console.log(`VITE_CERT_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`VITE_CERT_SBT_ADDRESS=${sbtAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
