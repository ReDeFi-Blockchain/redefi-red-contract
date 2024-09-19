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
    const result = await tx.wait();
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

export async function readHolders() {
  let holders = (await parseCSV('scripts/holders.csv')).map(data => data.HolderAddress);
  
  return holders;
}