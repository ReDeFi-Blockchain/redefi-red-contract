import { ethers } from "hardhat";
import { printTransactionFee, readHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Minting tokens");
  const holders = await readHolders();
  const testToken = await ethers.getContractAt("TestToken", process.env.TOKEN_ADDRESS!);
  {
    const [owner] = await ethers.getSigners();
    const tx = await testToken.mint(await owner.getAddress(), holders.length);
    await printTransactionFee(tx);
    console.log("Minted");
  }
  {
    console.log("Approving tokens");
    const tx = await testToken.approve(process.env.BATCH_CONTRACT_ADDRESS!, holders.length);
    await printTransactionFee(tx);
    console.log("Approved");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});