import { network, ethers } from "hardhat";
import * as fs from 'fs';
import { Vesting } from "../typechain-types";
import { addGasLimitForRedefi, printDeploymentFee, printTransactionFee, readHolders, waitForGoodGasPrice } from "./utils";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const holders = await readHolders();
    const vesting = await ethers.getContractAt("Vesting", process.env.VESTING_CONTRACT_ADDRESS!);
    //amount of tokens holder can receive right now
    const releasable = await vesting.releasable(holders[0].HolderAddress);
    console.log("releasable", releasable);
    //amount of tokens that were already received by holder
    const released = await vesting.released(holders[0].HolderAddress);
    console.log("released", released);
    //amount of tokens that holder will receive in total after vesting period is over
    const allocatedAmount = await vesting.allocatedAmount(holders[0].HolderAddress);
    console.log("allocatedAmount", allocatedAmount);
    //method for holder to receive releasable tokens
    let options = {};
    await addGasLimitForRedefi(options, 1_400_000);
    await vesting.release(options);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});