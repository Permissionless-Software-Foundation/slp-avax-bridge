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
    sandbox = sinon.createSandbox()
    mockData = cloneDeep(mockDataLib)
    uut.config = { ...mockData.fakeConfig }
  })

  afterEach(() => sandbox.restore())

  describe('#mintToken', () => {
    it('should throw an error if there are missing environment variables', async () => {
      try {
        const num = 10
        uut.config.AVAX_TOKEN = undefined
        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if num is zero or less', async () => {
      try {
        const num = -10

        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'higher than 0')
      }
    })

    it('should throw an error if AVAX_PRIVATE_KEY doesnt create an address', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox.stub(uut.xchain.keyChain(), 'getAddresses').returns([])
        sandbox.stub(uut.xchain.keyChain(), 'getAddressStrings').returns([])
        const num = 10

        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'No available addresses')
      }
    })

    it('should throw an error if there are no UTXOS', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.emptyUTXOSet })

        const num = 10

        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'no UTXOs')
      }
    })

    it('should throw an error if the wallet doesnt have enought founds', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithoutFee })

        const num = 10

        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'enough founds')
      }
    })

    it('should throw an error if the wallet doesnt have an UTXO with the token', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithoutToken })

        const num = 10

        await uut.mintToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'no UTXOs with the given assetID')
      }
    })

    it('should complete successfully', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithMintToken })
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const num = 10

        const txid = await uut.mintToken(num, mockData.addressStrings[0])
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })

  describe('#burnToken', () => {
    it('should throw an error if there are missing environment variables', async () => {
      try {
        const num = 10
        uut.config.AVAX_TOKEN = undefined
        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if num is zero or less', async () => {
      try {
        const num = -10

        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'higher than 0')
      }
    })

    it('should throw an error if AVAX_PRIVATE_KEY doesnt create an address', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox.stub(uut.xchain.keyChain(), 'getAddresses').returns([])
        sandbox.stub(uut.xchain.keyChain(), 'getAddressStrings').returns([])
        const num = 10

        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'No available addresses')
      }
    })

    it('should throw an error if there are no UTXOS', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.emptyUTXOSet })

        const num = 10

        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'no UTXOs')
      }
    })

    it('should throw an error if the wallet doesnt have enought founds', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithoutFee })

        const num = 10

        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'enough founds')
      }
    })

    it('should throw an error if the token amount in the wallet is already 0', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithoutToken })

        const num = 10

        await uut.burnToken(num)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'is zero already')
      }
    })

    it('should burn all tokens if num is greater than balance', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithToken })
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const num = 10

        const txid = await uut.burnToken(num)
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should complete successfully', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithToken })
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const num = 5

        const txid = await uut.burnToken(num)
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })

  describe('#writeMemo', () => {
    it('should throw an error if there are missing environment variables', async () => {
      try {
        uut.config.AVAX_TOKEN = undefined
        await uut.writeMemo(42, uut.config.AVAX_PRIVATE_KEY)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if message is not a string', async () => {
      try {
        await uut.writeMemo(42, uut.config.AVAX_PRIVATE_KEY)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, ' must be of type string')
      }
    })

    it('should throw an error if AVAX_PRIVATE_KEY doesnt create an address', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox.stub(uut.xchain.keyChain(), 'getAddresses').returns([])
        sandbox.stub(uut.xchain.keyChain(), 'getAddressStrings').returns([])

        await uut.writeMemo(
          'A memo to save in the blockchain',
          uut.config.AVAX_PRIVATE_KEY
        )
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'No available addresses')
      }
    })

    it('should throw an error if the wallet doesnt have enought founds', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').returns(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithoutFee })

        await uut.writeMemo(
          'A memo to save in the blockchain',
          uut.config.AVAX_PRIVATE_KEY
        )
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'enough founds')
      }
    })

    it('should complete using the default address as the transaction receiver', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithToken })
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const txid = await uut.writeMemo(
          'A memo to save in the blockchain',
          uut.config.AVAX_PRIVATE_KEY
        )
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should complete successfully', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAVAXAssetID').resolves(mockData.avaxID)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddresses')
          .returns(mockData.addresses)
        sandbox
          .stub(uut.xchain.keyChain(), 'getAddressStrings')
          .returns(mockData.addressStrings)
        sandbox
          .stub(uut.xchain, 'getUTXOs')
          .resolves({ utxos: mockData.UTXOWithToken })
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const txid = await uut.writeMemo(
          'A memo to save in the blockchain',
          uut.config.AVAX_PRIVATE_KEY,
          'X-avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9'
        )
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })

  describe('#readMemo', () => {
    it('should throw an error if there are missing environment variables', async () => {
      try {
        uut.config.AVAX_TOKEN = undefined
        await uut.readMemo(42)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'Missing environment')
      }
    })

    it('should throw an error if the transaction id is not a string', async () => {
      try {
        await uut.readMemo(42)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'must be of type string')
      }
    })

    it('should throw an error if the transaction id is invalid', async () => {
      try {
        sandbox.stub(uut.xchain, 'getTx').rejects(false)

        await uut.readMemo('somethingsomething')
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'ID is invalid')
      }
    })

    it('should complete successfully', async () => {
      try {
        sandbox.stub(uut.xchain, 'getTx').resolves(mockData.cb58Transaction)

        const txid = await uut.readMemo(mockData.txid)
        assert.typeOf(txid, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })

  describe('#parseMemoFrom64', () => {
    it('should throw an error if there encodedMemo argument is not a string', async () => {
      try {
        await uut.parseMemoFrom64(42)
        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'must be of type string')
      }
    })

    it('should return the pased memo field', async () => {
      try {
        const memo = uut.parseMemoFrom64('U29tZSBtZW1vIHRvIGNoZWNrIGFmdGVy')
        assert.typeOf(memo, 'string')
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })

  describe('#getValidAddress', () => {
    it('should return the fallback value if no wallet is provided', () => {
      try {
        const addr = mockData.addressStrings[0]
        const buffer = uut.xchain.parseAddress(addr)
        const resObj = uut.getValidAddress('', buffer)

        assert.equal(resObj, buffer)
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should return the fallback value if the wallet is invalid', () => {
      try {
        const addr = mockData.addressStrings[0]
        const buffer = uut.xchain.parseAddress(addr)
        const resObj = uut.getValidAddress('clearlynotavalidaddress', buffer)

        assert.equal(resObj, buffer)
      } catch (err) {
        assert.fail('unexpected result')
      }
    })

    it('should return the buffer for the provided address', () => {
      try {
        const addr = mockData.addressStrings[0]
        const address = uut.getValidAddress(addr, null)
        const addrFromBuffer = uut.xchain.addressFromBuffer(address)

        assert.equal(addrFromBuffer, addr)
      } catch (err) {
        assert.fail('unexpected result')
      }
    })
  })
})
