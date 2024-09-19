import { network, ethers } from "hardhat";
import type {BaseContract} from "ethers";
import * as fs from 'fs';
import { printDeploymentFee } from "./utils";

async function main() {
  console.log("Deploying BatchTransfer");
  const batchTransfer = await ethers.deployContract("BatchTransfer");
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