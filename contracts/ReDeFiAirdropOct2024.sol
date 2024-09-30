// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ReDeFiAirdropOct2024 is Ownable {
    event RedReleased(address indexed beneficiary, uint256 amount);
    event BatchAddBenefitiaries(address indexed beneficiary);

    address _redToken;
    mapping(address beneficiary => uint256) private _redReleased;
    mapping(address beneficiary => uint256) private _redAllocated;
    uint64 private immutable _start;
    uint64 private immutable _duration;

    /**
     * @dev Sets vested token, the start timestamp and the vesting duration of the vesting wallet.
     */
    constructor(address redToken, uint64 startTimestamp, uint64 durationSeconds) payable Ownable(msg.sender) {
        _start = startTimestamp;
        _duration = durationSeconds;
        _redToken = redToken;
    }

    function batchAddBenefitiaries(
        address[] calldata beneficiaries,
        uint256[] calldata allocatedAmounts
    ) external onlyOwner {
        require(beneficiaries.length == allocatedAmounts.length, "wrong length");
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            address beneficiary = beneficiaries[i];
            _redAllocated[beneficiary] = allocatedAmounts[i];
        }
        emit BatchAddBenefitiaries(beneficiaries[beneficiaries.length - 1]);
    }

    receive() external payable onlyOwner {}

    function token() external  view returns (address) {
        return _redToken;
    }
    /**
     * @dev Getter for the start timestamp.
     */
    function start() public view returns (uint256) {
        return _start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() public view returns (uint256) {
        return _duration;
    }

    /**
     * @dev Getter for the end timestamp.
     */
    function end() public view returns (uint256) {
        return start() + duration();
    }

    /**
     * @dev Amount of token already released
     */
    function released(address beneficiary) public view returns (uint256) {
        return _redReleased[beneficiary];
    }

    /**
     * @dev Getter for the amount of releasable `token` tokens.
     */
    function releasable(address beneficiary) public view returns (uint256) {
        return vestedAmount(beneficiary, uint64(block.timestamp)) - released(beneficiary);
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {RedReleased} event.
     */
    function release() public {
        uint256 amount = releasable(msg.sender);
        require(amount > 0, "nothing to release");
        _redReleased[msg.sender] += amount;
        emit RedReleased(msg.sender, amount);
        SafeERC20.safeTransferFrom(IERC20(_redToken), owner(), msg.sender, amount);
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address beneficiary, uint64 timestamp) public view returns (uint256) {
        return _vestingSchedule(_redAllocated[beneficiary], timestamp);
    }

    function allocatedAmount(address beneficiary) external view returns (uint256) {
        return _redAllocated[beneficiary];
    }

    /**
     * @dev Implementation of the vesting formula. This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= end()) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }
}
