const chai = require('chai')
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// Locally global variables.
const assert = chai.assert

// Mocking data libraries.
const mockDataLib = require('./mocks/bch-mocks')

// Unit under test
const BCHLib = require('../../lib/bch')
const uut = new BCHLib()

describe('#bch.js', () => {
  /** @type {sinon.SinonSandbox} */
  let sandbox
  let mockData

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockData = cloneDeep(mockDataLib)
    uut.config = { ...mockData.fakeConfig }
  })

  afterEach(() => sandbox.restore())

  describe('#mintSlp', () => {
    it('should throw an error if any environment variable is missing', async () => {
      try {
        const num = 10
        uut.config.tokenID = undefined
        await uut.mintSlp(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if num is zero or less', async () => {
      try {
        const num = -10

        await uut.mintSlp(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'higher than 0')
      }
    })

    it('should throw an error if there are no utxos to work with', async () => {
      try {
        sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'No UTXOs available :(\nExiting.')
      }
    })

    it('should throw an error if there are no BCH utxo to pay miners fee', async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockInvalidUtxos.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockInvalidUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Wallet does not have a BCH UTXO to pay miner fees'
        )
      }
    })

    it("should throw an error if the minting-baton utxo can't be found", async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockTokenlessUtxos.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockTokenlessUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'No token UTXOs for the specified token could be found.'
        )
      }
    })

    it("should throw an error if there are't enough founds remainding", async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockNotEnoughBalance.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockNotEnoughBalance)

        const num = 5

        await uut.mintSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Selected UTXO does not have enough satoshis'
        )
      }
    })

    it('should complete successfully and mint the tokens', async () => {
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
        .resolves(mockData.mockValidUtxos.utxos)
      sandbox
        .stub(uut.bchjs.Electrumx, 'utxo')
        .resolves(mockData.mockValidUtxos)
      sandbox
        .stub(uut.bchjs.RawTransactions, 'sendRawTransaction')
        .resolves(mockData.mockTxid)

      const num = 5

      const txid = await uut.mintSlp(num)

      assert.typeOf(txid, 'string')
    })
  })

  describe('#burnSlp', () => {
    it('should throw an error if any environment variable is missing', async () => {
      try {
        const num = 10
        uut.config.tokenID = undefined
        await uut.burnSlp(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if num is zero or less', async () => {
      try {
        const num = -14

        await uut.burnSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Token quantity must be a number higher than 0'
        )
      }
    })

    it('should throw an error if there are no utxos avaiable', async () => {
      try {
        sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)

        const num = 14
        await uut.burnSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'No UTXOs to spend!')
      }
    })

    it('should throw an error if there are no BCH utxo to pay miners fee', async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockInvalidUtxos.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockInvalidUtxos)

        const num = 14
        await uut.burnSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Wallet does not have a BCH UTXO to pay miner fees'
        )
      }
    })

    it("should throw an error if there isn't any utxo with the tokenID", async () => {
      try {
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockTokenlessUtxos)
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockTokenlessUtxos.utxos)

        const num = 14
        await uut.burnSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'No token UTXOs for the specified token could be found'
        )
      }
    })

    it("should throw an error if there isn't enough founds to pay the transaction", async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockNotEnoughBalance.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockNotEnoughBalance)

        const num = 101
        await uut.burnSlp(num)

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Selected UTXO does not have enough satoshis'
        )
      }
    })

    it("should throw an error if there isn't enough founds to pay the transaction", async () => {
      sandbox
        .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
        .resolves(mockData.mockValidUtxos.utxos)
      sandbox
        .stub(uut.bchjs.Electrumx, 'utxo')
        .resolves(mockData.mockValidUtxos)
      sandbox
        .stub(uut.bchjs.RawTransactions, 'sendRawTransaction')
        .resolves(mockData.mockTxid)

      const num = 5
      const txid = await uut.burnSlp(num)

      assert.typeOf(txid, 'string')
    })
  })

  describe('#getValidAddress', () => {
    it('should return the fallback value if no wallet is provided', () => {
      try {
        const resObj = uut.getValidAddress('', mockData.legacy)

        assert.equal(resObj, mockData.legacy)
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should return the fallback value if the wallet is invalid', () => {
      try {
        const resObj = uut.getValidAddress('clearlynotavalidaddress', mockData.legacy)

        assert.equal(resObj, mockData.legacy)
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should return the buffer for the provided address', () => {
      try {
        const address = uut.getValidAddress(mockData.bchaddr, 'shouldntreturnthisvalue')

        assert.equal(address, mockData.legacy)
      } catch (err) {
        assert.fail('unexpected result', err)
      }
    })
  })
})
