const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory("MyEpicNFT");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);

  for (i = 0; i < 3; i++) {
    // Call the function.
    let txn = await nftContract.makeAnEpicNFT();
    // Wait for it to be mined.
    await txn.wait();
  }

  let reportCount = await nftContract.getTotalMintCount();
  console.log("Total NFT count", reportCount.toNumber());

  let maxTokens = await nftContract.maxTokens();
  console.log("Max allowed tokens", maxTokens.toNumber());

  //   // Mint another NFT for fun.
  //   txn = await nftContract.makeAnEpicNFT();
  //   // Wait for it to be mined.
  //   await txn.wait();

  //   txn = await nftContract.makeAnEpicNFT();
  //   // Wait for it to be mined.
  //   await txn.wait();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
