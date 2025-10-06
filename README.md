# VeHemi Marketplace

A P2P marketplace for trading veHemi NFTs with fixed price listings.

## Features

- **Fixed Price Trading**: List and buy veHemi NFTs at fixed prices
- **Filtering**: Filter by HEMI amount, lock duration, and unlock date
- **Real-time Data**: Live updates of NFT listings and token information

## Tech Stack

- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Wagmi + Viem** for Ethereum interaction
- **Solidity** smart contracts with OpenZeppelin

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/0x0sub/vehemi-marketplace
cd vehemi-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## Usage

### For Sellers
1. Connect your wallet
2. Select your veHemi NFT
3. Set your desired price in HEMI tokens
4. Choose listing duration and confirm

### For Buyers
1. Connect your wallet
2. Browse available listings
3. Use filters to find NFTs that match your criteria
4. Click "Buy Now" to purchase

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint

## Smart Contracts

The marketplace smart contract are deployed and verified on Hemi Network:
- **Marketplace Contract**: [View on Explorer]

The contract is upgradeable using the proxy pattern and have been thoroughly tested.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **Telegram**: https://t.me/vehemi
- **GitHub Issues**: https://github.com/0x0sub/vehemi-marketplace/issues

## Disclaimer

This marketplace is not affiliated with Hemi Labs. Use at your own risk. Always verify contract addresses and do your own research before trading.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 veHEMI Marketplace












