import { ethers } from "hardhat";
import type {BaseContract, ContractTransactionResponse, TransactionReceipt} from "ethers";
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

export async function printDeploymentFee(contract: BaseContract) {
  const tx = (await contract.deploymentTransaction())!;
  await printTransactionFee(tx);
}

export async function printTransactionFee(tx: ContractTransactionResponse) {
  let receipt;
  while (true) {
    const result = await ethers.provider.getTransactionReceipt(tx.hash);
    if (result != null) {
      receipt = result;
      break;
    }
  }
  if (receipt.status == 0) {
    await printError(receipt);
    return;
  }
  try {
    console.log(`Fee ${ethers.formatEther(receipt.fee)} Eth. GasPrice ${ethers.formatUnits(receipt.gasPrice, "gwei")} GWei. Gas ${receipt.gasUsed}`);
  } catch (e) {
    console.log(e);
    console.log(receipt);
  }
}

async function printError(receipt: TransactionReceipt) {
  const tx = (await ethers.provider.getTransaction(receipt.hash))!;
  const code = await ethers.provider.call(tx);
}

function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
          resolve(results);
      })
      .on('error', (error) => {
          reject(error);
      });
  });
}

export async function readBaxHolders() {
  let holders = (await parseCSV('scripts/holders.csv'));
  
  return holders;
}

export async function addGasLimitForRedefi(options: any, gasLimit: number) {
  const network = await ethers.provider.getNetwork();
  if([1899n, 11899n, 47803n, 147803n].indexOf(network.chainId) == -1)
    return;
  options.gasLimit = gasLimit;
}

export async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function waitForGoodGasPrice() {
  const MAXIMUM_GAS_PRICE = Number.parseInt(process.env.MAXIMUM_GAS_PRICE!);
  const LOG_PERIOD = 10000;  //ms
  const RETRY_PERIOD = 2000; //ms

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