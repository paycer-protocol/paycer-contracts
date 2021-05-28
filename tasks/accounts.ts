import { task } from 'hardhat/config'
import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'
import { BN, bufferToHex, privateToAddress, toBuffer } from 'ethereumjs-util'
import '@nomiclabs/hardhat-waffle'

interface TaskArgs {
    net?: string
}

task('accounts', 'Prints the list of accounts', async (args: TaskArgs, hre) => {
    const networkConfig = hre.config.networks[args.net || 'hardhat']

    console.log(networkConfig.accounts)

    /** @ts-ignore */
    const accounts = normalizeHardhatNetworkAccountsConfig(networkConfig.accounts)
  
    console.log("Accounts")
    console.log("========")
  
    for (const [index, account] of accounts.entries()) {
      const address = bufferToHex(privateToAddress(toBuffer(account.privateKey)))
      const privateKey = bufferToHex(toBuffer(account.privateKey))
      const balance = new BN(account.balance).div(new BN(10).pow(new BN(18))).toString(10)
      console.log(`Account #${index}: ${address} (${balance} ETH)
  Private Key: ${privateKey}
  `)
    }
}).addParam('net', 'The network name')