import { ethers } from "hardhat";

async function main() {
  const network = await ethers.provider.getNetwork();
  let options = undefined;
  if([1899n, 11899n, 47803n, 47803n].indexOf(network.chainId) > -1) options = {gasLimit: 1_700_000};

  const token = await ethers.deployContract("REDToken", [], options);
  await token.waitForDeployment();

  console.log(
    `RED token deployed to ${token.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
