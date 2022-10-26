// Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts

const networkConfig = {
  31337: {
    name: 'localhost',
  },
  4: {
    name: 'rinkeby',
    ethUsdPriceFeed: '0x8a753747a1fa494ec906ce90e9f37563a8af630e',
  },
  5: {
    name: 'goerli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
  },
  137: {
    name: 'polygon',
    ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  },
};

const developmentChains = ['hardhat', 'localhost'];
const DECIMALS = '8';
const INITIAL_PRICE = '200000000000'; // 2000

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
};
