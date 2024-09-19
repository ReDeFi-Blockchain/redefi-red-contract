pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestToken is ERC20 {
    constructor () ERC20("TEST", "TEST") {
    }

    function mint(address account, uint256 value) external {
        _mint(account, value);
    }

}