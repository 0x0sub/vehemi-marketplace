import { Address } from 'viem'

// Contract addresses loaded from environment variables
export const CONTRACTS = {
  // Current network addresses (from env)
  VEHEMI: (process.env.NEXT_PUBLIC_VEHEMI_CONTRACT || '0x6C26476010eF735b70C75460f75855b9Ed1142BF') as Address,
  HEMI: (process.env.NEXT_PUBLIC_HEMI_CONTRACT || '0x1Ee7476307e923319a12DDF127bcf8BdfAd345A0') as Address,
  USDC: (
    process.env.NEXT_PUBLIC_USDC_CONTRACT ||
    process.env.USDC_ADDRESS ||
    '0xD47971C7F5B1067d25cd45d30b2c9eb60de96443'
  ) as Address,
  MARKETPLACE: (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '0xcD50d0bDD9AEba8d1218AD5cf909946CecdFe095') as Address,
} as const

// Contract ABIs
export const VEHEMI_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'balanceOfNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getLockedBalance',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'int128' },
          { name: 'end', type: 'uint64' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Enumerable & helper functions
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Import the full marketplace ABI
import VeHemiMarketplaceABI from '../VeHemiMarketplace.abi.json'

export const MARKETPLACE_ABI = VeHemiMarketplaceABI

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ERC721_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
