pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BatchTransfer {
  event ERC20BatchTransfer(address indexed token, 
                      address indexed from, 
                      address indexed to);

  function batchTransfer(
     address[] calldata recipients,
     uint256[] calldata amounts,
     address tokenAddress
  ) external payable {
    if(recipients.length != amounts.length) {
      revert("wrong length");
    }

    if (tokenAddress == address(0)) {
      revert("can't send eth");
    }

    IERC20 token = IERC20(tokenAddress);

    for (uint256 i = 0; i < recipients.length; i++) {
      address recipient = recipients[i];
      token.transferFrom(msg.sender, recipient, amounts[i]);
    }
    emit ERC20BatchTransfer(tokenAddress, msg.sender, recipients[recipients.length - 1]);
  }
}