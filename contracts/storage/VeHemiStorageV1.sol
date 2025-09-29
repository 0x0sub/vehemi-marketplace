// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IVeHemi} from "../interfaces/IVeHemi.sol";
import {IRewardDistributor} from "../interfaces/IRewardDistributor.sol";
import {IVeHemiVoteDelegation} from "../interfaces/IVeHemiVoteDelegation.sol";

abstract contract VeHemiStorageV1 is IVeHemi {
    // --- State ---
    uint256 public totalLocked;
    uint256 public epoch;
    uint256 public nextTokenId;

    IVeHemiVoteDelegation public voteDelegation;
    IRewardDistributor public rewardDistributor; // 0x0 is valid
    address public forfeitAdmin;
    mapping(uint256 => Point) internal globalPointHistory; // epoch -> Point
    mapping(uint256 => UserPoint[1000000000]) internal userPointHistory; // tokenId -> UserPoint[userEpoch]
    mapping(uint256 => uint256) public userPointEpoch; // tokenId -> epoch
    mapping(uint256 => int128) public slopeChanges; // time -> signed slope change
    mapping(uint256 => LockedBalance) internal locked; // tokenId -> LockedBalance
    mapping(uint256 => address) public provider; // tokenId -> address.
    mapping(uint256 => uint256) public transferableAfter; // tokenId -> timestamp // nft transferable from timestamp
    mapping(uint256 => bool) public forfeitable; // tokenId -> bool
}
