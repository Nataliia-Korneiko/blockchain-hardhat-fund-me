const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');

describe('FundMe', async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther('1'); // ETH

  beforeEach(async function () {
    // const accounts = await ethers.getSigners()
    // deployer = accounts[0]
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(['all']);
    fundMe = await ethers.getContract('FundMe', deployer);
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
  });

  describe('constructor', async function () {
    it('Sets the aggregator addresses correctly', async function () {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe('fund', async function () {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        'You need to spend more ETH!'
      );
    });

    it('Updates the amount funded data structure', async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it('Adds funder  to array of funders', async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.funders(0);
      assert.equal(response, deployer);
    });
  });

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it('Withdraws ETH from a single funder', async function () {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      // const gasCost = gasUsed * effectiveGasPrice;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);

      // assert.equal(
      //   startingFundMeBalance + startingDeployerBalance,
      //   endingDeployerBalance + gasCost
      // );
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it('Is allows us to withdraw with multiple funders', async function () {
      // Arrange
      const accounts = await ethers.getSigners();

      for (i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Make a getter for storage variables
      await expect(fundMe.funders(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it('Only allows the owner to withdraw', async function () {
      const accounts = await ethers.getSigners();
      const fundMeConnectedContract = await fundMe.connect(accounts[1]);
      // await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
      //   'FundMe__NotOwner'
      // );

      await expect(fundMeConnectedContract.withdraw()).to.be.reverted;
    });
  });
});