import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RED token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    const REDToken = await ethers.getContractFactory("REDToken");
    const redToken = await REDToken.deploy();

    return redToken;
  }

  describe("Deployment", function () {
    it("Should deploy contract with correct decimals", async function () {
      const redToken = await loadFixture(deployToken);
      expect(await redToken.decimals()).to.equal(18);
    });

    it("Should deploy contract with correct symbol", async function () {
      const redToken = await loadFixture(deployToken);
      expect(await redToken.symbol()).to.equal("RED");
    });

    it("Should deploy contract with correct name", async function () {
      const redToken = await loadFixture(deployToken);
      expect(await redToken.name()).to.equal("ReDeFi");
    });

    it("Should deploy contract with correct initial supply", async function () {
      const redToken = await loadFixture(deployToken);
      expect(await redToken.totalSupply()).to.equal(500_000_000_000_000_000_000_000n);
    });
  });

  describe("Pausability", function () {
    it("Should transfer when not paused", async function () {
      const redToken = await loadFixture(deployToken);
      const [_, receiver] = await ethers.getSigners();
      expect(await redToken.transfer(receiver, 1_000_000_000_000_000_000n)).to.not.be.reverted;
    });

    it("Transfer should revert when paused", async function () {
      const redToken = await loadFixture(deployToken);
      await redToken.pause();
      const [_, receiver] = await ethers.getSigners();
      await expect(redToken.transfer(receiver, 1_000_000_000_000_000_000n)).to.be.revertedWithCustomError(
        redToken,
        "EnforcedPause"
      );
    });
  });

  describe("Freezing single account", function () {
    it("Transfer should revert when sender account is frozen", async function () {
      const [_, user1, user2] = await ethers.getSigners();

      const redToken = await loadFixture(deployToken);
      await redToken.freezeWallet(user1);
      expect(await redToken.transfer(user1, 1_000_000_000_000_000_000n)).to.not.be.reverted;
      expect(await redToken.freezes(user1)).to.equal(true);
      await expect(redToken.connect(user1).transfer(user2, 1_000_000_000_000_000_000n)).to.be.revertedWithCustomError(
        redToken,
        "AccountFrozen"
      );
    });
  });

});
