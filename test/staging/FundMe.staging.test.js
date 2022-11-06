const { network, ethers, getNamedAccounts } = require('hardhat');
const { assert } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther('0.1');

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract('FundMe', deployer);
      });

      it('Allows people to fund and withdraw', async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );

        assert.equal(endingFundMeBalance.toString(), '0');
      });
    });
