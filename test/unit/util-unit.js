/*
  Unit tests for the util.js utility library.
*/

// npm libraries
const chai = require('chai')
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// Locally global variables.
const assert = chai.assert

// Mocking data libraries.
const mockDataLib = require('./mocks/util-mocks')

// Unit under test
const UtilLib = require('../../lib/util')
const uut = new UtilLib()

describe('#util.js', () => {
  let sandbox
  let mockData

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    // Clone the mock data.
    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => sandbox.restore())

  describe('#getBchData', () => {
    it('should throw error if address is not a string', async () => {
      try {
        const addr = 1234

        await uut.getBchData(addr)

        assert.equal(true, false, 'unexpected result')
      } catch (err) {
        assert.include(err.message, 'Address must be a string')
      }
    })

    it('should get BCH data on an address', async () => {
      // Mock external dependencies.
      sandbox
        .stub(uut.bchjs.Electrumx, 'balance')
        .resolves(mockData.mockBalance)
      sandbox.stub(uut.bchjs.Electrumx, 'utxo').resolves(mockData.mockUtxos)

      const addr = 'bitcoincash:qp3sn6vlwz28ntmf3wmyra7jqttfx7z6zgtkygjhc7'

      const bchData = await uut.getBchData(addr)
      // console.log(`bchData: ${JSON.stringify(bchData, null, 2)}`)

      // Assert that top-level properties exist.
      assert.property(bchData, 'balance')
      assert.property(bchData, 'utxos')

      // Assert essential UTXOs properties exist.
      assert.isArray(bchData.utxos)
      assert.property(bchData.utxos[0], 'tx_pos')
      assert.property(bchData.utxos[0], 'tx_hash')
      assert.property(bchData.utxos[0], 'value')
    })
  })
})
