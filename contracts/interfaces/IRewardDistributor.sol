// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface IRewardDistributor {
    function updateRewards(uint256 tokenId_) external;
}
