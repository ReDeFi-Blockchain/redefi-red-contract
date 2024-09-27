import { network, ethers } from "hardhat";
import * as fs from 'fs';
import { Vesting } from "../typechain-types";
import { addGasLimitForRedefi, printDeploymentFee, printTransactionFee, readHolders, waitForGoodGasPrice } from "./utils";

import dotenv from "dotenv";

dotenv.config();

const EVENT_FILTER_RANGE = Number.parseInt(process.env.EVENT_FILTER_RANGE!);

async function main() {
    const BATCH_SIZE = 50;
    
    const holders = await readHolders();
    const vesting = await ethers.getContractAt("Vesting", process.env.VESTING_CONTRACT_ADDRESS!);
    let options = {};
    await addGasLimitForRedefi(options, 1_400_000);
    const lastRecepientIndex = await getLastRecepient(vesting, holders);
    console.log("lastRecepientId", lastRecepientIndex);
    console.log(`Starting batched setting of vested amounts. Batch size = ${BATCH_SIZE}`);
    for (let i = lastRecepientIndex + 1; i < holders.length; i += BATCH_SIZE) {
        const length = Math.min(holders.length - i, BATCH_SIZE);
        const slice = holders.slice(i, i + length);
        let addresses = slice.map(holder => holder.HolderAddress);
        let amounts = slice.map(holder => ethers.parseUnits(holder.Amount, 18));
        await waitForGoodGasPrice();
        console.log("Starting batch");
        let tx = await vesting.batchSetVested(addresses, amounts, options);
        console.log("Waiting for receipt");
        await printTransactionFee(tx);
        console.log(i + length, "holders handled.");
    }
    console.log("Finished batched sending.");
}

async function getLastRecepient(vesting: Vesting, holders: string[]) {
    const eventFilter = vesting.filters["BatchSetVested(address)"]();
    const currentBlock = await ethers.provider.getBlockNumber();
    const block = Math.max(currentBlock - EVENT_FILTER_RANGE, 0);
    const events = await vesting.queryFilter(eventFilter, block);
    if (events.length > 0) {
      const lastRecepient = events[events.length - 1].args[2];
      console.log("lastRecepient", lastRecepient);
      return holders.indexOf(lastRecepient.toLowerCase());
    } else
      return -1;
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});