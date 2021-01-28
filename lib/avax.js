'use strict'

// npm libraries
const avalanche = require('avalanche')

// local libraries
const config = require('../config')

const avm = require('avalanche/dist/apis/avm')

/** @type {AvaxLib} */
let _this
class AvaxLib {
  constructor () {
    this.config = config
    this.avax = new avalanche.Avalanche(config.AVAX_IP, config.AVAX_PORT)
    this.xchain = this.avax.XChain()
    this.BN = avalanche.BN
    this.avm = avm

    _this = this
  }

  async mintTokens (num) {
    try {
      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      const tokensAmount = new _this.BN(num)
      const [address] = await _this.xchain.listAddresses(
        _this.config.AVAX_USER,
        _this.config.AVAX_PASSWORD
      )

      const txFee = await _this.xchain.getTxFee()

      const balanceInfo = await _this.xchain.getBalance(
        address,
        _this.config.AVAX_ASSET_ID
      )

      if (parseInt(balanceInfo.balance) < txFee.toNumber()) {
        throw new Error(
          "The address doesn't have enough AVAX to pay for transaction fee"
        )
      }

      const txid = await _this.xchain.mint(
        _this.config.AVAX_USER,
        _this.config.AVAX_PASSWORD,
        tokensAmount,
        _this.config.AVAX_TOKEN,
        address,
        [address]
      )

      console.log('Check transaction status on the block explorer:')
      console.log(`https://explorer.avax.network/tx/${txid}`)
      return txid
    } catch (err) {
      console.log('Error in avax.js/mintTokens()', err)
      throw err
    }
  }
}

module.exports = AvaxLib
