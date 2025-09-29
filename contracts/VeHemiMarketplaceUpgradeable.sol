// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IVeHemi} from "./interfaces/IVeHemi.sol";

/**
 * @title VeHemiMarketplaceUpgradeable
 * @notice Transparent proxy-compatible marketplace for veHemi NFTs
 */
contract VeHemiMarketplaceUpgradeable is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    // --- State Variables ---
    IVeHemi public veHemi;
    IERC20 public hemi;
    IERC20 public usdc;

    uint256 public constant MAX_LISTING_DURATION = 30 days;
    uint256 public constant MIN_LISTING_DURATION = 1 hours;

    // Platform fee (basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps; // default set in initialize
    address public feeRecipient;

    // Supported payment tokens
    mapping(address => bool) public supportedPaymentTokens;

    // --- Structs ---
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;           // Price in payment tokens
        address paymentToken;    // Address of the payment token (HEMI or USDC)
        uint256 deadline;        // Listing expiration timestamp
        bool isActive;
        uint256 createdAt;
    }

    // --- Storage ---
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    uint256[] public activeListings;

    // --- Events ---
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        address indexed paymentToken,
        uint256 deadline
    );

    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        address paymentToken,
        uint256 platformFee
    );

    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event ListingExpired(uint256 indexed tokenId);

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event PaymentTokenAdded(address indexed token);
    event PaymentTokenRemoved(address indexed token);

    // --- Errors ---
    error NotOwner();
    error ListingNotFound();
    error ListingExpiredError();
    error ListingNotActive();
    error InvalidPrice();
    error InvalidDeadline();
    error InsufficientPayment();
    error TransferFailed();
    error NotListed();
    error AlreadyListed();
    error UnsupportedPaymentToken();

    // --- Initializer ---
    function initialize(
        address veHemi_,
        address hemi_,
        address usdc_,
        address owner_
    ) external initializer {
        __Ownable_init(owner_);
        __ReentrancyGuard_init();

        veHemi = IVeHemi(veHemi_);
        hemi = IERC20(hemi_);
        usdc = IERC20(usdc_);
        feeRecipient = owner_;
        platformFeeBps = 500; // 5%

        supportedPaymentTokens[hemi_] = true;
        supportedPaymentTokens[usdc_] = true;
    }

    // --- View Functions ---
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }

    function getUserListings(address user_) external view returns (uint256[] memory) {
        return userListings[user_];
    }

    function getListing(uint256 tokenId_) external view returns (Listing memory) {
        return listings[tokenId_];
    }

    function isListed(uint256 tokenId_) external view returns (bool) {
        Listing memory listing = listings[tokenId_];
        return listing.isActive && block.timestamp <= listing.deadline;
    }

    function getTokenInfo(uint256 tokenId_) external view returns (
        uint256 balance,
        uint256 lockedAmount,
        uint256 lockEndTime
    ) {
        balance = veHemi.balanceOfNFT(tokenId_);
        IVeHemi.LockedBalance memory locked = veHemi.getLockedBalance(tokenId_);
        lockedAmount = uint256(uint128(locked.amount));
        lockEndTime = locked.end;
    }

    // --- User Functions ---
    function listNFT(
        uint256 tokenId_,
        uint256 price_,
        address paymentToken_,
        uint256 duration_
    ) external nonReentrant {
        if (price_ == 0) revert InvalidPrice();
        if (duration_ < MIN_LISTING_DURATION || duration_ > MAX_LISTING_DURATION) {
            revert InvalidDeadline();
        }
        if (!supportedPaymentTokens[paymentToken_]) revert UnsupportedPaymentToken();
        if (IERC721(address(veHemi)).ownerOf(tokenId_) != msg.sender) revert NotOwner();

        if (listings[tokenId_].isActive) {
            if (block.timestamp > listings[tokenId_].deadline) {
                listings[tokenId_].isActive = false;
                _removeFromActiveListings(tokenId_);
                emit ListingExpired(tokenId_);
            } else if (listings[tokenId_].seller != msg.sender) {
                address oldSeller = listings[tokenId_].seller;
                listings[tokenId_].isActive = false;
                _removeFromActiveListings(tokenId_);
                emit ListingCancelled(tokenId_, oldSeller);
            } else {
                revert AlreadyListed();
            }
        }

        uint256 deadline = block.timestamp + duration_;

        listings[tokenId_] = Listing({
            tokenId: tokenId_,
            seller: msg.sender,
            price: price_,
            paymentToken: paymentToken_,
            deadline: deadline,
            isActive: true,
            createdAt: block.timestamp
        });

        userListings[msg.sender].push(tokenId_);
        activeListings.push(tokenId_);

        emit NFTListed(tokenId_, msg.sender, price_, paymentToken_, deadline);
    }

    function buyNFT(uint256 tokenId_) external nonReentrant {
        Listing storage listing = listings[tokenId_];
        if (!listing.isActive) revert ListingNotActive();
        if (block.timestamp > listing.deadline) revert ListingExpiredError();
        if (IERC721(address(veHemi)).ownerOf(tokenId_) != listing.seller) {
            address originalSeller = listing.seller;
            listing.isActive = false;
            _removeFromActiveListings(tokenId_);
            emit ListingCancelled(tokenId_, originalSeller);
            revert ListingNotActive();
        }

        uint256 platformFee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.price - platformFee;

        IERC20 paymentToken = IERC20(listing.paymentToken);
        if (paymentToken.balanceOf(msg.sender) < listing.price) revert InsufficientPayment();
        if (!paymentToken.transferFrom(msg.sender, address(this), listing.price)) revert TransferFailed();
        if (!paymentToken.transfer(listing.seller, sellerAmount)) revert TransferFailed();
        if (platformFee > 0 && !paymentToken.transfer(feeRecipient, platformFee)) revert TransferFailed();

        IERC721(address(veHemi)).transferFrom(listing.seller, msg.sender, tokenId_);

        listing.isActive = false;
        _removeFromActiveListings(tokenId_);

        emit NFTSold(tokenId_, listing.seller, msg.sender, listing.price, listing.paymentToken, platformFee);
    }

    function cancelListing(uint256 tokenId_) external nonReentrant {
        Listing storage listing = listings[tokenId_];
        if (!listing.isActive) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotOwner();
        listing.isActive = false;
        _removeFromActiveListings(tokenId_);
        emit ListingCancelled(tokenId_, msg.sender);
    }

    // --- Admin Functions ---
    function updatePlatformFee(uint256 newFeeBps_) external onlyOwner {
        if (newFeeBps_ > 1000) revert();
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps_;
        emit PlatformFeeUpdated(oldFee, newFeeBps_);
    }

    function updateFeeRecipient(address newRecipient_) external onlyOwner {
        if (newRecipient_ == address(0)) revert();
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient_;
        emit FeeRecipientUpdated(oldRecipient, newRecipient_);
    }

    function addPaymentToken(address token_) external onlyOwner {
        if (token_ == address(0)) revert();
        supportedPaymentTokens[token_] = true;
        emit PaymentTokenAdded(token_);
    }

    function removePaymentToken(address token_) external onlyOwner {
        supportedPaymentTokens[token_] = false;
        emit PaymentTokenRemoved(token_);
    }

    // --- Public Maintenance ---
    function cleanupExpiredListings(uint256[] calldata tokenIds_) external {
        for (uint256 i = 0; i < tokenIds_.length; i++) {
            uint256 tokenId = tokenIds_[i];
            Listing storage listing = listings[tokenId];
            if (listing.isActive && block.timestamp > listing.deadline) {
                listing.isActive = false;
                _removeFromActiveListings(tokenId);
                emit ListingExpired(tokenId);
            }
        }
    }

    // --- Internal ---
    function _removeFromActiveListings(uint256 tokenId_) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId_) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }
}


