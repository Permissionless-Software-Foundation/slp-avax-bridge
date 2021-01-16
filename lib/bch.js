'use strict'

// npm libraries
const BCHJS = require('@psf/bch-js')
const config = require('../config')

const bchjs = new BCHJS({ restURL: config.networkURL })

/** @type {BCHLib} */
let _this
class BCHLib {
  constructor () {
    this.bchjs = bchjs
    _this = this
  }

  async mintSlp (num) {
    try {
      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      const keyPair = _this.bchjs.ECPair.fromWIF(config.WIF)
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
          utxo.tokenId === config.tokenID && // UTXO matches the token ID.
          utxo.utxoType === 'minting-baton' // UTXO is not a minting baton.
      )

      if (!tokenUtxos.length) {
        throw new Error(
          'No token UTXOs for the specified token could be found.'
        )
      }

      const bchUtxo = _this.findBiggestUtxo(bchUtxos)
      const originalAmount = bchUtxo.value
      const slpData = _this.bchjs.SLP.TokenType1.generateMintOpReturn(
        tokenUtxos,
        num
      )

      const transactionBuilder = new _this.bchjs.TransactionBuilder(
        config.network
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
      const attribute = config.network === 'testnet' ? 'tbch' : 'bch'
      console.log(`https://explorer.bitcoin.com/${attribute}/tx/${txid}`)

      return txid
    } catch (err) {
      console.log('Error in bch.js/minSlp()', err)
      throw err
    }
  }

  async burnSlp (num) {
    try {
      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      const keyPair = _this.bchjs.ECPair.fromWIF(config.WIF)
      const cashAddress = _this.bchjs.ECPair.toCashAddress(keyPair)
      const legacyAddress = _this.bchjs.ECPair.toLegacyAddress(keyPair)

      const data = await _this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = data.utxos

      if (!utxos.length) {
        throw new Error('No UTXOs to spend! Exiting.')
      }

      let tokenUtxos = await _this.bchjs.SLP.Utils.tokenUtxoDetails(utxos)

      const bchUtxos = utxos.filter(
        (utxo, index) => !tokenUtxos[index].isValid && !utxo.tokenID
      )

      if (!bchUtxos.length) {
        throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
      }

      let tokenQty = 0
      tokenUtxos = tokenUtxos.reduce((tokens, utxo) => {
        if (
          !utxo || // UTXO is associated with a token.
          utxo.tokenId !== config.tokenID || // UTXO matches the token ID.
          utxo.utxoType !== 'token' // UTXO is not a minting baton.)
        ) {
          return tokens
        }
        tokenQty += parseFloat(utxo.tokenQty)
        return [...tokens, { ...utxo, tokenQty: parseFloat(utxo.tokenQty) }]
      }, [])
      if (!tokenUtxos.length) {
        throw new Error(
          'No token UTXOs for the specified token could be found.'
        )
      }

      if (tokenQty < num) {
        num = tokenQty
      }

      const bchUtxo = _this.findBiggestUtxo(bchUtxos)
      const originalAmount = bchUtxo.value

      const slpData = _this.bchjs.SLP.TokenType1.generateBurnOpReturn(
        tokenUtxos,
        num
      )

      // BEGIN transaction construction.
      const transactionBuilder = new _this.bchjs.TransactionBuilder(
        config.network
      )

      transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)
      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
      }

      const txFee = 250
      const remainder = originalAmount - txFee - 546
      if (remainder < 1) {
        throw new Error('Selected UTXO does not have enough satoshis')
      }
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
      const attribute = config.network === 'testnet' ? 'tbch' : 'bch'
      console.log(`https://explorer.bitcoin.com/${attribute}/tx/${txid}`)

      return txid
    } catch (err) {
      console.log('Error in bch.js/burnSlp()', err)
      throw err
    }
  }

  findBiggestUtxo (utxos) {
    let biggestUtxo = { value: 0 }

    for (const thisUtxo of utxos) {
      if (thisUtxo.value > biggestUtxo.value) {
        biggestUtxo = thisUtxo
      }
    }

    return biggestUtxo
  }
}

module.exports = BCHLib
