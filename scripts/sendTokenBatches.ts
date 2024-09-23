import { ethers } from "hardhat";
import { BatchTransfer } from "../typechain-types";
import { printTransactionFee, readHolders } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const MAXIMUM_GAS_PRICE = Number.parseInt(process.env.MAXIMUM_GAS_PRICE!);

async function main() {
  const BATCH_SIZE = 50;

  const holders = await readHolders();
  const tokensPerPerson = ethers.parseUnits(process.env.TOKENS_PER_PERSON!, 18);
  
  const batchTransfer = await ethers.getContractAt("BatchTransfer", process.env.BATCH_CONTRACT_ADDRESS!);
  const [owner] = await ethers.getSigners();

  const tokenAddress = process.env.TOKEN_ADDRESS!;
  const redToken = await ethers.getContractAt("REDToken", tokenAddress);
  console.log("Sender balance", await redToken.balanceOf(owner));

  const lastRecepientIndex = await getLastRecepient(tokenAddress, batchTransfer, holders);
  console.log("lastRecepientId", lastRecepientIndex);
  console.log(`Starting batched sending. Batch size = ${BATCH_SIZE}. Amount =  ${tokensPerPerson} token per receiver`);
  

  for (let i = lastRecepientIndex + 1; i < holders.length; i += BATCH_SIZE) {
    await waitForGoodGasPrice();
    const length = Math.max(Math.min(holders.length - i, BATCH_SIZE), 0);
    const recepients = holders.slice(i, i + length);
    const amounts = new Array(length).fill(tokensPerPerson);
    console.log("Starting batch transfer");
    const tx = await batchTransfer.batchTransfer(recepients, amounts, tokenAddress, {gasPrice: MAXIMUM_GAS_PRICE, gasLimit: 3100000 });
    console.log("Waiting for receipt");
    await printTransactionFee(tx);
    console.log(i + length, "receivers handled.");
  }
  console.log("Finished batched sending.")
}

async function getLastRecepient(tokenAddress: string, batchTransfer: BatchTransfer, holders: string[]) {
  const eventFilter = batchTransfer.filters["ERC20BatchTransfer(address,address,address)"]();
  const currentBlock = await ethers.provider.getBlockNumber();
  const block = Math.max(currentBlock - 100_000, 0);
  const events = await batchTransfer.queryFilter(eventFilter, block);
  if (events.length > 0) {
    const lastRecepient = events[events.length - 1].args[2];
    console.log("lastRecepient", lastRecepient);
    return holders.indexOf(lastRecepient.toLowerCase());
  } else
    return -1;
}

async function waitForGoodGasPrice() {
  const LOG_PERIOD = 10000;
  const RETRY_PERIOD = 2000;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let lastPriceLogTime = 0;
  while (true) {
    const feeData = await ethers.provider.getFeeData();
    if (feeData.gasPrice && feeData.gasPrice <= MAXIMUM_GAS_PRICE)
      break;
    const now = Date.now();
    if (now - lastPriceLogTime > LOG_PERIOD) {
      console.log("Waiting for good gas price. Current price is", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "target price", ethers.formatUnits(MAXIMUM_GAS_PRICE, "gwei"));
      lastPriceLogTime = now;
    }
    await sleep(RETRY_PERIOD);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});