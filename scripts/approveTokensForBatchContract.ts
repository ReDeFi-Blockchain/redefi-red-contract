import { ethers } from "hardhat";
import { printTransactionFee, readHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const holders = await readHolders();
  console.log(`Approving ${holders.length} tokens`);
  const [signer] = await ethers.getSigners();
  const redToken = await ethers.getContractAt("REDToken", process.env.TOKEN_ADDRESS!, signer);
  const tx = await redToken.approve(process.env.BATCH_CONTRACT_ADDRESS!, holders.length);
  await printTransactionFee(tx);
  console.log("Approved");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});