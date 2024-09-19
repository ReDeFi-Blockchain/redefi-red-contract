import { ethers } from "hardhat";

async function main() {
  const feeData = await ethers.provider.getFeeData();
  console.log("feeData", feeData);
  const block = await ethers.provider.getBlock("latest");
  console.log("baseFee", block?.baseFeePerGas);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});