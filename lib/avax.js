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
    this.Buffer = avalanche.Buffer
    this.binTools = avalanche.BinTools.getInstance()
    _this = this
  }

  // Mint new tokens on the AVAX chain.
  async mintToken (num) {
    try {
      _this.checkConfig()

      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      // get the AVAX ASSET ID as a buffer
      const avaxIDBuffer = await _this.xchain.getAVAXAssetID()

      // store the address in the localKeychain
      _this.xchain.keyChain().importKey(_this.config.AVAX_PRIVATE_KEY)

      // encode the memo
      const memo = _this.binTools.stringToBuffer('Script to mint ANT')

      // addresses as buffer
      const addresses = _this.xchain.keyChain().getAddresses()
      // addresses as string
      const addressStrings = _this.xchain.keyChain().getAddressStrings()

      if (!addressStrings.length || !addresses.length) {
        throw new Error('No available addresses registered in the keyChain')
      }

      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)

      const utxos = utxoSet.getAllUTXOs ? utxoSet.getAllUTXOs() : []

      if (!utxos.length) {
        throw new Error('There are no UTXOs in the address')
      }

      const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
      const fee = _this.xchain.getCreationTxFee()

      if (balance.lt(fee)) {
        throw new Error('Not enough founds to pay for transaction')
      }

      // Find a utxo with the given assetID for refence
      const tokenUTXO = utxos.find(
        item =>
          item.getOutput().getTypeID() === 6 &&
          _this.binTools.cb58Encode(item.getAssetID()) ===
            _this.config.AVAX_TOKEN
      )

      if (!tokenUTXO) {
        throw new Error('There are no UTXOs with the given assetID')
      }

      const tokenTxID = tokenUTXO.getTxID()
      const assetID = tokenUTXO.getAssetID()
      // get the utxoID with the minting reference for the output
      const secpMintOutputUTXOIDs = _this.getUTXOIDs(
        utxoSet,
        _this.binTools.cb58Encode(tokenTxID),
        _this.avm.AVMConstants.SECPMINTOUTPUTID,
        _this.binTools.cb58Encode(assetID)
      )

      const mintUTXOID = secpMintOutputUTXOIDs[0]
      const mintUTXO = utxoSet.getUTXO(secpMintOutputUTXOIDs[0])
      const mintOwner = mintUTXO.getOutput()

      // amount to be minted
      const amount = new _this.BN(num)
      const transferOutput = new _this.avm.SECPTransferOutput(amount, addresses)
      // generate the unsigned transaction
      const unsignedTx = await _this.xchain.buildSECPMintTx(
        utxoSet,
        mintOwner,
        transferOutput,
        addressStrings,
        addressStrings,
        mintUTXOID,
        memo
      )
      // sign the transcation with the private keys stored in the keychain
      const signedTx = unsignedTx.sign(_this.xchain.keyChain())
      const txid = await _this.xchain.issueTx(signedTx)

      console.log('Check transaction status on the block explorer:')
      console.log(`https://explorer.avax.network/tx/${txid}`)
      return txid
    } catch (err) {
      console.log('Error in avax.js/mintToken()', err)
      throw err
    }
  }

  checkConfig () {
    try {
      // Throw an error if any of the required environment variables are missing.
      const requiredEnvs = [
        'AVAX_IP',
        'AVAX_PORT',
        'AVAX_PRIVATE_KEY',
        'AVAX_TOKEN'
      ]
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
      console.log('Error in avax.js/checkConfig()', err)
      throw err
    }
  }

  getUTXOIDs (utxoSet, txid, outputType, assetID) {
    const utxoids = utxoSet.getUTXOIDs()
    return utxoids.reduce((result, id) => {
      if (
        id.includes(txid.slice(0, 10)) &&
        utxoSet
          .getUTXO(id)
          .getOutput()
          .getOutputID() === outputType &&
        assetID === _this.binTools.cb58Encode(utxoSet.getUTXO(id).getAssetID())
      ) {
        return [...result, id]
      }
      return result
    }, [])
  }
}

module.exports = AvaxLib
