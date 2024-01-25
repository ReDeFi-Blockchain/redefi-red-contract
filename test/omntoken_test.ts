import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { secrets } from "../secrets";

describe("OMNToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    const OMNToken = await ethers.getContractFactory("OMNToken");
    const omnToken = await OMNToken.deploy();

    return omnToken;
  }

  describe("Deployment", function () {
    it("Should deploy contract with correct decimals", async function () {
      const omnToken = await loadFixture(deployToken);
      expect(await omnToken.decimals()).to.equal(18);
    });

    it("Should deploy contract with correct symbol", async function () {
      const omnToken = await loadFixture(deployToken);
      expect(await omnToken.symbol()).to.equal("OMN");
    });

    it("Should deploy contract with correct name", async function () {
      const omnToken = await loadFixture(deployToken);
      expect(await omnToken.name()).to.equal("On-Chain Money");
    });

    it("Should deploy contract with correct initial supply", async function () {
      const omnToken = await loadFixture(deployToken);
      expect(await omnToken.totalSupply()).to.equal(500_000_000_000_000_000_000_000n);
    });
  });

  describe("Pausability", function () {
    it("Should transfer when not paused", async function () {
      const omnToken = await loadFixture(deployToken);
      const [_, receiver] = await ethers.getSigners();
      expect(await omnToken.transfer(receiver, 1_000_000_000_000_000_000n)).to.not.be.reverted;
    });

    it("Transfer should revert when paused", async function () {
      const omnToken = await loadFixture(deployToken);
      await omnToken.pause();
      const [_, receiver] = await ethers.getSigners();
      await expect(omnToken.transfer(receiver, 1_000_000_000_000_000_000n)).to.be.revertedWithCustomError(
        omnToken,
        "EnforcedPause"
      );
    });
  });

  describe("Freezing single account", function () {
    it("Transfer should revert when sender account is frozen", async function () {
      const [_, user1, user2] = await ethers.getSigners();

      const omnToken = await loadFixture(deployToken);
      await omnToken.freezeWallet(user1);
      expect(await omnToken.transfer(user1, 1_000_000_000_000_000_000n)).to.not.be.reverted;
      expect(await omnToken.freezes(user1)).to.equal(true);
      await expect(omnToken.connect(user1).transfer(user2, 1_000_000_000_000_000_000n)).to.be.revertedWithCustomError(
        omnToken,
        "AccountFrozen"
      );
    });
  });

});
