import { ethers } from "hardhat";
import { printTransactionFee, readHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const holders = await readHolders();
  const tokensPerPerson = Number.parseInt(process.env.TOKENS_PER_PERSON!);
  console.log(`Approving ${holders.length * tokensPerPerson} tokens`);
  const [signer] = await ethers.getSigners();
  const redToken = await ethers.getContractAt("REDToken", process.env.TOKEN_ADDRESS!, signer);
  const tx = await redToken.approve(process.env.BATCH_CONTRACT_ADDRESS!, holders.length * tokensPerPerson, { gasLimit: 60_000 });
  await printTransactionFee(tx);
  console.log("Approved");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});