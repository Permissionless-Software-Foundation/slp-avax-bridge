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
  /**
   * @type {sinon.SinonSandbox}
   */
  let sandbox
  let mockData

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => sandbox.restore())

  describe('#mintSlp', () => {
    it('should throw error if num is zero or less', async () => {
      try {
        const num = -10

        await uut.mintSlp(num)

        assert.equal(true, false, 'unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Token quantity must be a number higher than 0'
        )
      }
    })

    it('should throw error if there are no utxos to work with', async () => {
      try {
        sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.equal(true, false, 'unexpected result')
      } catch (err) {
        assert.include(err.message, 'No UTXOs available :(\nExiting.')
      }
    })

    it('should throw error if there are no BCH utxo to pay miners fee', async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockInvalidUtxos.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockInvalidUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.equal(true, false, 'unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Wallet does not have a BCH UTXO to pay miner fees'
        )
      }
    })

    it("should throw error if the minting-baton utxo can't be found", async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockTokenlessUtxos.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockTokenlessUtxos)

        const num = 5

        await uut.mintSlp(num)

        assert.equal(true, false, 'unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'No token UTXOs for the specified token could be found.'
        )
      }
    })

    it("should throw error if there are't enough founds remainding", async () => {
      try {
        sandbox
          .stub(uut.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(mockData.mockNotEnoughBalance.utxos)
        sandbox
          .stub(uut.bchjs.Electrumx, 'utxo')
          .resolves(mockData.mockNotEnoughBalance)

        const num = 5

        await uut.mintSlp(num)

        assert.equal(true, false, 'unexpected result')
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
})
