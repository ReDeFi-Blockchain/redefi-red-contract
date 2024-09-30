# RED Token Distribution
1. Install nvm and node

To install NVM (Node Version Manager) on Ubuntu, follow these steps:

Install curl: First, you need to install curl if it’s not already installed. Open a terminal and run:
```
sudo apt install curl
```

Download and install NVM: Use curl to download and install NVM by running the following command:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Load NVM: After the installation, you need to load NVM into your current shell session. You can do this by running:
```
source ~/.bashrc
```

Verify the installation: To verify that NVM is installed correctly, run:
```
nvm --version
```

Install Node.js: Now you can use NVM to install Node.js. For example, to install the latest version of Node.js, run:
```
nvm install lts/iron
```

Use a specific Node.js version: To use a specific version of Node.js, you can run:
```
nvm use lts/iron
```

2. Init project with
```
npm install
```
3. Create `secrets.ts` file.
```
cp secrets.example.ts secrets.ts
```
Fill private keys and infura api key.

4. Create `.env` file
```
cp .env.example .env
```
5. Set `ERC20_TOKEN_ADDRESS` in `.env` to REDToken address
6. Set `VESTING_START_SEC` to unix time when vesting should be started. Set `VESTING_DURATION_SEC` to vesting duration in seconds. Use https://www.unixtimestamp.com/
7. Deploy Vesting contract.
```
npx hardhat run scripts/deployBatchSender.ts
```
8. Set `REDEFI_AIRDROP_OCT2024_CONTRACT_ADDRESS` in .env file.
9. Approve tokens to be used by Vesting contract.
```
npx hardhat run scripts/approveTokensForVestingContract.ts
```
8. Update target gas price `MAXIMUM_GAS_PRICE` in .env file.
9. Allocate tokens for recepients
```
npx hardhat run scripts/setAllocatedAmounts.ts
```