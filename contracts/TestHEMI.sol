// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestHEMI
 * @notice Test ERC20 token for testing veHemi functionality
 */
contract TestHEMI is ERC20, Ownable {
    constructor() ERC20("Test HEMI", "tHEMI") Ownable(msg.sender) {
        // Mint 1 million tokens to the deployer
        _mint(msg.sender, 1_000_000 * 10**18);
    }

    /**
     * @notice Mint tokens to a specific address (for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function for testing - anyone can get 1000 tokens
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**18);
    }
}




















