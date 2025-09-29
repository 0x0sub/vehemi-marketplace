const { ethers, upgrades } = require('hardhat')
const fs = require('fs')

async function main() {
  console.log('🚀 Deploying VeHemiMarketplaceUpgradeable behind Transparent Proxy...')

  const [deployer] = await ethers.getSigners()
  console.log('Deployer:', deployer.address)
  console.log('Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH')

  const veHemiAddress = process.env.VEHEMI_ADDRESS || '0xF5a5b389Ac48A1a20d02A8b282eCa3c9A23Abb0a'
  const hemiAddress = process.env.HEMI_ADDRESS || '0x1Ee7476307e923319a12DDF127bcf8BdfAd345A0'
  const usdcAddress = process.env.USDC_ADDRESS || '0xD47971C7F5B1067d25cd45d30b2c9eb60de96443'

  console.log('veHemi:', veHemiAddress)
  console.log('HEMI:', hemiAddress)
  console.log('USDC:', usdcAddress)

  const Factory = await ethers.getContractFactory('VeHemiMarketplaceUpgradeable')
  const proxy = await upgrades.deployProxy(Factory, [veHemiAddress, hemiAddress, usdcAddress, deployer.address], {
    initializer: 'initialize',
    kind: 'transparent'
  })
  await proxy.waitForDeployment()
  const proxyAddress = await proxy.getAddress()
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress)

  console.log('✅ Proxy:', proxyAddress)
  console.log('🔧 Implementation:', implAddress)
  console.log('👤 ProxyAdmin:', adminAddress)

  const fee = await proxy.platformFeeBps()
  const feeRecipient = await proxy.feeRecipient()
  const veAddr = await proxy.veHemi()
  const hAddr = await proxy.hemi()
  const uAddr = await proxy.usdc()
  console.log('\n🔍 Config:')
  console.log('  platformFeeBps:', fee.toString())
  console.log('  feeRecipient:', feeRecipient)
  console.log('  veHemi:', veAddr)
  console.log('  hemi:', hAddr)
  console.log('  usdc:', uAddr)

  const out = {
    network: (await ethers.provider.getNetwork()).name || 'network',
    deployer: deployer.address,
    proxy: proxyAddress,
    implementation: implAddress,
    admin: adminAddress,
    initializerArgs: [veHemiAddress, hemiAddress, usdcAddress, deployer.address],
    deployedAt: new Date().toISOString()
  }
  if (!fs.existsSync('../deployments')) fs.mkdirSync('../deployments')
  const file = `../deployments/${out.network}-marketplace-proxy-${Date.now()}.json`
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.log('\n📄 Saved:', file)
}

main().catch((e) => { console.error('❌ Failed:', e); process.exit(1) })


