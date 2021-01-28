// npm libraries
const chai = require('chai')
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// Locally global variables.
const assert = chai.assert

// Mocking data libraries.
const mockDataLib = require('./mocks/avax-mocks')

// Unit under test
const AvaxLib = require('../../lib/avax')
const uut = new AvaxLib()

describe('#avax.js', () => {
  let sandbox
  let mockData

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    // Clone the mock data.
    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => sandbox.restore())

  describe('#mintTokens', () => {
    it('should throw an error if num is zero or less', async () => {
      try {
        const num = -10

        await uut.mintTokens(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'higher than 0')
      }
    })

    it('should throw an error if balance is lower than the txFee', async () => {
      try {
        sandbox.stub(uut.xchain, 'listAddresses').resolves(mockData.addresses)
        sandbox.stub(uut.xchain, 'getTxFee').resolves(mockData.txFee)
        sandbox.stub(uut.xchain, 'getBalance').resolves(mockData.invalidBalance)
        const num = 10

        await uut.mintTokens(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'enough AVAX to pay')
      }
    })

    it('should issue the transaction successfully', async () => {
      try {
        sandbox.stub(uut.xchain, 'listAddresses').resolves(mockData.addresses)
        sandbox.stub(uut.xchain, 'getTxFee').resolves(mockData.txFee)
        sandbox.stub(uut.xchain, 'getBalance').resolves(mockData.validBalance)
        sandbox.stub(uut.xchain, 'mint').resolves(mockData.txid)
        const num = 10

        const txid = await uut.mintTokens(num)
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })
})
