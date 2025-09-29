// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IVeHemiVoteDelegation} from "../interfaces/IVeHemiVoteDelegation.sol";

contract VeHemiVoteDelegationMock is IVeHemiVoteDelegation {
    mapping(uint256 => Delegation) private _delegations; // tokenId -> Delegation
    mapping(address => uint256) private _votes; // simplified votes store

    function delegate(uint256 delegator_, address delegatee_) external override {
        address from = _delegations[delegator_].delegatee;
        if (from != address(0)) {
            if (_votes[from] > 0) _votes[from] -= 1;
        }
        _delegations[delegator_].delegatee = delegatee_;
        _votes[delegatee_] += 1;
        emit DelegateChanged(delegator_, from, delegatee_);
        emit DelegateVotesChanged(delegatee_, 0, _votes[delegatee_]);
    }

    function delegation(uint256 tokenId_) external view override returns (Delegation memory) {
        return _delegations[tokenId_];
    }

    function getVotes(address account_) external view override returns (uint256) {
        return _votes[account_];
    }

    function getPastVotes(address account_, uint256 /*timestamp_*/ ) external view override returns (uint256) {
        return _votes[account_];
    }
}






