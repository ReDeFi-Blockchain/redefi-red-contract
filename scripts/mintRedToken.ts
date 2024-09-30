import { ethers } from "hardhat";
import { addGasLimitForRedefi, printTransactionFee, readBaxHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Minting tokens");
  const holders = await readBaxHolders();
  const token = await ethers.getContractAt("REDToken", process.env.ERC20_TOKEN_ADDRESS!);
  let totalAmount = 0n;
  for (let i = 0; i < holders.length; i++) {
    totalAmount +=  ethers.parseUnits(holders[i].RedAmount, 18);
  }
  {
    const [owner] = await ethers.getSigners();
    let options = {};
    await addGasLimitForRedefi(options, 200_000);
    const tx = await token.mint(await owner.getAddress(), totalAmount, options);
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