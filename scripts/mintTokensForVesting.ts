import { ethers } from "hardhat";
import { addGasLimitForRedefi, printTransactionFee, readHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Minting tokens");
  const holders = await readHolders();
  const testToken = await ethers.getContractAt("TestToken", process.env.TOKEN_ADDRESS!);
  let totalAmount = 0n;
  for (let i = 0; i < holders.length; i++) {
    totalAmount +=  ethers.parseUnits(holders[i].Amount, 18);
  }
  {
    let options = {};
    await addGasLimitForRedefi(options, 60_000);
    const tx = await testToken.mint(process.env.VESTING_CONTRACT_ADDRESS!, totalAmount, options);
    await printTransactionFee(tx);
    console.log("Minted", totalAmount);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});