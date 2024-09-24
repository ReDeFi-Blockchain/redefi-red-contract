import { network, ethers } from "hardhat";
import * as fs from 'fs';
import { addGasLimitForRedefi, printDeploymentFee } from "./utils";

async function main() {
  console.log("Deploying BatchTransfer");
  let options = {};
  await addGasLimitForRedefi(options, 500_000);
  const batchTransfer = await ethers.deployContract("BatchTransfer", [], options);
  await batchTransfer.waitForDeployment();
  console.log(`BatchTransfer deployed to ${batchTransfer.target}`);
  fs.appendFileSync('contractDeployment.txt', `${Date.now()} ${network.name} BatchTransfer ${batchTransfer.target}\n`);
  await printDeploymentFee(batchTransfer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});