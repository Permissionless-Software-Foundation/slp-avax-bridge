const chai = require('chai')

// Locally global variables.
const assert = chai.assert

// Unit under test
const AVAXLib = require('../../lib/avax')
const uut = new AVAXLib()

describe('#avax.js', () => {
  describe('#mintToken', () => {
    it('should complete successfully and mint the tokens', async () => {
      try {
        const num = 10
        const txid = await uut.mintToken(num)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })

  describe('#burnToken', () => {
    it('should burn the previously created tokens', async () => {
      try {
        const num = 10
        const txid = await uut.burnToken(num)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })

  describe('#writeMemo', () => {
    it('should create a transaction with some dust an a custom message in the memo field', async () => {
      try {
        const key = uut.config.AVAX_PRIVATE_KEY
        const txid = await uut.writeMemo('Memo field for the integration test', key)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })
})
