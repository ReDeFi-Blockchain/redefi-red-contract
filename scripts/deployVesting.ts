import { network, ethers } from "hardhat";
import * as fs from 'fs';
import { addGasLimitForRedefi, printDeploymentFee, waitForGoodGasPrice } from "./utils";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const token = process.env.TOKEN_ADDRESS!;
    const vestingStart = Number.parseInt(process.env.VESTING_START_SEC!);
    const vestingDuration = Number.parseInt(process.env.VESTING_DURATION_SEC!);

    console.log("Deploying Vesting");
    let options = {};
    await addGasLimitForRedefi(options, 1_300_000);
    await waitForGoodGasPrice();
    const vesting = await ethers.deployContract("Vesting", [token, vestingStart, vestingDuration], options);
    await vesting.waitForDeployment();
    console.log(`Vesting deployed to ${vesting.target}`);
    fs.appendFileSync('contractDeployment.txt', `${Date.now()} ${network.name} Vesting ${vesting.target}\n`);
    await printDeploymentFee(vesting);

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});