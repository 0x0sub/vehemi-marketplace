// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVeHemi} from "./interfaces/IVeHemi.sol";

/**
 * @title VeHemiMarketplace
 * @notice Simple P2P marketplace for veHemi NFTs with fixed price listings
 */
contract VeHemiMarketplace is Ownable, ReentrancyGuard {
    // --- State Variables ---
    IVeHemi public immutable veHemi;
    IERC20 public immutable hemi;
    IERC20 public immutable usdc;
    
    uint256 public constant MAX_LISTING_DURATION = 30 days;
    uint256 public constant MIN_LISTING_DURATION = 1 hours;
    
    // Platform fee (basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps = 500; // 5%
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
    
    // --- Mappings ---
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
    
    // --- Constructor ---
    constructor(
        address veHemi_,
        address hemi_,
        address usdc_,
        address owner_
    ) Ownable(owner_) {
        veHemi = IVeHemi(veHemi_);
        hemi = IERC20(hemi_);
        usdc = IERC20(usdc_);
        feeRecipient = owner_;
        
        // Initialize supported payment tokens
        supportedPaymentTokens[hemi_] = true;
        supportedPaymentTokens[usdc_] = true;
    }
    
    // --- View Functions ---
    
    /**
     * @notice Get all active listings
     * @return Array of token IDs that are currently listed
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }
    
    /**
     * @notice Get user's listings
     * @param user_ The user address
     * @return Array of token IDs listed by the user
     */
    function getUserListings(address user_) external view returns (uint256[] memory) {
        return userListings[user_];
    }
    
    /**
     * @notice Get listing details for a token
     * @param tokenId_ The token ID
     * @return Listing struct with all details
     */
    function getListing(uint256 tokenId_) external view returns (Listing memory) {
        return listings[tokenId_];
    }
    
    /**
     * @notice Check if a token is currently listed
     * @param tokenId_ The token ID
     * @return True if the token is listed and active
     */
    function isListed(uint256 tokenId_) external view returns (bool) {
        Listing memory listing = listings[tokenId_];
        return listing.isActive && block.timestamp <= listing.deadline;
    }
    
    /**
     * @notice Get the current veHemi balance and lock info for a token
     * @param tokenId_ The token ID
     * @return balance Current veHemi balance
     * @return lockedAmount Amount of HEMI locked
     * @return lockEndTime When the lock expires
     */
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
    
    /**
     * @notice List a veHemi NFT for sale
     * @param tokenId_ The token ID to list
     * @param price_ The price in payment tokens
     * @param paymentToken_ The payment token address (HEMI or USDC)
     * @param duration_ How long to keep the listing active (in seconds)
     */
    function listNFT(
        uint256 tokenId_,
        uint256 price_,
        address paymentToken_,
        uint256 duration_
    ) external nonReentrant {
        // Validate inputs
        if (price_ == 0) revert InvalidPrice();
        if (duration_ < MIN_LISTING_DURATION || duration_ > MAX_LISTING_DURATION) {
            revert InvalidDeadline();
        }
        if (!supportedPaymentTokens[paymentToken_]) revert UnsupportedPaymentToken();
        
        // Check ownership and existing listing
        if (veHemi.ownerOf(tokenId_) != msg.sender) revert NotOwner();
        // If there is an existing active listing, clean it up if either expired or ownership changed
        if (listings[tokenId_].isActive) {
            if (block.timestamp > listings[tokenId_].deadline) {
                listings[tokenId_].isActive = false;
                _removeFromActiveListings(tokenId_);
                emit ListingExpired(tokenId_);
            } else if (listings[tokenId_].seller != msg.sender) {
                // Ownership changed from the original seller; invalidate stale listing
                address oldSeller = listings[tokenId_].seller;
                listings[tokenId_].isActive = false;
                _removeFromActiveListings(tokenId_);
                emit ListingCancelled(tokenId_, oldSeller);
            } else {
                revert AlreadyListed();
            }
        }
        
        uint256 deadline = block.timestamp + duration_;
        
        // Create listing
        listings[tokenId_] = Listing({
            tokenId: tokenId_,
            seller: msg.sender,
            price: price_,
            paymentToken: paymentToken_,
            deadline: deadline,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Update arrays
        userListings[msg.sender].push(tokenId_);
        activeListings.push(tokenId_);
        
        emit NFTListed(tokenId_, msg.sender, price_, paymentToken_, deadline);
    }
    
    /**
     * @notice Buy a listed veHemi NFT
     * @param tokenId_ The token ID to buy
     */
    function buyNFT(uint256 tokenId_) external nonReentrant {
        Listing storage listing = listings[tokenId_];
        
        // Validate listing
        if (!listing.isActive) revert ListingNotActive();
        if (block.timestamp > listing.deadline) revert ListingExpiredError();
        // Ensure current owner still matches the original lister; otherwise invalidate and revert
        if (veHemi.ownerOf(tokenId_) != listing.seller) {
            address originalSeller = listing.seller;
            listing.isActive = false;
            _removeFromActiveListings(tokenId_);
            emit ListingCancelled(tokenId_, originalSeller);
            revert ListingNotActive();
        }
        
        // Calculate fees
        uint256 platformFee = (listing.price * platformFeeBps) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Get the payment token contract
        IERC20 paymentToken = IERC20(listing.paymentToken);
        
        // Transfer payment
        if (paymentToken.balanceOf(msg.sender) < listing.price) revert InsufficientPayment();
        
        // Transfer payment token from buyer to contract
        if (!paymentToken.transferFrom(msg.sender, address(this), listing.price)) {
            revert TransferFailed();
        }
        
        // Transfer payment token to seller (minus platform fee)
        if (!paymentToken.transfer(listing.seller, sellerAmount)) {
            revert TransferFailed();
        }
        
        // Transfer platform fee to fee recipient
        if (platformFee > 0 && !paymentToken.transfer(feeRecipient, platformFee)) {
            revert TransferFailed();
        }
        
        // Transfer NFT from seller to buyer
        veHemi.transferFrom(listing.seller, msg.sender, tokenId_);
        
        // Update listing
        listing.isActive = false;
        
        // Remove from active listings
        _removeFromActiveListings(tokenId_);
        
        emit NFTSold(tokenId_, listing.seller, msg.sender, listing.price, listing.paymentToken, platformFee);
    }
    
    /**
     * @notice Cancel a listing
     * @param tokenId_ The token ID to cancel
     */
    function cancelListing(uint256 tokenId_) external nonReentrant {
        Listing storage listing = listings[tokenId_];
        
        if (!listing.isActive) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotOwner();
        
        listing.isActive = false;
        _removeFromActiveListings(tokenId_);
        
        emit ListingCancelled(tokenId_, msg.sender);
    }
    
    // --- Admin Functions ---
    
    /**
     * @notice Update platform fee
     * @param newFeeBps_ New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 newFeeBps_) external onlyOwner {
        if (newFeeBps_ > 1000) revert(); // Max 10%
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps_;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps_);
    }
    
    /**
     * @notice Update fee recipient
     * @param newRecipient_ New fee recipient address
     */
    function updateFeeRecipient(address newRecipient_) external onlyOwner {
        if (newRecipient_ == address(0)) revert();
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient_;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient_);
    }
    
    /**
     * @notice Add a new supported payment token
     * @param token_ The token address to add
     */
    function addPaymentToken(address token_) external onlyOwner {
        if (token_ == address(0)) revert();
        supportedPaymentTokens[token_] = true;
        emit PaymentTokenAdded(token_);
    }
    
    /**
     * @notice Remove a supported payment token
     * @param token_ The token address to remove
     */
    function removePaymentToken(address token_) external onlyOwner {
        supportedPaymentTokens[token_] = false;
        emit PaymentTokenRemoved(token_);
    }
    
    /**
     * @notice Clean up expired listings (can be called by anyone)
     * @param tokenIds_ Array of token IDs to check and clean up
     */
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
    
    // --- Internal Functions ---
    
    /**
     * @notice Remove a token from active listings array
     * @param tokenId_ The token ID to remove
     */
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
