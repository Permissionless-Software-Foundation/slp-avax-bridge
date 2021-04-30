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
    this.avax = new avalanche.Avalanche(config.AVAX_IP, parseInt(config.AVAX_PORT))
    this.xchain = this.avax.XChain()
    this.BN = avalanche.BN
    this.avm = avm
    this.Buffer = avalanche.Buffer
    this.binTools = avalanche.BinTools.getInstance()
    _this = this
  }

  /**
   * @api bchAvaxBridge.avax.mintToken() mintToken()
   * @apiName mintToken
   * @apiGroup Avax
   * @apiDescription Mint a given amount of tokens on the Avalanche X Chain.
   *
   * This method expects several environment variables to be set before running.
   * It will throw an error if these environment variables are not set.
   *
   * @apiExample Example usage:
   *
   * (async () => {
   * try {
   *  const num = 10
   *  const txid = await bchAvaxBridge.avax.mintToken(num)
   *  console.log(`txid: ${txid}`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   *
   * // returns
   * txid: 2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h
   */
  async mintToken (num, receiverAddress) {
    try {
      // Verify that the required environment variables are set.
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

      // receiver avax address
      const receiver = _this.getValidAddress(receiverAddress, addresses[0])
      const receiverBuffers = [receiver]

      if (!addressStrings.length || !addresses.length) {
        throw new Error('No available addresses registered in the keyChain')
      }

      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)

      const utxos = utxoSet.getAllUTXOs()

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
        (item) =>
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
      const transferOutput = new _this.avm.SECPTransferOutput(amount, receiverBuffers)
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

  /**
   * @api bchAvaxBridge.avax.burnToken() burnToken()
   * @apiName burnToken
   * @apiGroup Avax
   * @apiDescription Burn a given amount of tokens on the Avalanche X Chain.
   *
   * This method expects several environment variables to be set before running.
   * It will throw an error if these environment variables are not set.
   *
   * @apiExample Example usage:
   *
   * (async () => {
   * try {
   *  const num = 14
   *  const txid = await bchAvaxBridge.avax.burnToken(num)
   *  console.log(`txid: ${txid}`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   *
   * // returns
   * txid: KQvMqkhd2EXarx7rPdHuEtBb8xeyvph9fUoeGr4sT4YuFFAuj
   */
  async burnToken (num) {
    try {
      _this.checkConfig()

      if (isNaN(parseFloat(num)) || num <= 0) {
        throw new Error('Token quantity must be a number higher than 0')
      }

      const avaxIDBuffer = await _this.xchain.getAVAXAssetID()
      const tokenIDBuffer = _this.binTools.cb58Decode(_this.config.AVAX_TOKEN)

      _this.xchain.keyChain().importKey(_this.config.AVAX_PRIVATE_KEY)

      const memo = _this.binTools.stringToBuffer(`Burning ${num} tokens`)

      const addresses = _this.xchain.keyChain().getAddresses()
      const addressStrings = _this.xchain.keyChain().getAddressStrings()

      if (!addressStrings.length || !addresses.length) {
        throw new Error('No available addresses registered in the keyChain')
      }

      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)
      const utxos = utxoSet.getAllUTXOs()

      if (!utxos.length) {
        throw new Error('There are no UTXOs in the address')
      }

      const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
      const fee = _this.xchain.getDefaultTxFee()

      if (balance.lt(fee)) {
        throw new Error('Not enough founds to pay for transaction')
      }

      const amountToBurn = new _this.BN(num)
      let tokenBalance = utxoSet.getBalance(addresses, tokenIDBuffer)

      if (tokenBalance.isZero()) {
        throw new Error('Token quantity is zero already')
      }

      tokenBalance.isub(amountToBurn)
      if (tokenBalance.isNeg()) {
        tokenBalance = new _this.BN(0)
      }

      // get the inputs for the transcation
      const inputs = utxos.reduce((txInputs, utxo) => {
        // typeID 6 is a minting baton utxo, it gets skipped
        if (utxo.getOutput().getTypeID() !== 7) {
          return txInputs
        }

        const amountOutput = utxo.getOutput()
        const amt = amountOutput.getAmount().clone()
        const txid = utxo.getTxID()
        const outputidx = utxo.getOutputIdx()
        const assetID = utxo.getAssetID()

        // get all the AVAX utxos as input
        if (assetID.toString('hex') === avaxIDBuffer.toString('hex')) {
          const transferInput = new _this.avm.SECPTransferInput(amt)
          transferInput.addSignatureIdx(0, addresses[0])
          const input = new _this.avm.TransferableInput(
            txid,
            outputidx,
            avaxIDBuffer,
            transferInput
          )
          txInputs.push(input)
        }

        // get all the TOKEN utxos as input too
        if (assetID.toString('hex') === tokenIDBuffer.toString('hex')) {
          const transferInput = new _this.avm.SECPTransferInput(amt)
          transferInput.addSignatureIdx(0, addresses[0])
          const input = new _this.avm.TransferableInput(
            txid,
            outputidx,
            assetID,
            transferInput
          )
          txInputs.push(input)
        }

        return txInputs
      }, [])

      // get the desired outputs for the transaction
      const outputs = []
      const avaxTransferOutput = new _this.avm.SECPTransferOutput(
        balance.sub(fee),
        addresses
      )
      const avaxTransferableOutput = new _this.avm.TransferableOutput(
        avaxIDBuffer,
        avaxTransferOutput
      )
      // Add the AVAX output
      outputs.push(avaxTransferableOutput)

      const tokenTransferOutput = new _this.avm.SECPTransferOutput(
        tokenBalance,
        addresses
      )
      const tokenTransferableOutput = new _this.avm.TransferableOutput(
        tokenIDBuffer,
        tokenTransferOutput
      )
      // Add the Token output
      outputs.push(tokenTransferableOutput)

      // Build the transcation
      const baseTx = new _this.avm.BaseTx(
        _this.avax.getNetworkID(),
        _this.binTools.cb58Decode(_this.xchain.getBlockchainID()),
        outputs,
        inputs,
        memo
      )
      const unsignedTx = new _this.avm.UnsignedTx(baseTx)

      const tx = unsignedTx.sign(_this.xchain.keyChain())
      const txid = await _this.xchain.issueTx(tx)

      console.log('Check transaction status on the block explorer:')
      console.log(`https://explorer.avax.network/tx/${txid}`)
      return txid
    } catch (err) {
      console.log('Error in avax.js/burnToken()', err)
      throw err
    }
  }

  /**
   * @api bchAvaxBridge.avax.writeMemo() writeMemo()
   * @apiName writeMemo
   * @apiGroup Avax
   * @apiDescription Creates a new transaction in the Avalanche X Chain with a custom message in the memo field
   *
   * This method expects several environment variables to be set before running.
   * It will throw an error if these environment variables are not set.
   *
   * @apiExample Example usage:
   *
   * (async () => {
   * try {
   *  const message = 'This is the memo field'
   *  const privateKey = 'PrivateKey'
   *  const address = 'X-avax1'
   *  const txid = await bchAvaxBridge.avax.writeMemo(message, privateKey, address)
   *  console.log(`txid: ${txid}`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   *
   * // returns
   * txid: aCvBmRoD6ARCXjCVJqEHWnrVeH6Ax5Mon5pYgRuz18RnZtWrw
   */
  async writeMemo (message, privateKey, toAddress) {
    try {
      _this.checkConfig()

      if (typeof message !== 'string' || !message.length) {
        throw new Error('Message for the memo must be of type string')
      }
      const memo = _this.binTools.stringToBuffer(message)
      const dust = new _this.BN(1000000)

      const avaxIDBuffer = await _this.xchain.getAVAXAssetID()
      _this.xchain.keyChain().importKey(privateKey)

      const addresses = _this.xchain.keyChain().getAddresses()
      const addressStrings = _this.xchain.keyChain().getAddressStrings()

      if (!addressStrings.length || !addresses.length) {
        throw new Error('No available addresses registered in the keyChain')
      }

      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)
      const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
      const fee = _this.xchain.getTxFee()

      if (balance.lt(fee)) {
        throw new Error('Not enough founds to pay for transaction')
      }

      if (!toAddress) {
        const keypair = _this.xchain
          .keyChain()
          .importKey(_this.config.AVAX_PRIVATE_KEY)
        toAddress = keypair.getAddressString()
      }

      const unsignedTx = await _this.xchain.buildBaseTx(
        utxoSet,
        dust,
        avaxIDBuffer,
        [toAddress],
        addressStrings,
        addressStrings,
        memo
      )

      const tx = unsignedTx.sign(_this.xchain.keyChain())
      const txid = await _this.xchain.issueTx(tx)

      console.log('Check transaction status on the block explorer:')
      console.log(`https://explorer.avax.network/tx/${txid}`)
      return txid
    } catch (err) {
      console.log('Error in avax.js/writeMemo()', err)
      throw err
    }
  }

  /**
   * @api bchAvaxBridge.avax.readMemo() readMemo()
   * @apiName readMemo
   * @apiGroup Avax
   * @apiDescription Reads the memo field on a transaction on the Avalanche X Chain
   *
   * This method expects several environment variables to be set before running.
   * It will throw an error if these environment variables are not set.
   *
   * @apiExample Example usage:
   *
   * (async () => {
   * try {
   *  const txid = 'aCvBmRoD6ARCXjCVJqEHWnrVeH6Ax5Mon5pYgRuz18RnZtWrw'
   *  const memo = await bchAvaxBridge.avax.readMemo(txid)
   *  console.log(`memo: ${memo}`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   *
   * // returns
   * memo: 'This is the memo field'
   */
  async readMemo (txid) {
    try {
      _this.checkConfig()
      if (typeof txid !== 'string' || !txid.length) {
        throw new Error('txid must be of type string')
      }

      const cb58String = await _this.xchain.getTx(txid).catch((e) => 'invalid')
      if (cb58String === 'invalid') {
        throw new Error('the transaction ID is invalid')
      }

      // Create a new Transaction item
      const tx = new _this.avm.Tx()
      // Populate the Transaction item with the data fetched
      tx.fromString(cb58String)

      const unsignedTx = tx.getUnsignedTx()
      const transaction = unsignedTx.getTransaction()
      const memoBuffer = transaction.getMemo()
      // Parse the memo from buffer to String
      const decodedMemo = _this.binTools.bufferToString(memoBuffer)
      const message = `The memo in this transaction is '${decodedMemo}'`
      console.log(message)

      return decodedMemo
    } catch (err) {
      console.log('Error in avax.js/readMemo()', err)
      throw err
    }
  }

  /**
   * @api bchAvaxBridge.avax.parseMemo() parseMemo64()
   * @apiName parseMemo64
   * @apiGroup Avax
   * @apiDescription Transforms the encoded memo message from base64 into a string
   *
   * @apiExample Example usage:
   *
   * (() => {
   * try {
   *  const endocdedMemo = 'U29tZSBtZW1vIHRvIGNoZWNrIGFmdGVy'
   *  const memo = bchAvaxBridge.avax.parseMemo64(endocdedMemo)
   *  console.log(`memo: ${memo}`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   *
   * // returns
   * memo: 'This is the memo field'
   */
  parseMemoFrom64 (encodedMemo) {
    try {
      if (typeof encodedMemo !== 'string' || !encodedMemo.length) {
        throw new Error('the encodedMemo must be of type string')
      }

      const decodedMemo = Buffer.from(encodedMemo, 'base64').toString('utf-8')
      const message = `The decoded memo is '${decodedMemo}'`

      console.log(message)
      return decodedMemo
    } catch (err) {
      console.log('Error in avax.js/parseMemo64()', err)
      throw err
    }
  }

  /**
   * @api bchAvaxBridge.avax.checkConfig() checkConfig()
   * @apiName checkConfig
   * @apiGroup Avax
   * @apiDescription Check that all the requires environment variables are set
   *
   * This method expects several environment variables to be set before running.
   * It will throw an error if these environment variables are not set.
   *
   * @apiExample Example usage:
   *
   * (async () => {
   * try {
   *  bchAvaxBridge.avax.checkConfig()
   *  console.log(`All variables are set`)
   * } catch (error) {
   *  console.error(error)
   * }
   * })()
   */
  checkConfig () {
    try {
      const requiredEnvs = [
        'AVAX_IP',
        'AVAX_PORT',
        'AVAX_PRIVATE_KEY',
        'AVAX_TOKEN'
      ]
      const missingEnvs = requiredEnvs.filter(
        (item) =>
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

  getValidAddress (receiver, fallback) {
    try {
      if (typeof receiver !== 'string' || receiver.length === 0) {
        throw new Error('Invalid receiver')
      }

      let bufferAddress = _this.xchain.parseAddress(receiver)
      if (!bufferAddress) {
        bufferAddress = fallback
      }

      return bufferAddress
    } catch (error) {
      console.log('Failed to parse address returning fallback value:', error.message)
      return fallback
    }
  }

  /**
   * @api bchAvaxBridge.avax.getUTXOIDs() getUTXOIDs()
   * @apiName getUTXOIDs
   * @apiGroup Avax
   * @apiDescription finds the utxos with the minting token
   */
  getUTXOIDs (utxoSet, txid, outputType, assetID) {
    const utxoids = utxoSet.getUTXOIDs()
    return utxoids.reduce((result, id) => {
      if (
        id.includes(txid.slice(0, 10)) &&
        utxoSet.getUTXO(id).getOutput().getOutputID() === outputType &&
        assetID === _this.binTools.cb58Encode(utxoSet.getUTXO(id).getAssetID())
      ) {
        return [...result, id]
      }
      return result
    }, [])
  }
}

module.exports = AvaxLib
