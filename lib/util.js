/*
  This util library is now used to store handy utility methods. This library
  is more of a sandbox for trying out ideas. The methods in this library should
  be considered prototypes and typically won't include tests.
*/

'use strict'

// npm libraries
const avalanche = require('avalanche')
const BCHJS = require('@psf/bch-js')

// local libraries
const config = require('../config')
const avm = require('avalanche/dist/apis/avm')

// Locally global variables.
/** @type {UtilLib} */
let _this
const bchjs = new BCHJS()

class UtilLib {
  constructor () {
    // Embed external libraries into the class, for easy mocking.
    this.bchjs = bchjs
    this.config = config
    this.avax = new avalanche.Avalanche(config.AVAX_IP, config.AVAX_PORT)
    this.xchain = this.avax.XChain()
    this.BN = avalanche.BN
    this.avm = avm
    this.binTools = avalanche.BinTools.getInstance()
    _this = this
  }

  async createToken () {
    try {
      const avaxID = await _this.xchain.getAVAXAssetID()

      // the data for the token to be created
      const name = 'Trout Test Token'
      const symbol = 'TTT'
      const denomination = 2
      const memo = _this.binTools.stringToBuffer('https://FullStack.cash')

      // store the address in the localKeychain
      console.log(`Private key: ${config.AVAX_PRIVATE_KEY}`)
      _this.xchain.keyChain().importKey(config.AVAX_PRIVATE_KEY)

      // addresses as buffer
      const addresses = _this.xchain.keyChain().getAddresses()
      // addresses as string
      const addressStrings = _this.xchain.keyChain().getAddressStrings()
      // Get this address utxos
      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)

      const balance = utxoSet.getBalance(addresses, avaxID)
      const fee = _this.xchain.getCreationTxFee()

      if (balance.lt(fee)) {
        throw new Error('Not enough founds to pay for transaction')
      }

      // the initial amount
      const amount = new _this.BN(50000)
      // In the transfer output the amount of the asset as well as the addresses to send must be set
      const capSecpOutput = new _this.avm.SECPTransferOutput(amount, addresses)
      const initialState = new _this.avm.InitialStates()
      initialState.addOutput(capSecpOutput)

      // The output with the addresses that will be able to mint more tokens
      const mintOutput = new _this.avm.SECPMintOutput(addresses)
      const outputs = [mintOutput]
      // Generate the unsigned transaction
      const unsignedTx = await _this.xchain.buildCreateAssetTx(
        utxoSet,
        addressStrings,
        addressStrings,
        initialState,
        name,
        symbol,
        denomination,
        outputs,
        memo
      )
      // sign the transaction with the local keyChain data
      const signed = unsignedTx.sign(_this.xchain.keyChain())
      // issue the transaction to generate new tokens
      const txid = await _this.xchain.issueTx(signed)

      console.log('Check transaction status on the block explorer:')
      console.log(`https://explorer.avax.network/tx/${txid}`)
    } catch (err) {
      console.log('Error in utils.js/createToken()', err)
      throw err
    }
  }

  async getBchData (addr) {
    try {
      // Validate Input
      if (typeof addr !== 'string') throw new Error('Address must be a string')

      const balance = await _this.bchjs.Electrumx.balance(addr)

      const utxos = await _this.bchjs.Electrumx.utxo(addr)

      const bchData = {
        balance: balance.balance,
        utxos: utxos.utxos
      }
      // console.log(`bchData: ${JSON.stringify(bchData, null, 2)}`)

      return bchData
    } catch (err) {
      // Optional log to indicate the source of the error. This would normally
      // be written with a logging app like Winston.
      console.log('Error in util.js/getBalance()')
      throw err
    }
  }
}

module.exports = UtilLib
