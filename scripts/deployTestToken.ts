import { network, ethers } from "hardhat";
import type {BaseContract} from "ethers";
import * as fs from 'fs';
import { printDeploymentFee } from "./utils";

async function main() {
  console.log("Deploying TestToken");
  const token = await ethers.deployContract("TestToken");
  await token.waitForDeployment();
  console.log(`TestToken deployed to ${token.target}.`);
  fs.appendFileSync('contractDeployment.txt', `${Date.now()} ${network.name} TestToken     ${token.target}\n`);
  await printDeploymentFee(token);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});