import { ethers } from "hardhat";
import { addGasLimitForRedefi, printTransactionFee, readBaxHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Minting tokens");
  const holders = await readBaxHolders();
  const testToken = await ethers.getContractAt("TestToken", process.env.ERC20_TOKEN_ADDRESS!);
  let totalAmount = 0n;
  for (let i = 0; i < holders.length; i++) {
    totalAmount +=  ethers.parseUnits(holders[i].Amount, 18);
  }
  {
    const [owner] = await ethers.getSigners();
    let options = {};
    await addGasLimitForRedefi(options, 100_000);
    const tx = await testToken.mint(await owner.getAddress(), totalAmount, options);
    await printTransactionFee(tx);
    console.log("Minted", totalAmount);
  }
  {
    console.log("Approving tokens");
    let options = {};
    await addGasLimitForRedefi(options, 60_000);
    const tx = await testToken.approve(process.env.BATCH_CONTRACT_ADDRESS!, totalAmount, options);
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