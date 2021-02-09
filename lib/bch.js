'use strict'

// npm libraries
const BCHJS = require('@psf/bch-js')
const BchUtil = require('bch-util')

// local libraries
const config = require('../config')

/** @type {BCHLib} */
let _this
class BCHLib {
  constructor () {
    this.config = config
    this.bchjs = new BCHJS({ restURL: this.config.networkURL })
    this.bchUtil = new BchUtil({ bchjs: this.bchjs })

    _this = this
  }

  // Mint new SLP tokens.
  async mintSlp (num) {
    try {
      // Verify that the required environment variables are set.
      _this.checkConfig()

      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      const keyPair = _this.bchjs.ECPair.fromWIF(_this.config.WIF)
      const cashAddress = _this.bchjs.ECPair.toCashAddress(keyPair)

      // Get the UTXOs associated with the cash address.
      const data = await _this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = data.utxos

      const legacyAddress = _this.bchjs.ECPair.toLegacyAddress(keyPair)

      if (!utxos.length) {
        throw new Error('No UTXOs available :(\nExiting.')
      }
      let tokenUtxos = await _this.bchjs.SLP.Utils.tokenUtxoDetails(utxos)

      const bchUtxos = utxos.filter(
        (utxo, index) => !tokenUtxos[index].isValid && !utxo.tokenID
      )

      if (!bchUtxos.length) {
        throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
      }

      tokenUtxos = tokenUtxos.filter(
        utxo =>
          utxo && // UTXO is associated with a token.
          utxo.tokenId === _this.config.tokenID && // UTXO matches the token ID.
          utxo.utxoType === 'minting-baton' // UTXO is not a minting baton.
      )

      if (!tokenUtxos.length) {
        throw new Error(
          'No token UTXOs for the specified token could be found.'
        )
      }

      const bchUtxo = this.bchUtil.util.findBiggestUtxo(bchUtxos)

      const originalAmount = bchUtxo.value
      const slpData = _this.bchjs.SLP.TokenType1.generateMintOpReturn(
        tokenUtxos,
        num
      )

      const transactionBuilder = new _this.bchjs.TransactionBuilder(
        _this.config.network
      )
      transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)

      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
      }

      const txFee = 250
      const remainder = originalAmount - txFee - 546 * 2
      if (remainder < 1) {
        throw new Error('Selected UTXO does not have enough satoshis')
      }

      // Send the token back to the wallet
      transactionBuilder.addOutput(slpData, 0)
      transactionBuilder.addOutput(legacyAddress, 546)

      // Send dust transaction representing new minting baton.
      transactionBuilder.addOutput(legacyAddress, 546)

      // Last output: send the BCH change back to the wallet.
      transactionBuilder.addOutput(legacyAddress, remainder)

      // Sign the transaction with the private key for the BCH UTXO paying the fees.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]

        transactionBuilder.sign(
          1 + i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          thisUtxo.value
        )
      }
      const tx = transactionBuilder.build()
      const hex = tx.toHex()
      const txid = await _this.bchjs.RawTransactions.sendRawTransaction(hex)

      console.log('Check transaction status on the block explorer:')
      const attribute = _this.config.network === 'testnet' ? 'tbch' : 'bch'
      console.log(`https://explorer.bitcoin.com/${attribute}/tx/${txid}`)

      return txid
    } catch (err) {
      console.log('Error in bch.js/minSlp()', err)
      throw err
    }
  }

  // Burn SLP tokens and take them out of circulation.
  async burnSlp (num) {
    try {
      // Verify that the required environment variables are set.
      _this.checkConfig()

      // Validate inputs
      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      // Generate a key pair from the WIF.
      const keyPair = _this.bchjs.ECPair.fromWIF(_this.config.WIF)
      const cashAddress = _this.bchjs.ECPair.toCashAddress(keyPair)
      const legacyAddress = _this.bchjs.ECPair.toLegacyAddress(keyPair)

      // Get UTXO information associated with the address.
      const data = await _this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = data.utxos

      if (!utxos.length) {
        throw new Error('No UTXOs to spend! Exiting.')
      }

      // Hydrate the UTXOs with SLP token information.
      let tokenUtxos = await _this.bchjs.SLP.Utils.tokenUtxoDetails(utxos)

      const bchUtxos = utxos.filter(
        (utxo, index) => !tokenUtxos[index].isValid && !utxo.tokenID
      )

      if (!bchUtxos.length) {
        throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
      }

      // Filter out any tokens that do not match the token ID in the the config
      // file.
      let tokenQty = 0
      tokenUtxos = tokenUtxos.reduce((tokens, utxo) => {
        if (
          !utxo || // UTXO is associated with a token.
          utxo.tokenId !== _this.config.tokenID || // UTXO matches the token ID.
          utxo.utxoType !== 'token' // UTXO is not a minting baton.)
        ) {
          return tokens
        }
        tokenQty += parseFloat(utxo.tokenQty)
        return [...tokens, { ...utxo, tokenQty: parseFloat(utxo.tokenQty) }]
      }, [])

      // Exit if there are not tokens matching the token ID in the config.
      if (!tokenUtxos.length) {
        throw new Error(
          'No token UTXOs for the specified token could be found.'
        )
      }

      // Corner case: if the number to burn is higher than the available amount,
      // burn the available amount.
      // TODO: Should this throw an error instead?
      if (tokenQty < num) {
        num = tokenQty
      }

      // Find the biggest UTXO, to pay for transaction fees.
      const bchUtxo = this.bchUtil.util.findBiggestUtxo(bchUtxos)

      const originalAmount = bchUtxo.value

      const slpData = _this.bchjs.SLP.TokenType1.generateBurnOpReturn(
        tokenUtxos,
        num
      )

      // BEGIN transaction construction.
      const transactionBuilder = new _this.bchjs.TransactionBuilder(
        _this.config.network
      )

      // Add BCH input to pay for transaction fees.
      transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)

      // Add all the token UTXOs as inputs.
      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
      }

      const txFee = 250
      const remainder = originalAmount - txFee - 546
      if (remainder < 1) {
        throw new Error('Selected UTXO does not have enough satoshis')
      }

      // Add outputs to the transaction.
      transactionBuilder.addOutput(slpData, 0)
      transactionBuilder.addOutput(legacyAddress, 546)
      transactionBuilder.addOutput(legacyAddress, remainder)

      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]

        transactionBuilder.sign(
          1 + i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          thisUtxo.value
        )
      }

      const tx = transactionBuilder.build()
      const hex = tx.toHex()

      const txid = await _this.bchjs.RawTransactions.sendRawTransaction(hex)

      console.log('Check transaction status on the block explorer:')
      const attribute = _this.config.network === 'testnet' ? 'tbch' : 'bch'
      console.log(`https://explorer.bitcoin.com/${attribute}/tx/${txid}`)

      return txid
    } catch (err) {
      console.log('Error in bch.js/burnSlp()', err)
      throw err
    }
  }

  // Throw an error if any of the required config setting are missing.
  checkConfig () {
    try {
      const requiredEnvs = ['networkURL', 'network', 'WIF', 'tokenID']
      const missingEnvs = requiredEnvs.filter(
        item =>
          typeof _this.config[item] === 'undefined' ||
          _this.config[item] === null
      )
      if (missingEnvs.length) {
        const message = missingEnvs.join(', ')
        throw new Error(`Missing environment variables (${message})`)
      }
    } catch (err) {
      console.log('Error in bch.js/checkConfig()', err)
      throw err
    }
  }
}

module.exports = BCHLib
