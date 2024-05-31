// SPDX-License-Identifier: OTHER
// This code is automatically generated

pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error AccountFrozen();

contract REDToken is ERC20, Ownable, ERC20Pausable, ERC20Burnable  {
  string public constant NAME = "ReDeFi RED";
  string public constant SYMBOL = "RED";
  uint public constant INITIAL_SUPPLY = 500000;

  mapping(address => bool) public freezes;

  constructor() ERC20(NAME, SYMBOL) Ownable(msg.sender) {
    _mint(msg.sender, INITIAL_SUPPLY * 10**decimals());
  }

  function pause() public onlyOwner {
    super._pause();
  }

  function unpause() public onlyOwner {
    super._unpause();
  }

  function mint(address to, uint256 amount) public onlyOwner {
    super._mint(to, amount);
  }

  /**
   * Method freezeWallet allows to set the freeze flag on a single account
   * @param account - address to freeze
   */
  function freezeWallet(address account) public onlyOwner {
    freezes[account] = true;
  }

  /**
   * Method unfreezeWallet allows to clear the freeze flag on a single account
   * @param account - address to unfreeze
   */
  function unfreezeWallet(address account) public onlyOwner {
    freezes[account] = false;
  }

  /**
   * Method _update enforces the freeze flag on the sender (from) account
   *
   * @param from - sender address
   * @param to - recipient address (ignored)
   * @param value - amount being send (ignored)
   */
  function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
    if (freezes[from]) {
      revert AccountFrozen();
    }
    super._update(from, to, value);
  }

}
