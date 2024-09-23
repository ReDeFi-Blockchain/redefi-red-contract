import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import holders from "./holders.json";

describe("Distribute tokens", function () {
  let owner: Signer;
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTestToken() {
    [owner] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("TestToken", owner);
    const testToken = await TestToken.deploy();

    await testToken.mint(await owner.getAddress(), holders.length);
    return testToken;
  }

  async function deployBatchTransfer() {
    const BatchTransfer = await ethers.getContractFactory("BatchTransfer", owner);
    const batchTransfer = await BatchTransfer.deploy();

    return batchTransfer;
  }

  async function deployTransferWithApprove(testToken: string) {
    const TransferWithApprove = await ethers.getContractFactory("TransferWithApprove", owner);
    const transferWithApprove = await TransferWithApprove.deploy(testToken);

    return transferWithApprove;
  }

  async function deployTransferWithApprove2(testToken: string) {
    const TransferWithApprove = await ethers.getContractFactory("TransferWithApprove2", owner);
    const transferWithApprove = await TransferWithApprove.deploy(testToken);

    return transferWithApprove;
  }

  async function deployTransferWithApprove3(testToken: string) {
    const TransferWithApprove = await ethers.getContractFactory("TransferWithApprove3", owner);
    const transferWithApprove = await TransferWithApprove.deploy(testToken);

    return transferWithApprove;
  }

  it("Send one by one", async function () {
    const testToken = await loadFixture(deployTestToken);
    let ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    let totalGasPrice = 0n;
    for (const holder of holders) {
      let response = await testToken.transfer(holder, 1);
      let receipt = await ethers.provider.getTransactionReceipt(response.hash);
      totalGasPrice += receipt!.gasUsed;
    }
    console.log("totalGasPrice", totalGasPrice);
    //192112020
    let ethAfter = await ethers.provider.getBalance(await owner.getAddress());
    console.log(`Eth spent ${ethBefore - ethAfter }`)
  });

  it("Send in batches", async function () {
    const testToken = await loadFixture(deployTestToken);
    const batchTransfer = await loadFixture(deployBatchTransfer);

    await testToken.approve(await batchTransfer.getAddress(), holders.length);

    let ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    let tokenAddress = await testToken.getAddress();
    const BATCH_SIZE = 100;
    let totalGasPrice = 0n;
    let totalFee = 0n;
    let maxGas = 0n;
    for (let i = 0; i < holders.length; i += BATCH_SIZE) {
      let length = Math.min(holders.length - i, BATCH_SIZE);
      let response = await batchTransfer.batchTransfer(holders.slice(i, i + length), 1, tokenAddress);
      let receipt = await ethers.provider.getTransactionReceipt(response.hash);
      totalGasPrice += receipt!.gasUsed;
      if (receipt!.gasUsed > maxGas)
        maxGas = receipt!.gasUsed;
      totalFee += receipt!.gasUsed * receipt!.gasPrice;
    }
    console.log("totalGasPrice", totalGasPrice);
    console.log("maxGas", maxGas);
    //20 -  121802438
    //100 - 116600862
    //500 - 115584469
    let ethAfter = await ethers.provider.getBalance(await owner.getAddress());

    console.log(`Eth spent ${ethBefore - ethAfter}`);
  });

  it("Pull tokens with approve", async function () {
    const testToken = await loadFixture(deployTestToken);
    const transferWithApprove = await deployTransferWithApprove(await testToken.getAddress());

    await testToken.approve(await transferWithApprove.getAddress(), holders.length);

    let ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    let tokenAddress = await testToken.getAddress();
    let totalGasPrice = 0n;
    const signers = (await ethers.getSigners()).slice(1, 6);
    for (let i = 0; i < holders.length; i++) {
      const signer = signers[i % 5];
      const nonce = intToUint8Array(i + 1);
      let domain = {
        name: "MyContract",
        version: "1",
        chainId: 1,
        verifyingContract: await transferWithApprove.getAddress()
      };
      const signature = await owner.signTypedData(
        domain,
        {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        {
          from: await owner.getAddress(),
          to: await signer.getAddress(),
          value: 1n,
          validAfter: 0n,
          validBefore: 18446744073709551615n, // Valid for an hour
          nonce: nonce,
        }
      );
      let { r, s, v } = ethers.Signature.from(signature);
      let response = await transferWithApprove.connect(signer).transferWithAuthorization(
        await owner.getAddress(),
        await signer.getAddress(),
        1n,
        0n,
        18446744073709551615n,
        nonce,
        v,
        r,
        s
      );
      let receipt = await ethers.provider.getTransactionReceipt(response.hash);
      totalGasPrice += receipt!.gasUsed;
    }
    
    console.log("totalGasPrice", totalGasPrice);
    //303525372
    let ethAfter = await ethers.provider.getBalance(await owner.getAddress());

    console.log(`Eth spent ${ethBefore - ethAfter}`);

    function intToUint8Array(value: number) {
      const byteArray = new Uint8Array(32);
      for (let i = byteArray.length - 1; i >= 0; i--) {
          byteArray[i] = value & 0xff;
          value = value >> 8;
      }
      return byteArray;
    }
  });


  it("Pull tokens with approve 2", async function () {
    const testToken = await loadFixture(deployTestToken);
    const transferWithApprove = await deployTransferWithApprove2(await testToken.getAddress());

    await testToken.approve(await transferWithApprove.getAddress(), holders.length);

    let ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    let tokenAddress = await testToken.getAddress();
    let totalGasPrice = 0n;
    const signers = (await ethers.getSigners()).slice(1, 6);
    for (let i = 0; i < holders.length; i++) {
      const signer = signers[i % 5];
      let domain = {
        name: "MyContract",
        version: "1",
        chainId: 1,
        verifyingContract: await transferWithApprove.getAddress()
      };
      const signature = await owner.signTypedData(
        domain,
        {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        },
        {
          from: await owner.getAddress(),
          to: await signer.getAddress(),
          value: 1n,
          validAfter: 0n,
          validBefore: 18446744073709551615n, // Valid for an hour
          nonce: BigInt(i),
        }
      );
      let { r, s, v } = ethers.Signature.from(signature);
      let response = await transferWithApprove.connect(signer).transferWithAuthorization(
        await owner.getAddress(),
        await signer.getAddress(),
        1n,
        0n,
        18446744073709551615n,
        BigInt(i),
        v,
        r,
        s
      );
      let receipt = await ethers.provider.getTransactionReceipt(response.hash);
      totalGasPrice += receipt!.gasUsed;
    }
    
    console.log("totalGasPrice", totalGasPrice);
    //239301132
    let ethAfter = await ethers.provider.getBalance(await owner.getAddress());

    console.log(`Eth spent ${ethBefore - ethAfter}`);
  });

  it("Pull tokens with approve 3", async function () {
    const testToken = await loadFixture(deployTestToken);
    const transferWithApprove = await deployTransferWithApprove3(await testToken.getAddress());

    await testToken.approve(await transferWithApprove.getAddress(), holders.length);

    let ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    let tokenAddress = await testToken.getAddress();
    let totalGasPrice = 0n;
    const signers = (await ethers.getSigners()).slice(1, 6);
    for (let i = 0; i < holders.length + Math.floor(holders.length) / 256; i++) {
      if (i % 256 == 0)
          i++;
      const signer = signers[i % 5];
      let domain = {
        name: "MyContract",
        version: "1",
        chainId: 1,
        verifyingContract: await transferWithApprove.getAddress()
      };
      const signature = await owner.signTypedData(
        domain,
        {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        },
        {
          from: await owner.getAddress(),
          to: await signer.getAddress(),
          value: 1n,
          validAfter: 0n,
          validBefore: 18446744073709551615n, // Valid for an hour
          nonce: BigInt(i),
        }
      );
      let { r, s, v } = ethers.Signature.from(signature);
      let response = await transferWithApprove.connect(signer).transferWithAuthorization(
        await owner.getAddress(),
        await signer.getAddress(),
        1n,
        0n,
        18446744073709551615n,
        BigInt(i),
        v,
        r,
        s
      );
      let receipt = await ethers.provider.getTransactionReceipt(response.hash);
      totalGasPrice += receipt!.gasUsed;
    }
    
    console.log("totalGasPrice", totalGasPrice);
    //239301132
    let ethAfter = await ethers.provider.getBalance(await owner.getAddress());

    console.log(`Eth spent ${ethBefore - ethAfter}`);
  });
})