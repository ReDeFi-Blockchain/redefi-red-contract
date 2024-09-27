import { ethers } from "hardhat";
import { addGasLimitForRedefi, printTransactionFee } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const redToken = await ethers.getContractAt("REDToken", process.env.TOKEN_ADDRESS!);
  const balance = await redToken.balanceOf(signer);
  console.log(`Approving ${balance} tokens`);
  let options = {};
  await addGasLimitForRedefi(options, 60_000);
  const tx = await redToken.approve(process.env.VESTING_CONTRACT_ADDRESS!, balance, options);
  await printTransactionFee(tx);
  console.log("Approved");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});