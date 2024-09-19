# RED Token Distribution

1. Deploy BatchSender contract. `npx hardhat run scripts/deployBatchSender.ts`
2. Set `TOKEN_ADDRESS` and `BATCH_CONTRACT_ADDRESS` in .env file.
3. Approve tokens to be used by BatchSender. `npx hardhat run scripts/approveTokensForBatchContract.ts`
4. Start sending tokens to recepients `npx hardhat run scripts/sendTokenBatches.ts`