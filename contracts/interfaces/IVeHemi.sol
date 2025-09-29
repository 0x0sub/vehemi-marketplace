// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IVeHemiVoteDelegation} from "./IVeHemiVoteDelegation.sol";
import {IRewardDistributor} from "./IRewardDistributor.sol";

interface IVeHemi is IERC721Enumerable {
    // --- Structs ---
    struct Point {
        int128 bias;
        int128 slope;
        uint64 timestamp;
        uint64 blockNumber;
        uint128 amount;
        uint256 fixedBias; // for v2+ use
    }

    struct UserPoint {
        Point point;
        address owner;
    }

    struct LockedBalance {
        int128 amount;
        uint64 end;
    }

    // --- Events ---
    event Deposit(
        address indexed provider,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 lockTime,
        uint256 timestamp
    );

    event Withdraw(
        address indexed provider,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 timestamp
    );
    event Lock(
        address indexed provider,
        address indexed account,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 start,
        uint256 lockTime,
        uint256 extraData,
        bool transferable,
        bool forfeitable
    );
    event Checkpoint(uint256 epoch, uint256 tokenId, LockedBalance oldLock, LockedBalance newLock);

    event VoteDelegationUpdated(
        IVeHemiVoteDelegation indexed oldVoteDelegation,
        IVeHemiVoteDelegation indexed newVoteDelegation
    );

    event RewardDistributorUpdated(
        IRewardDistributor indexed oldRewardDistributor,
        IRewardDistributor indexed newRewardDistributor
    );

    event ForfeitAdminUpdated(address indexed oldRevokeAdmin, address indexed newRevokeAdmin);

    // --- External/Public Functions ---
    function initialize(address owner) external;
    function checkpoint() external;
    function createLock(uint256 amount, uint256 lockDuration) external returns (uint256 tokenId);
    function createLockFor(
        uint256 amount,
        uint256 lockDuration,
        address account,
        bool transferable,
        bool revokable
    ) external returns (uint256 tokenId);
    function increaseAmount(uint256 tokenId, uint256 amount) external;
    function increaseUnlockTime(uint256 tokenId, uint256 lockDuration) external;
    function withdraw(uint256 tokenId) external;
    function getUserPoint(uint256 tokenId, uint256 epoch) external view returns (UserPoint memory);
    function getGlobalPoint(uint256 epoch) external view returns (Point memory);
    function getLockedBalance(uint256 tokenId) external view returns (LockedBalance memory);
    function totalLocked() external view returns (uint256);
    function epoch() external view returns (uint256);
    function userPointEpoch(uint256 tokenId) external view returns (uint256);
    function balanceOfNFT(uint256 tokenId) external view returns (uint256);
    function balanceOfNFTAt(uint256 tokenId, uint256 timestamp) external view returns (uint256);
    function balanceAndOwnerOfNFTAt(
        uint256 tokenId,
        uint256 timestamp
    ) external view returns (uint256, address);
    function totalVeHemiSupplyAt(uint256 timestamp_) external view returns (uint256);
}
