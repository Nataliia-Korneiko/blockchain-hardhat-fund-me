// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './PriceConverter.sol';

error NotOwner();

contract FundMe {
  using PriceConverter for uint256;

  uint256 public constant MINIMUM_USD = 50 * 1e18; // 1 * 10 ** 18
  // 21,415 gas - constant
  // 23,515 gas - non-constant
  // 21,415 * 141000000000 = $9,058545
  // 23,515 * 141000000000 = $9,946845

  address[] public funders;
  mapping(address => uint256) public addressToAmountFunded;

  address public immutable i_owner; // immutable

  // 21,508 gas - immutable
  // 23,644 gas - non-immutable

  AggregatorV3Interface private s_priceFeed;

  constructor(address priceFeed) {
    s_priceFeed = AggregatorV3Interface(priceFeed);
    i_owner = msg.sender;
  }

  // msg.value (uint): number of wei sent with the message
  // msg.sender (address): sender of the message (current call)
  function fund() public payable {
    // getConversionRate(msg.value);
    // msg.value.getConversionRate();

    // require(msg.value > 1e18, "You need to spend more ETH!"); // 1e18 = 1 * 10 ** 18 = 1000000000000000000
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      'You need to spend more ETH!'
    ); // 1e18 = 1 * 10 ** 18 = 1000000000000000000
    funders.push(msg.sender);
    addressToAmountFunded[msg.sender] = msg.value;
  }

  function withdraw() public onlyOwner {
    // starting index
    // ending index
    // step amount
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      addressToAmountFunded[funder] = 0;
    }

    // reset the array
    funders = new address[](0);

    // msg.sender = address
    // payable(msg.sender) = payable address

    // transfer
    // payable(msg.sender).transfer(address(this).balance);

    // send
    // bool sendSuccess = payable(msg.sender).send(address(this).balance);
    // require(sendSuccess, "Send failed");

    // call
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }('');
    require(callSuccess, 'Call failed');
  }

  modifier onlyOwner() {
    // require(msg.sender == i_owner, 'Sender is not owner!'); // 1
    if (msg.sender != i_owner) {
      revert NotOwner();
    }
    _; // 2 (all code in withdraw())
  }

  fallback() external payable {
    fund();
  }

  receive() external payable {
    fund();
  }
}
